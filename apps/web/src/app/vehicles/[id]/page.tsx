'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import apiClient from '@/lib/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatMileage, formatDate } from '@drive/shared'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  vin: string
  price: number
  currency: string
  mileage: number
  condition: string
  fuelType: string
  transmission: string
  engineSize: string
  color: string
  description: string
  features: string[]
  images: string[]
  status: string
  location: {
    city: string
    state: string
    country: string
    zipCode: string
  }
  seller: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
    dealershipName?: string
  }
  createdAt: string
  updatedAt: string
}

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImg, setActiveImg] = useState(0)
  const [contactLoading, setContactLoading] = useState(false)
  const [buyLoading, setBuyLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!vehicle) return
    if (!confirm(`Delete this listing? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await apiClient.delete(`/api/v1/vehicles/${vehicle.id}`)
      router.replace('/dashboard')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed')
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (params.id) fetchVehicle()
  }, [params.id])

  // Reset active image when vehicle loads
  useEffect(() => {
    setActiveImg(0)
  }, [vehicle?.id])

  const handleContactSeller = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    if (!vehicle) return
    setContactLoading(true)
    try {
      const res = await apiClient.post('/api/v1/messages/conversations', {
        otherUserId: vehicle.seller.id,
        vehicleId: vehicle.id,
      })
      if (res.data.status === 'success') router.push(`/messages/${res.data.data.conversationId}`)
    } catch (err) {
      console.error(err)
    } finally {
      setContactLoading(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    if (!vehicle) return
    setBuyLoading(true)
    try {
      const res = await apiClient.post('/api/v1/transactions/initiate', { vehicleId: vehicle.id })
      if (res.data.status === 'success') {
        const { transactionId, clientSecret, testMode } = res.data.data
        if (clientSecret) sessionStorage.setItem(`tx_secret_${transactionId}`, clientSecret)
        if (testMode) sessionStorage.setItem(`tx_test_${transactionId}`, '1')
        router.push(`/transactions/${transactionId}`)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate purchase')
    } finally {
      setBuyLoading(false)
    }
  }

  const fetchVehicle = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/api/v1/vehicles/${params.id}`)
      if (response.data.status === 'success') setVehicle(response.data.data.vehicle)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vehicle')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    )
  }

  if (error || !vehicle) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl mb-4">
            {error || 'Vehicle not found'}
          </div>
          <Link href="/vehicles" className="text-blue-400 hover:text-blue-300">← Back to vehicles</Link>
        </div>
      </main>
    )
  }

  const images = vehicle.images?.length > 0 ? vehicle.images : []
  const hasYear = vehicle.year > 1900
  const displayTitle = `${hasYear ? vehicle.year + ' ' : ''}${vehicle.make} ${vehicle.model}`.trim()

  return (
    <main className="min-h-screen bg-black text-white py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/vehicles" className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-block">
          ← Back to vehicles
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left / main column ── */}
          <div className="lg:col-span-2">

            {/* Image gallery */}
            <div className="mb-6">
              {/* Main image */}
              <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative">
                {images[activeImg] ? (
                  <img
                    src={images[activeImg]}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    No image available
                  </div>
                )}
                {/* Prev / Next arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {/* Image counter */}
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                      {activeImg + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        i === activeImg
                          ? 'border-blue-500 opacity-100'
                          : 'border-gray-700 opacity-60 hover:opacity-90 hover:border-gray-500'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title and price */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-600/30 mb-3">
                {vehicle.condition}
              </span>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{displayTitle}</h1>
                <p className="text-2xl sm:text-3xl font-bold text-blue-400 flex-shrink-0">
                  {formatCurrency(vehicle.price, vehicle.currency)}
                </p>
              </div>
            </div>

            {/* Specs grid */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                {vehicle.mileage > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Mileage</p>
                    <p className="font-semibold">{formatMileage(vehicle.mileage)}</p>
                  </div>
                )}
                {vehicle.transmission && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Transmission</p>
                    <p className="font-semibold">{vehicle.transmission}</p>
                  </div>
                )}
                {vehicle.fuelType && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Fuel Type</p>
                    <p className="font-semibold">{vehicle.fuelType}</p>
                  </div>
                )}
                {vehicle.engineSize && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Engine</p>
                    <p className="font-semibold">{vehicle.engineSize}</p>
                  </div>
                )}
                {vehicle.color && vehicle.color !== 'Unspecified' && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Colour</p>
                    <p className="font-semibold">{vehicle.color}</p>
                  </div>
                )}
                {hasYear && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Year</p>
                    <p className="font-semibold">{vehicle.year}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
              </div>
            )}

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Features</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                  {vehicle.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-blue-400 mt-0.5 flex-shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Seller Information</h3>

              {vehicle.seller.role === 'DEALER' && vehicle.seller.dealershipName ? (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Dealership</p>
                  <p className="font-semibold">{vehicle.seller.dealershipName}</p>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Private Seller</p>
                  <p className="font-semibold">{vehicle.seller.firstName} {vehicle.seller.lastName}</p>
                </div>
              )}

              {(vehicle.location.city || vehicle.location.state) && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Location</p>
                  <p className="font-semibold">
                    {[vehicle.location.city, vehicle.location.state].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {vehicle.seller.phone && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Phone</p>
                  <p className="font-semibold">{vehicle.seller.phone}</p>
                </div>
              )}

              {/* Owner-only: Edit & Delete */}
              {user?.id === vehicle.seller.id && (
                <div className="flex gap-2 mb-4">
                  <Link
                    href={`/vehicles/${vehicle.id}/edit`}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm text-center"
                  >
                    Edit Listing
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm disabled:opacity-50"
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              )}

              <button
                onClick={handleContactSeller}
                disabled={contactLoading || vehicle.seller.id === user?.id}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors mb-2"
              >
                {contactLoading ? 'Opening chat…' : 'Contact Seller'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={buyLoading || vehicle.seller.id === user?.id || vehicle.status !== 'LIVE'}
                className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                {buyLoading ? 'Opening…' : 'Buy Now'}
              </button>

              <p className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
                Listed {formatDate(vehicle.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
