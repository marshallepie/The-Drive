'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api/client'
import ImageUpload from '@/components/ImageUpload'

interface DvlaResult {
  registrationNumber: string
  make: string
  yearOfManufacture: number | null
  mappedFuelType: string
  colour: string
  engineSize: string
  motStatus: string | null
  motExpiryDate: string | null
  taxStatus: string | null
  taxDueDate: string | null
  co2Emissions: number | null
  euroStatus: string | null
}

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-sm font-medium text-gray-300 mb-1.5'

export default function NewVehiclePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Plate lookup state
  const [plate, setPlate] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [dvlaResult, setDvlaResult] = useState<DvlaResult | null>(null)
  const [testMode, setTestMode] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    condition: 'USED',
    mileage: 0,
    price: 0,
    currency: 'GBP',
    fuelType: 'PETROL',
    transmission: 'MANUAL',
    engineSize: '',
    color: '',
    description: '',
    features: '',
    images: [] as string[],
    locationCity: '',
    locationState: '',
    locationCountry: 'United Kingdom',
    locationZipCode: '',
  })

  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleLookup = async () => {
    const trimmed = plate.trim()
    if (!trimmed) return
    setLookupLoading(true)
    setLookupError('')
    setDvlaResult(null)

    try {
      const res = await apiClient.post('/api/v1/vehicles/lookup', { registrationNumber: trimmed })
      if (res.data.status === 'success') {
        const d: DvlaResult = res.data.data
        setDvlaResult(d)
        setTestMode(res.data.testMode)

        // Pre-fill form with whatever DVLA returned
        setFormData((prev) => ({
          ...prev,
          make: d.make || prev.make,
          year: d.yearOfManufacture || prev.year,
          fuelType: d.mappedFuelType || prev.fuelType,
          color: d.colour || prev.color,
          engineSize: d.engineSize || prev.engineSize,
        }))
      }
    } catch (err: any) {
      setLookupError(err.response?.data?.message || 'Lookup failed — please enter details manually')
    } finally {
      setLookupLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ['year', 'mileage', 'price'].includes(name) ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.images.length === 0) {
      setSubmitError('Please upload at least one image')
      return
    }
    setSubmitLoading(true)
    setSubmitError('')

    try {
      const featuresArray = formData.features
        .split(',').map((f) => f.trim()).filter(Boolean)

      const response = await apiClient.post('/api/v1/vehicles', { ...formData, features: featuresArray })

      if (response.data.status === 'success') {
        router.push(`/vehicles/${response.data.data.vehicle.id}`)
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to create listing')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 p-4 rounded-lg">
            You must be logged in to list a vehicle.
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white py-10 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">List a Vehicle</h1>
        <p className="text-gray-400 mb-8">Enter your registration plate to auto-fill the details.</p>

        {/* ── PLATE LOOKUP ── */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
            Step 1 — Registration Plate Lookup
          </p>

          <div className="flex gap-3 items-start">
            {/* UK-style plate input */}
            <div className="flex-1">
              <div className="flex rounded-xl overflow-hidden border-2 border-yellow-400/60 focus-within:border-yellow-400 transition-colors shadow-lg">
                {/* Blue GB badge */}
                <div className="bg-blue-700 flex flex-col items-center justify-center px-2.5 py-1 flex-shrink-0">
                  <span className="text-yellow-300 text-[8px] font-bold leading-tight tracking-widest">GB</span>
                  <span className="text-yellow-300 text-[10px] leading-tight">⭐</span>
                </div>
                {/* Yellow plate body */}
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  placeholder="AB12 CDE"
                  maxLength={8}
                  className="flex-1 bg-yellow-300 text-black font-bold text-2xl sm:text-3xl text-center tracking-[0.2em] px-4 py-3 placeholder-black/40 focus:outline-none uppercase"
                  style={{ fontFamily: "'Charles Wright', 'UKNumberPlate', monospace" }}
                />
              </div>
            </div>

            <button
              onClick={handleLookup}
              disabled={lookupLoading || !plate.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-6 py-4 rounded-xl transition-colors flex-shrink-0"
            >
              {lookupLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Looking up…
                </span>
              ) : 'Look Up'}
            </button>
          </div>

          {lookupError && (
            <p className="text-red-400 text-sm mt-3">{lookupError}</p>
          )}

          {testMode && dvlaResult && (
            <p className="text-yellow-500/80 text-xs mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
              Test mode — sample vehicle data shown. Add a DVLA API key for live lookups.
            </p>
          )}

          {/* DVLA result summary */}
          {dvlaResult && (
            <div className="mt-4 bg-black/30 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                <span className="text-sm font-semibold text-green-400">Vehicle found — details pre-filled below</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {dvlaResult.make && <div><p className="text-gray-500 text-xs">Make</p><p className="font-medium">{dvlaResult.make}</p></div>}
                {dvlaResult.yearOfManufacture && <div><p className="text-gray-500 text-xs">Year</p><p className="font-medium">{dvlaResult.yearOfManufacture}</p></div>}
                {dvlaResult.colour && <div><p className="text-gray-500 text-xs">Colour</p><p className="font-medium">{dvlaResult.colour}</p></div>}
                {dvlaResult.engineSize && <div><p className="text-gray-500 text-xs">Engine</p><p className="font-medium">{dvlaResult.engineSize}</p></div>}
                {dvlaResult.motStatus && (
                  <div>
                    <p className="text-gray-500 text-xs">MOT</p>
                    <p className={`font-medium ${dvlaResult.motStatus === 'Valid' ? 'text-green-400' : 'text-red-400'}`}>
                      {dvlaResult.motStatus}
                      {dvlaResult.motExpiryDate && ` · expires ${new Date(dvlaResult.motExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                )}
                {dvlaResult.taxStatus && (
                  <div>
                    <p className="text-gray-500 text-xs">Road Tax</p>
                    <p className={`font-medium ${dvlaResult.taxStatus === 'Taxed' ? 'text-green-400' : 'text-red-400'}`}>
                      {dvlaResult.taxStatus}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── LISTING FORM ── */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
          Step 2 — Complete Your Listing
        </p>

        {submitError && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6 text-sm">{submitError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Vehicle Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-5">Vehicle Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className={labelCls}>Make *</label>
                <input type="text" name="make" value={formData.make} onChange={handleChange} required placeholder="e.g. BMW" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Model *</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} required placeholder="e.g. 3 Series" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Year *</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} required min="1900" max={new Date().getFullYear() + 1} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Colour *</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} required placeholder="e.g. Midnight Black" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Condition *</label>
                <select name="condition" value={formData.condition} onChange={handleChange} required className={inputCls}>
                  <option value="USED">Used</option>
                  <option value="NEW">New</option>
                  <option value="CERTIFIED_PRE_OWNED">Certified Pre-Owned</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Mileage *</label>
                <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} required min="0" placeholder="e.g. 45000" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>VIN / Chassis Number</label>
                <input type="text" name="vin" value={formData.vin} onChange={handleChange} maxLength={17} placeholder="Optional" className={inputCls} />
              </div>

            </div>
          </div>

          {/* Technical */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-5">Technical Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className={labelCls}>Fuel Type *</label>
                <select name="fuelType" value={formData.fuelType} onChange={handleChange} required className={inputCls}>
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="PLUG_IN_HYBRID">Plug-in Hybrid</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Transmission *</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange} required className={inputCls}>
                  <option value="MANUAL">Manual</option>
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="CVT">CVT</option>
                  <option value="SEMI_AUTOMATIC">Semi-Automatic</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Engine Size</label>
                <input type="text" name="engineSize" value={formData.engineSize} onChange={handleChange} placeholder="e.g. 2.0L" className={inputCls} />
              </div>

            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-5">Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className={labelCls}>Asking Price *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" placeholder="e.g. 25000" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Currency *</label>
                <select name="currency" value={formData.currency} onChange={handleChange} required className={inputCls}>
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="SGD">SGD (S$)</option>
                  <option value="HKD">HKD (HK$)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-5">Description & Features</h2>
            <div className="space-y-4">

              <div>
                <label className={labelCls}>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} placeholder="Describe the vehicle, its condition, service history, and any notable details…" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Features <span className="text-gray-500 font-normal">(comma-separated)</span></label>
                <input type="text" name="features" value={formData.features} onChange={handleChange} placeholder="e.g. Panoramic Roof, Heated Seats, Apple CarPlay" className={inputCls} />
              </div>

            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-5">Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className={labelCls}>City *</label>
                <input type="text" name="locationCity" value={formData.locationCity} onChange={handleChange} required placeholder="e.g. London" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>County / Region *</label>
                <input type="text" name="locationState" value={formData.locationState} onChange={handleChange} required placeholder="e.g. Greater London" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Postcode *</label>
                <input type="text" name="locationZipCode" value={formData.locationZipCode} onChange={handleChange} required placeholder="e.g. SW1A 1AA" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Country *</label>
                <input type="text" name="locationCountry" value={formData.locationCountry} onChange={handleChange} required className={inputCls} />
              </div>

            </div>
          </div>

          {/* Images */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-2">Photos</h2>
            <p className="text-gray-500 text-sm mb-5">At least one photo required. First photo becomes the cover image.</p>
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pb-8">
            <button
              type="submit"
              disabled={submitLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-colors"
            >
              {submitLoading ? 'Creating Listing…' : 'Publish Listing'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3.5 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </main>
  )
}
