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
  const [contactLoading, setContactLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchVehicle()
    }
  }, [params.id])

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    if (!vehicle) return
    setContactLoading(true)
    try {
      const res = await apiClient.post('/api/v1/messages/conversations', {
        otherUserId: vehicle.seller.id,
        vehicleId: vehicle.id,
      })
      if (res.data.status === 'success') {
        router.push(`/messages/${res.data.data.conversationId}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setContactLoading(false)
    }
  }

  const fetchVehicle = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/api/v1/vehicles/${params.id}`)

      if (response.data.status === 'success') {
        setVehicle(response.data.data.vehicle)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vehicle')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xl">Loading...</p>
        </div>
      </main>
    )
  }

  if (error || !vehicle) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded mb-4">
            {error || 'Vehicle not found'}
          </div>
          <Link href="/vehicles" className="text-blue-500 hover:text-blue-400">
            ← Back to vehicles
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white py-12 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Link href="/vehicles" className="text-blue-500 hover:text-blue-400 mb-6 inline-block">
          ← Back to vehicles
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="mb-6">
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    No image available
                  </div>
                )}
              </div>
            </div>

            {/* Title and Price */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-600 text-sm rounded mb-2">
                    {vehicle.condition}
                  </span>
                  <h1 className="text-4xl font-bold">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-500">
                    {formatCurrency(vehicle.price, vehicle.currency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Mileage</p>
                  <p className="font-semibold">{formatMileage(vehicle.mileage)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Transmission</p>
                  <p className="font-semibold">{vehicle.transmission}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Fuel Type</p>
                  <p className="font-semibold">{vehicle.fuelType}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Engine</p>
                  <p className="font-semibold">{vehicle.engineSize || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Color</p>
                  <p className="font-semibold">{vehicle.color}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">VIN</p>
                  <p className="font-semibold text-sm">{vehicle.vin}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-300 leading-relaxed">{vehicle.description}</p>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Features</h2>
                <ul className="grid grid-cols-2 gap-2">
                  {vehicle.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <span className="text-blue-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6 sticky top-4">
              <h3 className="text-xl font-semibold mb-4">Seller Information</h3>

              {vehicle.seller.role === 'DEALER' && vehicle.seller.dealershipName ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-400">Dealership</p>
                  <p className="font-semibold text-lg">{vehicle.seller.dealershipName}</p>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-sm text-gray-400">Private Seller</p>
                  <p className="font-semibold text-lg">
                    {vehicle.seller.firstName} {vehicle.seller.lastName}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-semibold">
                  {vehicle.location.city}, {vehicle.location.state}
                </p>
                <p className="text-sm text-gray-400">{vehicle.location.zipCode}</p>
              </div>

              {vehicle.seller.phone && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="font-semibold">{vehicle.seller.phone}</p>
                </div>
              )}

              <button
                onClick={handleContactSeller}
                disabled={contactLoading || vehicle.seller.id === user?.id}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded transition-colors mb-2"
              >
                {contactLoading ? 'Opening chat…' : 'Contact Seller'}
              </button>

              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded transition-colors">
                Make an Offer
              </button>

              <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-400">
                <p>Listed {formatDate(vehicle.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
