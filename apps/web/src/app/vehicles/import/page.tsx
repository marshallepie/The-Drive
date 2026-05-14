'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api/client'
import { formatCurrency } from '@drive/shared'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function proxyImage(url: string): string {
  if (!url) return ''
  return `${API_BASE}/api/v1/import/proxy-image?url=${encodeURIComponent(url)}`
}

interface ScrapedVehicle {
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

const CONFIDENCE_LABEL = {
  high: { label: 'High accuracy', cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  medium: { label: 'Medium accuracy', cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  low: { label: 'Needs review', cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
}

const EXAMPLE_URLS = [
  { label: 'Your dealer website', placeholder: 'https://www.yourdealership.co.uk/used-cars' },
  { label: 'AutoTrader listing', placeholder: 'https://www.autotrader.co.uk/car-details/...' },
  { label: 'Motors.co.uk listing', placeholder: 'https://www.motors.co.uk/car-...' },
]

export default function ImportPage() {
  const { isAuthenticated } = useAuth()

  const [url, setUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState('')
  const [warning, setWarning] = useState('')
  const [vehicles, setVehicles] = useState<ScrapedVehicle[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ created: number; failed: number } | null>(null)

  const handleScrape = async () => {
    const trimmed = url.trim()
    if (!trimmed) return
    setScraping(true)
    setScrapeError('')
    setWarning('')
    setVehicles([])
    setSelected(new Set())
    setImportResult(null)

    try {
      const res = await apiClient.post('/api/v1/import/scrape', { url: trimmed })
      if (res.data.status === 'success') {
        setVehicles(res.data.data.vehicles)
        if (res.data.data.warning) setWarning(res.data.data.warning)
        if (res.data.data.vehicles.length === 0 && !res.data.data.warning) {
          setWarning('No vehicles found on that page. The site may require JavaScript to load — try pasting an individual listing URL instead.')
        }
        // Select all by default
        setSelected(new Set(res.data.data.vehicles.map((_: any, i: number) => i)))
      }
    } catch (err: any) {
      setScrapeError(err.response?.data?.message || 'Failed to fetch that page')
    } finally {
      setScraping(false)
    }
  }

  const toggleSelect = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === vehicles.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(vehicles.map((_, i) => i)))
    }
  }

  const handleImport = async () => {
    const toImport = vehicles.filter((_, i) => selected.has(i))
    if (toImport.length === 0) return
    setImporting(true)

    try {
      const res = await apiClient.post('/api/v1/import/confirm', { vehicles: toImport })
      if (res.data.status === 'success') {
        setImportResult({ created: res.data.data.created, failed: res.data.data.failed })
        setVehicles([])
        setSelected(new Set())
      }
    } catch (err: any) {
      setScrapeError(err.response?.data?.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <p className="text-gray-400">You must be logged in to import vehicles.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Import Stock</h1>
          <p className="text-gray-400">
            Paste a URL from your existing dealer page or an individual listing and we'll pre-fill your stock automatically.
          </p>
        </div>

        {/* URL Input */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Source URL</p>

          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
              placeholder="https://www.yourdealership.co.uk/used-cars"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
            />
            <button
              onClick={handleScrape}
              disabled={scraping || !url.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex-shrink-0 flex items-center gap-2"
            >
              {scraping ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Scanning…
                </>
              ) : 'Scan Page'}
            </button>
          </div>

          {/* Example URLs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLE_URLS.map((e) => (
              <span key={e.label} className="text-xs text-gray-600 bg-gray-800 rounded-full px-3 py-1">
                {e.label}
              </span>
            ))}
          </div>

          <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-blue-400">
            <span className="font-semibold">Tip:</span> Works best with your own dealer website, or individual listing pages from AutoTrader/Motors.co.uk. All imported vehicles are saved as <span className="font-semibold">drafts</span> for you to review before publishing.
          </div>
        </div>

        {/* Errors / Warnings */}
        {scrapeError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
            {scrapeError}
          </div>
        )}
        {warning && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl px-4 py-3 text-sm mb-6">
            {warning}
          </div>
        )}

        {/* Import Success */}
        {importResult && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-1">Import complete</h2>
            <p className="text-gray-400 text-sm mb-4">
              {importResult.created} vehicle{importResult.created !== 1 ? 's' : ''} saved as drafts.
              {importResult.failed > 0 && ` ${importResult.failed} could not be imported.`}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
              >
                View in Dashboard
              </Link>
              <button
                onClick={() => { setUrl(''); setImportResult(null) }}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
              >
                Import More
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Preview Grid */}
        {vehicles.length > 0 && (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAll}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {selected.size === vehicles.length ? 'Deselect all' : 'Select all'}
                </button>
                <span className="text-gray-600 text-sm">
                  {selected.size} of {vehicles.length} selected
                </span>
              </div>
              <button
                onClick={handleImport}
                disabled={importing || selected.size === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                {importing ? 'Importing…' : `Import ${selected.size} Vehicle${selected.size !== 1 ? 's' : ''}`}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((v, i) => {
                const conf = CONFIDENCE_LABEL[v.confidence]
                const isSelected = selected.has(i)
                return (
                  <div
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className={`bg-gray-900 border rounded-xl overflow-hidden cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    {/* Image */}
                    <div className="aspect-video bg-gray-800 relative">
                      {v.images[0] ? (
                        <img src={proxyImage(v.images[0])} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 text-sm">No image</div>
                      )}
                      {/* Checkbox overlay */}
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'bg-black/40 border-white/40'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </div>
                      {/* Confidence badge */}
                      <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${conf.cls}`}>
                        {conf.label}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <p className="font-semibold">
                        {v.year && `${v.year} `}{v.make} {v.model}
                      </p>
                      {v.price ? (
                        <p className="text-blue-400 font-bold mt-0.5">
                          {formatCurrency(v.price, v.currency)}
                        </p>
                      ) : (
                        <p className="text-gray-600 text-sm mt-0.5">Price not found</p>
                      )}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                        {v.mileage !== null && <span>{v.mileage.toLocaleString()} miles</span>}
                        {v.fuelType && <span>{v.fuelType}</span>}
                        {v.transmission && <span>{v.transmission}</span>}
                        {v.engineSize && <span>{v.engineSize}</span>}
                      </div>
                      {v.sourceUrl && (
                        <a
                          href={v.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-500 hover:text-blue-400 mt-2 inline-block truncate max-w-full"
                        >
                          View original →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom import bar */}
            <div className="sticky bottom-4 mt-6">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
                <div>
                  <p className="font-semibold">{selected.size} vehicle{selected.size !== 1 ? 's' : ''} selected</p>
                  <p className="text-xs text-gray-500 mt-0.5">Will be saved as drafts — review and publish from your dashboard</p>
                </div>
                <button
                  onClick={handleImport}
                  disabled={importing || selected.size === 0}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-7 py-3 rounded-xl transition-colors"
                >
                  {importing ? 'Importing…' : 'Import Selected'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
