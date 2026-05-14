import * as cheerio from 'cheerio'

export interface ScrapedVehicle {
  make: string
  model: string
  year: number | null
  price: number | null
  currency: string
  mileage: number | null
  fuelType: string | null
  transmission: string | null
  color: string | null
  engineSize: string | null
  description: string | null
  images: string[]
  sourceUrl: string
  confidence: 'high' | 'medium' | 'low'
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
}

// ── Fuel type normaliser ──────────────────────────────────────────────────────
function normaliseFuel(raw: string): string | null {
  if (!raw) return null
  const f = raw.toUpperCase()
  if (f.includes('PLUG') || f.includes('PHEV')) return 'PLUG_IN_HYBRID'
  if (f.includes('HYBRID')) return 'HYBRID'
  if (f.includes('ELECTRIC') || f.includes('EV')) return 'ELECTRIC'
  if (f.includes('DIESEL')) return 'DIESEL'
  if (f.includes('PETROL') || f.includes('GASOLINE')) return 'PETROL'
  return null
}

function normaliseTransmission(raw: string): string | null {
  if (!raw) return null
  const t = raw.toUpperCase()
  if (t.includes('AUTO')) return 'AUTOMATIC'
  if (t.includes('MANUAL')) return 'MANUAL'
  if (t.includes('CVT')) return 'CVT'
  if (t.includes('SEMI')) return 'SEMI_AUTOMATIC'
  return null
}

function parsePrice(raw: string): { price: number | null; currency: string } {
  if (!raw) return { price: null, currency: 'GBP' }
  const currency = raw.includes('$') ? 'USD' : raw.includes('€') ? 'EUR' : 'GBP'
  const num = parseFloat(raw.replace(/[^0-9.]/g, ''))
  return { price: isNaN(num) ? null : num, currency }
}

function parseMileage(raw: string): number | null {
  if (!raw) return null
  const num = parseFloat(raw.replace(/[^0-9]/g, ''))
  return isNaN(num) ? null : num
}

function resolveImage(src: string, baseUrl: string): string {
  if (!src || src.startsWith('data:')) return ''
  if (src.startsWith('//')) return 'https:' + src
  if (src.startsWith('http')) return src
  try { return new URL(src, baseUrl).href } catch { return '' }
}

// Extracts the best image URL from an element, covering common lazy-load patterns
function pickImgSrc(el: cheerio.Cheerio<any>, baseUrl: string): string {
  // 1. Standard and lazy-load img attributes
  const img = el.find('img').first()
  const src =
    img.attr('src') ||
    img.attr('data-src') ||
    img.attr('data-lazy-src') ||
    img.attr('data-lazy') ||
    img.attr('data-original') ||
    img.attr('data-image') ||
    img.attr('data-url') ||
    img.attr('data-img') ||
    img.attr('data-full-url') ||
    img.attr('data-hi-res-src') ||
    img.attr('data-srcset')?.split(/[\s,]+/).find((s: string) => s.startsWith('http') || s.startsWith('/')) ||
    img.attr('srcset')?.split(/[\s,]+/).find((s: string) => s.startsWith('http') || s.startsWith('/')) ||
    ''
  if (src && !src.startsWith('data:')) return resolveImage(src, baseUrl)

  // 2. <noscript> lazy-load fallback (very common in WordPress/WooCommerce sites)
  const noscriptHtml = el.find('noscript').first().text()
  if (noscriptHtml) {
    const m = noscriptHtml.match(/src=["']([^"']+)["']/)
    if (m && m[1] && !m[1].startsWith('data:')) return resolveImage(m[1], baseUrl)
  }

  // 3. background-image CSS on any child element
  let bgUrl = ''
  el.find('[style]').each((_, el2) => {
    if (bgUrl) return
    const style = (el2 as any).attribs?.style || ''
    const m = style.match(/background-image\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/)
    if (m) bgUrl = m[1]
  })
  if (bgUrl) return resolveImage(bgUrl, baseUrl)

  // 4. Any <a> or <div> with a data attribute that looks like an image URL
  let dataImgUrl = ''
  el.find('[data-src],[data-image],[data-lazy],[data-lazy-src],[data-original]').each((_, node) => {
    if (dataImgUrl) return
    const attrs = (node as any).attribs || {}
    const val = attrs['data-src'] || attrs['data-image'] || attrs['data-lazy'] || attrs['data-lazy-src'] || attrs['data-original'] || ''
    if (val && !val.startsWith('data:')) dataImgUrl = val
  })
  return dataImgUrl ? resolveImage(dataImgUrl, baseUrl) : ''
}

function parseYear(raw: string | number): number | null {
  const n = parseInt(String(raw))
  if (isNaN(n) || n < 1900 || n > new Date().getFullYear() + 2) return null
  return n
}

// ── JSON-LD extractor (schema.org/Car or Product) ────────────────────────────
function extractJsonLd(html: string, baseUrl = ''): ScrapedVehicle[] {
  const results: ScrapedVehicle[] = []
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1])
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        const type = (item['@type'] || '').toLowerCase()
        if (!['car', 'product', 'vehicle', 'automobilevehicle'].includes(type)) continue

        const nameRaw: string = item.name || ''
        const parts = nameRaw.split(' ')
        const yearCandidate = parseYear(parts[0])
        const nameParts = yearCandidate ? parts.slice(1) : parts
        const make = item.brand?.name || nameParts[0] || ''
        const model = nameParts.slice(1).join(' ') || item.model || ''

        const offerPrice = item.offers?.price || item.offers?.[0]?.price || null
        const { price, currency } = offerPrice
          ? { price: parseFloat(String(offerPrice)), currency: item.offers?.priceCurrency || item.offers?.[0]?.priceCurrency || 'GBP' }
          : parsePrice(String(item.price || ''))

        const images: string[] = []
        if (item.image) {
          const imgs = Array.isArray(item.image) ? item.image : [item.image]
          images.push(...imgs
            .filter((i: any) => typeof i === 'string')
            .map((i: string) => resolveImage(i, baseUrl))
            .filter(Boolean))
        }

        results.push({
          make: make.trim(),
          model: model.trim(),
          year: parseYear(item.vehicleModelDate || item.modelDate || (yearCandidate ? String(yearCandidate) : '')),
          price,
          currency,
          mileage: item.mileageFromOdometer?.value ? parseMileage(String(item.mileageFromOdometer.value)) : null,
          fuelType: normaliseFuel(item.fuelType || ''),
          transmission: normaliseTransmission(item.vehicleTransmission || ''),
          color: item.color || null,
          engineSize: item.engineDisplacement || item.engineSize || null,
          description: item.description || null,
          images,
          sourceUrl: item.url || '',
          confidence: 'high',
        })
      }
    } catch {
      // malformed JSON-LD — skip
    }
  }
  return results
}

// ── Next.js __NEXT_DATA__ extractor ─────────────────────────────────────────
function extractNextData(html: string): any | null {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return null
  try { return JSON.parse(match[1]) } catch { return null }
}

// ── AutoTrader dealer page parser ────────────────────────────────────────────
function parseAutoTraderDealer(html: string, baseUrl: string): ScrapedVehicle[] {
  const next = extractNextData(html)
  if (!next) return []

  const results: ScrapedVehicle[] = []
  try {
    // AutoTrader embeds listings in props.pageProps.initialData.search.listings
    const listings =
      next?.props?.pageProps?.initialData?.search?.listings ||
      next?.props?.pageProps?.listings ||
      []

    for (const l of listings) {
      const v = l.vehicle || l
      const { price, currency } = parsePrice(String(v.price?.displayPrice || v.price || ''))
      results.push({
        make: v.make || '',
        model: v.model || '',
        year: parseYear(v.year || v.yearOfManufacture || ''),
        price,
        currency,
        mileage: parseMileage(String(v.mileage?.mileage || v.mileage || '')),
        fuelType: normaliseFuel(v.fuelType || v.fuel || ''),
        transmission: normaliseTransmission(v.transmission || ''),
        color: v.colour || v.color || null,
        engineSize: v.engineSize || null,
        description: v.description || null,
        images: (v.images || []).map((i: any) => resolveImage(typeof i === 'string' ? i : i?.url || i?.src || '', baseUrl)).filter(Boolean),
        sourceUrl: `https://www.autotrader.co.uk${v.link || ''}`,
        confidence: 'high',
      })
    }
  } catch { /* continue */ }
  return results
}

// ── Motors.co.uk parser ──────────────────────────────────────────────────────
function parseMotors(html: string, $: cheerio.CheerioAPI, baseUrl: string): ScrapedVehicle[] {
  const results: ScrapedVehicle[] = []
  $('.vehicle-card, .car-listing, [data-vehicle-id], .search-result-item').each((_, el) => {
    try {
      const card = $(el)
      const titleRaw = card.find('h2, h3, .vehicle-title, .car-title').first().text().trim()
      const parts = titleRaw.split(' ')
      const year = parseYear(parts[0])
      const rest = year ? parts.slice(1) : parts
      const make = rest[0] || ''
      const model = rest.slice(1).join(' ') || ''
      const priceRaw = card.find('.price, .vehicle-price, [class*="price"]').first().text().trim()
      const { price, currency } = parsePrice(priceRaw)
      const mileageRaw = card.find('[class*="mileage"], [class*="odometer"]').first().text().trim()
      const fuelRaw = card.find('[class*="fuel"]').first().text().trim()
      const transRaw = card.find('[class*="transmission"]').first().text().trim()
      const imgUrl = pickImgSrc(card, baseUrl)

      if (!make) return
      results.push({
        make, model,
        year,
        price, currency,
        mileage: parseMileage(mileageRaw),
        fuelType: normaliseFuel(fuelRaw),
        transmission: normaliseTransmission(transRaw),
        color: null,
        engineSize: null,
        description: null,
        images: imgUrl ? [imgUrl] : [],
        sourceUrl: '',
        confidence: 'medium',
      })
    } catch { /* skip malformed card */ }
  })
  return results
}

// ── Generic dealer website parser ────────────────────────────────────────────
function parseGeneric(html: string, $: cheerio.CheerioAPI, baseUrl: string): ScrapedVehicle[] {
  // First try JSON-LD
  const fromJsonLd = extractJsonLd(html, baseUrl)
  if (fromJsonLd.length > 0) return fromJsonLd

  // Try Next.js data
  const next = extractNextData(html)
  if (next) {
    const at = parseAutoTraderDealer(html, baseUrl)
    if (at.length > 0) return at
  }

  // Generic CSS heuristics — look for repeated article/li/div patterns that contain price
  const results: ScrapedVehicle[] = []
  const candidates = $('article, [class*="listing"], [class*="vehicle"], [class*="car-card"], [class*="result"]')
    .filter((_, el) => {
      const text = $(el).text()
      return /£[\d,]+|[\d,]+ miles|\d{4}/.test(text)
    })

  candidates.each((_, el) => {
    try {
      const card = $(el)
      const heading = card.find('h1,h2,h3,h4').first().text().trim()
      if (!heading) return
      const parts = heading.split(/\s+/)
      const year = parseYear(parts[0])
      const rest = year ? parts.slice(1) : parts
      const { price, currency } = parsePrice(card.text())
      const mileage = parseMileage(card.text().match(/([\d,]+)\s*(miles|mi)/i)?.[1] || '')
      const fuelRaw = card.text().match(/petrol|diesel|electric|hybrid/i)?.[0] || ''
      const imgUrl = pickImgSrc(card, baseUrl)

      if (rest.length < 2) return
      results.push({
        make: rest[0],
        model: rest.slice(1).join(' '),
        year,
        price, currency,
        mileage,
        fuelType: normaliseFuel(fuelRaw),
        transmission: null,
        color: null,
        engineSize: null,
        description: null,
        images: imgUrl ? [imgUrl] : [],
        sourceUrl: '',
        confidence: 'low',
      })
    } catch { /* skip */ }
  })

  return results
}

// ── Main entry point ──────────────────────────────────────────────────────────
export class ScraperService {
  static async scrapeUrl(url: string): Promise<{ vehicles: ScrapedVehicle[]; warning?: string }> {
    let html: string
    try {
      const res = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      html = await res.text()
    } catch (err: any) {
      throw new Error(`Could not fetch page: ${err.message}`)
    }

    const $ = cheerio.load(html)
    const urlLower = url.toLowerCase()
    let vehicles: ScrapedVehicle[] = []
    let warning: string | undefined

    if (urlLower.includes('autotrader.co.uk')) {
      vehicles = parseAutoTraderDealer(html, url)
      if (vehicles.length === 0) {
        // AutoTrader dealer pages are heavily JS-rendered — try JSON-LD (works for individual listings)
        vehicles = extractJsonLd(html)
        if (vehicles.length === 0) {
          warning = 'AutoTrader dealer pages require a browser to render. Try pasting the URL of an individual car listing instead, or paste your own dealer website URL.'
        }
      }
    } else if (urlLower.includes('motors.co.uk')) {
      vehicles = parseMotors(html, $, url)
      if (vehicles.length === 0) vehicles = extractJsonLd(html, url)
    } else {
      vehicles = parseGeneric(html, $, url)
    }

    // Deduplicate by make+model+year+price
    const seen = new Set<string>()
    vehicles = vehicles.filter((v) => {
      const key = `${v.make}|${v.model}|${v.year}|${v.price}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Only return vehicles with at least a make
    vehicles = vehicles.filter((v) => v.make && v.make.length > 1)

    // For the single-vehicle case: if one vehicle and no image, try og:image
    if (vehicles.length === 1 && vehicles[0].images.length === 0) {
      const ogImg = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="og:image"]').attr('content') || ''
      if (ogImg) vehicles[0].images = [resolveImage(ogImg, url)]
    }

    return { vehicles, warning }
  }
}
