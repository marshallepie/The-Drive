'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api/client'
import ImageUpload from '@/components/ImageUpload'

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-sm font-medium text-gray-300 mb-1.5'

export default function EditVehiclePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: 0,
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
    status: 'DRAFT',
  })

  useEffect(() => {
    if (!params.id) return
    apiClient.get(`/api/v1/vehicles/${params.id}`)
      .then((res) => {
        if (res.data.status === 'success') {
          const v = res.data.data.vehicle
          // Redirect if not the owner
          if (user && v.seller?.id !== user.id) {
            router.replace(`/vehicles/${params.id}`)
            return
          }
          setFormData({
            make: v.make || '',
            model: v.model || '',
            year: v.year || 0,
            condition: v.condition || 'USED',
            mileage: v.mileage || 0,
            price: v.price || 0,
            currency: v.currency || 'GBP',
            fuelType: v.fuelType || 'PETROL',
            transmission: v.transmission || 'MANUAL',
            engineSize: v.engineSize || '',
            color: v.color === 'Unspecified' ? '' : (v.color || ''),
            description: v.description || '',
            features: (v.features || []).join(', '),
            images: v.images || [],
            locationCity: v.location?.city || '',
            locationState: v.location?.state || '',
            locationCountry: v.location?.country || 'United Kingdom',
            locationZipCode: v.location?.zipCode || '',
            status: v.status || 'DRAFT',
          })
        }
      })
      .catch(() => setError('Failed to load vehicle'))
      .finally(() => setLoading(false))
  }, [params.id, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ['year', 'mileage', 'price'].includes(name) ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...formData,
        features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
        year: formData.year > 0 ? formData.year : undefined,
        color: formData.color || 'Unspecified',
      }
      const res = await apiClient.put(`/api/v1/vehicles/${params.id}`, payload)
      if (res.data.status === 'success') {
        router.push(`/vehicles/${params.id}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <p className="text-gray-400">You must be logged in to edit listings.</p>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white py-10 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href={`/vehicles/${params.id}`} className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-block">
          ← Back to listing
        </Link>
        <h1 className="text-3xl font-bold mb-2">Edit Listing</h1>
        <p className="text-gray-400 mb-8">Update the details below, then save. Change status to <strong className="text-white">Live</strong> to publish.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">Listing Status</h2>
            <div className="flex flex-wrap gap-3">
              {(['DRAFT', 'LIVE', 'ARCHIVED'] as const).map((s) => (
                <label key={s} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                  formData.status === s
                    ? s === 'LIVE' ? 'border-green-500 bg-green-500/10 text-green-400'
                      : s === 'DRAFT' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                      : 'border-gray-500 bg-gray-700 text-gray-300'
                    : 'border-gray-700 text-gray-500 hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={formData.status === s}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="font-semibold text-sm">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                </label>
              ))}
            </div>
            {formData.status === 'LIVE' && (
              <p className="text-xs text-green-400/80 mt-3">This listing will be visible to all buyers on the marketplace.</p>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-5">Vehicle Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Make *</label>
                <input type="text" name="make" value={formData.make} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Model *</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Year</label>
                <input type="number" name="year" value={formData.year || ''} onChange={handleChange} min="1900" max={new Date().getFullYear() + 2} placeholder="e.g. 2019" className={inputCls} />
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
                <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} required min="0" className={inputCls} />
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
                  <option value="SEMI_AUTOMATIC">Semi-Automatic</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Engine Size</label>
                <input type="text" name="engineSize" value={formData.engineSize} onChange={handleChange} placeholder="e.g. 3.8L" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-5">Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Asking Price *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className={inputCls}>
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-5">Description & Features</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe the vehicle…"
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <label className={labelCls}>Features <span className="text-gray-500 font-normal">(comma-separated)</span></label>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Heated seats, Sunroof, Sport package…"
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-5">Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>City</label>
                <input type="text" name="locationCity" value={formData.locationCity} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>County / Region</label>
                <input type="text" name="locationState" value={formData.locationState} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input type="text" name="locationCountry" value={formData.locationCountry} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Postcode</label>
                <input type="text" name="locationZipCode" value={formData.locationZipCode} onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-5">Images</h2>
            <ImageUpload
              images={formData.images}
              onImagesChange={(imgs: string[]) => setFormData((prev) => ({ ...prev, images: imgs }))}
            />
          </div>

          {/* Save */}
          <div className="flex gap-3 pb-10">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <Link
              href={`/vehicles/${params.id}`}
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
