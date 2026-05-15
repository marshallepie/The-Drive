import * as cheerio from 'cheerio'
import type { Browser } from 'puppeteer'

// ── Puppeteer browser singleton ───────────────────────────────────────────────
let _browser: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (_browser?.connected) return _browser
  const puppeteer = (await import('puppeteer')).default
  _browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--disable-extensions',
      '--disable-background-networking',
    ],
  })
  _browser.on('disconnected', () => { _browser = null })
  return _browser
}

async function fetchRenderedHtml(url: string): Promise<string> {
  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    await page.setUserAgent(HEADERS['User-Agent'])
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-GB,en;q=0.9' })

    // Block actual image/font/media downloads — we only need the DOM with img src attrs
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      const type = req.resourceType()
      if (type === 'font' || type === 'media') {
        req.abort()
      } else {
        req.continue()
      }
    })

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    // Scroll through the page to trigger intersection-observer lazy loaders
    await page.evaluate(() => new Promise<void>((resolve) => {
      /* eslint-disable no-undef */
      let scrolled = 0
      const step = 400
      const timer = (globalThis as any).setInterval(() => {
        ;(globalThis as any).window.scrollBy(0, step)
        scrolled += step
        if (scrolled >= (globalThis as any).document.body.scrollHeight) {
          ;(globalThis as any).clearInterval(timer)
          resolve()
        }
      }, 120)
    }))

    await new Promise(r => setTimeout(r, 800))
    return await page.content()
  } finally {
    await page.close()
  }
}

// Shut the browser down cleanly when the process exits
process.on('exit', () => { _browser?.close() })
process.on('SIGTERM', () => { _browser?.close() })

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
  if (t.includes('AUTO') || t.includes('CVT')) return 'AUTOMATIC'
  if (t.includes('MANUAL')) return 'MANUAL'
  if (t.includes('SEMI')) return 'SEMI_AUTOMATIC'
  return null
}

function parsePrice(raw: string): { price: number | null; currency: string } {
  if (!raw) return { price: null, currency: 'GBP' }
  const currency = raw.includes('$') ? 'USD' : raw.includes('€') ? 'EUR' : 'GBP'
  // Match a currency symbol followed by digits — avoids concatenating all digits in a full card text
  const match = raw.match(/[£$€]\s*([\d,]+(?:\.\d{0,2})?)/) ||
                raw.match(/([\d,]+(?:\.\d{0,2})?)\s*(?:GBP|USD|EUR)/)
  if (!match) return { price: null, currency }
  const num = parseFloat(match[1].replace(/,/g, ''))
  return { price: isNaN(num) || num > 100_000_000 ? null : num, currency }
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

// Collects all images from a card element, covering lazy-load patterns
function pickAllImgSrcs(el: cheerio.Cheerio<any>, baseUrl: string): string[] {
  const seen = new Set<string>()

  const add = (src: string) => {
    if (!src || src.startsWith('data:')) return
    if (/placeholder|spinner|loading\.gif|blank\.|spacer\./i.test(src)) return
    const resolved = resolveImage(src, baseUrl)
    if (resolved) seen.add(resolved)
  }

  // 1. All <img> elements — check every known lazy-load attribute
  el.find('img').each((_, imgEl) => {
    const a = (imgEl as any).attribs || {}
    const w = parseInt(a.width || '0')
    const h = parseInt(a.height || '0')
    if ((w > 0 && w < 60) || (h > 0 && h < 60)) return // skip icons

    add(
      a.src || a['data-src'] || a['data-lazy-src'] || a['data-lazy'] ||
      a['data-original'] || a['data-image'] || a['data-url'] || a['data-img'] ||
      a['data-full-url'] || a['data-hi-res-src'] ||
      (a.srcset || '').split(/[\s,]+/).find((s: string) => s.startsWith('http') || s.startsWith('/')) ||
      (a['data-srcset'] || '').split(/[\s,]+/).find((s: string) => s.startsWith('http') || s.startsWith('/')) ||
      ''
    )
  })

  // 2. <noscript> tags — lazy-load fallbacks (WordPress, WooCommerce, etc.)
  el.find('noscript').each((_, ns) => {
    const html = (ns as any).children?.[0]?.data || ''
    const m = html.match(/src=["']([^"']+)["']/)
    if (m) add(m[1])
  })

  // 3. data-* on non-img elements (gallery slides, carousel items)
  el.find('[data-src],[data-image],[data-lazy],[data-lazy-src],[data-original]').each((_, node) => {
    if ((node as any).name === 'img') return
    const a = (node as any).attribs || {}
    add(a['data-src'] || a['data-image'] || a['data-lazy'] || a['data-lazy-src'] || a['data-original'] || '')
  })

  // 4. CSS background-image on any child element
  el.find('[style]').each((_, node) => {
    const style = (node as any).attribs?.style || ''
    const m = style.match(/background-image\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/)
    if (m) add(m[1])
  })

  return Array.from(seen).slice(0, 10)
}

function parseYear(raw: string | number): number | null {
  const n = parseInt(String(raw))
  if (isNaN(n) || n < 1900 || n > new Date().getFullYear() + 2) return null
  return n
}

// Find the first plausible car year in any text string
function extractYearFromText(text: string): number | null {
  const m = text.match(/\b(19[5-9]\d|20[0-2]\d)\b/)
  return m ? parseYear(m[1]) : null
}

// Extract a labelled value from spec tables / definition lists
function extractSpecValue(el: cheerio.Cheerio<any>, $: cheerio.CheerioAPI, labels: string[]): string | null {
  let found: string | null = null
  el.find('tr, .spec-row, [class*="spec-item"], [class*="detail-item"]').each((_, row) => {
    if (found) return
    const cells = $(row).find('td, dd, span, div')
    if (cells.length >= 2) {
      const key = $(cells.get(0)).text().trim().toLowerCase()
      if (labels.some(l => key.includes(l))) found = $(cells.get(1)).text().trim()
    }
  })
  el.find('dl').each((_, dl) => {
    if (found) return
    $(dl).find('dt').each((_, dt) => {
      if (found) return
      const key = $(dt).text().trim().toLowerCase()
      if (labels.some(l => key.includes(l))) found = $(dt).next('dd').text().trim()
    })
  })
  return found && found.length > 0 && found.length < 200 ? found : null
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
      const cardImages = pickAllImgSrcs(card, baseUrl)

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
        images: cardImages,
        sourceUrl: '',
        confidence: 'medium',
      })
    } catch { /* skip malformed card */ }
  })
  return results
}

// ── Single vehicle listing page parser ───────────────────────────────────────
function parseSingleVehiclePage(html: string, $: cheerio.CheerioAPI, baseUrl: string): ScrapedVehicle[] {
  const bodyText = $('body').text()
  const { price, currency } = parsePrice(bodyText)
  if (!price) return []

  const title = $('h1').first().text().trim() || $('h2').first().text().trim()
  if (!title) return []

  const year = extractYearFromText(title) || extractYearFromText(bodyText.substring(0, 3000))
  const titleClean = year
    ? title.replace(new RegExp(`\\b${year}\\b`), '').replace(/^[,\s]+|[,\s]+$/g, '').trim()
    : title
  const parts = titleClean.split(/[\s,]+/).filter(Boolean)
  if (!parts[0]) return []

  const make = parts[0]
  const model = parts.slice(1).join(' ')

  // Use the main content area for targeted extraction
  const main = $('main, article, [class*="content"], [class*="detail"], [role="main"]').first()
  const scope = main.length ? main : $('body')

  const mileage = parseMileage(bodyText.match(/([\d,]+)\s*(?:miles|mi)\b/i)?.[1] || '')
  const fuelRaw = bodyText.match(/petrol|diesel|electric|hybrid/i)?.[0] || ''
  const transRaw = bodyText.match(/automatic|manual|semi[- ]auto/i)?.[0] || ''
  const color = extractSpecValue(scope, $, ['colour', 'color', 'exterior colour', 'ext. colour', 'paint'])
  const engineSize = extractSpecValue(scope, $, ['engine', 'engine size', 'displacement', 'capacity'])
    || bodyText.match(/(\d+\.?\d*)\s*(?:litre|liter|L)\b/i)?.[0] || null

  // Description: longest text block in main content, excluding navs/footers
  const descCandidates: string[] = []
  scope.find('p, [class*="desc"], [class*="summary"]').each((_, el) => {
    const t = $(el).text().trim()
    if (t.length > 80 && t.length < 5000) descCandidates.push(t)
  })
  const description = descCandidates.sort((a, b) => b.length - a.length)[0] || null

  const images = pickAllImgSrcs(scope, baseUrl)

  return [{
    make, model, year,
    price, currency,
    mileage,
    fuelType: normaliseFuel(fuelRaw),
    transmission: normaliseTransmission(transRaw),
    color,
    engineSize,
    description,
    images,
    sourceUrl: baseUrl,
    confidence: 'medium',
  }]
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

      // Year: search heading first (any position), then fall back to card text
      const year = extractYearFromText(heading) || extractYearFromText(card.text())

      // Build make/model by removing the year token from the heading
      const headingClean = year
        ? heading.replace(new RegExp(`\\b${year}\\b`), '').replace(/^[,\s]+|[,\s]+$/g, '').trim()
        : heading
      const parts = headingClean.split(/[\s,]+/).filter(Boolean)
      if (parts.length < 1) return

      const make = parts[0]
      const model = parts.slice(1).join(' ')

      const { price, currency } = parsePrice(card.text())
      const mileage = parseMileage(card.text().match(/([\d,]+)\s*(miles|mi)/i)?.[1] || '')
      const fuelRaw = card.text().match(/petrol|diesel|electric|hybrid/i)?.[0] || ''
      const transRaw = card.text().match(/automatic|manual|semi[- ]auto/i)?.[0] || ''
      const color = extractSpecValue(card, $, ['colour', 'color', 'exterior colour', 'paint'])
      const engineSize = extractSpecValue(card, $, ['engine', 'engine size', 'capacity'])
        || card.text().match(/(\d+\.?\d*)\s*(?:litre|liter|L)\b/i)?.[0] || null

      // Description: longest paragraph in the card
      const descCandidates: string[] = []
      card.find('p, [class*="desc"], [class*="summary"]').each((_, p) => {
        const t = $(p).text().trim()
        if (t.length > 60) descCandidates.push(t)
      })
      const description = descCandidates.sort((a, b) => b.length - a.length)[0] || null

      const cardImages = pickAllImgSrcs(card, baseUrl)

      // Capture the card's own detail-page link so we can fetch its full gallery later
      const cardHref = card.find('a[href]').first().attr('href') || ''
      let sourceUrl = ''
      if (cardHref) {
        try { sourceUrl = new URL(cardHref, baseUrl).href } catch { sourceUrl = '' }
      }

      results.push({
        make, model, year,
        price, currency,
        mileage,
        fuelType: normaliseFuel(fuelRaw),
        transmission: normaliseTransmission(transRaw),
        color,
        engineSize,
        description,
        images: cardImages,
        sourceUrl,
        confidence: 'low',
      })
    } catch { /* skip */ }
  })

  // If the card-based heuristics found nothing, treat the page as a single vehicle listing
  if (results.length === 0) return parseSingleVehiclePage(html, $, baseUrl)

  return results
}

// ── Main entry point ──────────────────────────────────────────────────────────
export class ScraperService {
  static async scrapeUrl(url: string): Promise<{ vehicles: ScrapedVehicle[]; warning?: string }> {
    const urlLower = url.toLowerCase()
    let warning: string | undefined

    // ── Pass 1: static fetch (fast) ───────────────────────────────────────────
    let vehicles = await ScraperService._parseHtml(
      await ScraperService._fetchStatic(url),
      url,
      urlLower,
    )

    // ── Pass 2: headless browser fallback (JS-rendered sites) ─────────────────
    if (vehicles.length === 0 && !urlLower.includes('autotrader.co.uk')) {
      try {
        vehicles = await ScraperService._parseHtml(
          await fetchRenderedHtml(url),
          url,
          urlLower,
        )
        if (vehicles.length > 0) {
          warning = 'Page required JavaScript rendering — results may take a moment on first load.'
        }
      } catch {
        // headless failed — carry on with empty result
      }
    }

    if (urlLower.includes('autotrader.co.uk') && vehicles.length === 0) {
      warning = 'AutoTrader dealer pages require a browser to render. Try pasting the URL of an individual car listing instead, or paste your own dealer website URL.'
    }

    // Deduplicate by make+model+year+price
    const seen = new Set<string>()
    vehicles = vehicles.filter((v) => {
      const key = `${v.make}|${v.model}|${v.year}|${v.price}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    vehicles = vehicles.filter((v) => v.make && v.make.length > 1)

    // ── Pass 3: follow each vehicle's detail-page link to collect its full gallery ──
    await ScraperService._enrichImages(vehicles, url)

    return { vehicles, warning }
  }

  private static async _fetchStatic(url: string, timeout = 15000): Promise<string> {
    try {
      const res = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(timeout),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (err: any) {
      throw new Error(`Could not fetch page: ${err.message}`)
    }
  }

  // Extract all images from a vehicle detail page (JSON-LD first, then DOM)
  private static _extractDetailImages(html: string, pageUrl: string): string[] {
    const fromJsonLd = extractJsonLd(html, pageUrl)
    if (fromJsonLd[0]?.images.length > 0) return fromJsonLd[0].images
    const $ = cheerio.load(html)
    const main = $('main, article, [class*="content"], [class*="detail"], [role="main"]').first()
    return pickAllImgSrcs(main.length ? main : $('body'), pageUrl)
  }

  // Follow each vehicle's source URL to collect its full image gallery
  private static async _enrichImages(vehicles: ScrapedVehicle[], indexUrl: string): Promise<void> {
    const toEnrich = vehicles.filter(
      v => v.images.length < 2 && v.sourceUrl && v.sourceUrl !== indexUrl
    ).slice(0, 12) // cap at 12 concurrent detail-page fetches

    if (toEnrich.length === 0) return

    await Promise.all(toEnrich.map(async (v) => {
      try {
        const html = await ScraperService._fetchStatic(v.sourceUrl, 10000)
        const imgs = ScraperService._extractDetailImages(html, v.sourceUrl)
        if (imgs.length > v.images.length) v.images = imgs
      } catch { /* skip — keep whatever image(s) we already have */ }
    }))
  }

  private static _parseHtml(html: string, url: string, urlLower: string): ScrapedVehicle[] {
    const $ = cheerio.load(html)

    let vehicles: ScrapedVehicle[]
    if (urlLower.includes('autotrader.co.uk')) {
      vehicles = parseAutoTraderDealer(html, url)
      if (vehicles.length === 0) vehicles = extractJsonLd(html, url)
    } else if (urlLower.includes('motors.co.uk')) {
      vehicles = parseMotors(html, $, url)
      if (vehicles.length === 0) vehicles = extractJsonLd(html, url)
    } else {
      vehicles = parseGeneric(html, $, url)
    }

    // Single-vehicle page with no image: try og:image
    if (vehicles.length === 1 && vehicles[0].images.length === 0) {
      const ogImg = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="og:image"]').attr('content') || ''
      if (ogImg) vehicles[0].images = [resolveImage(ogImg, url)]
    }

    return vehicles
  }
}
