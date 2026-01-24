'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import apiClient from '@/lib/api/client'
import { formatCurrency, formatMileage } from '@drive/shared'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  currency: string
  mileage: number
  condition: string
  fuelType: string
  transmission: string
  color: string
  images: string[]
  location: {
    city: string
    state: string
  }
  seller: {
    firstName: string
    lastName: string
    role: string
    dealershipName?: string
  }
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchVehicles()
  }, [page])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/api/v1/vehicles?page=${page}&limit=12`)

      if (response.data.status === 'success') {
        setVehicles(response.data.data.vehicles)
        setTotalPages(response.data.data.totalPages)
      }
    } catch (err: any) {
      setError('Failed to load vehicles')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && page === 1) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-xl">Loading vehicles...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white py-12 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Vehicles</h1>
          <p className="text-gray-400">Discover your next vehicle</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/vehicles/${vehicle.id}`}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
            >
              {/* Image */}
              <div className="aspect-video bg-gray-800 flex items-center justify-center">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600">No image</span>
                )}
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 bg-blue-600 text-xs rounded">
                    {vehicle.condition}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-1">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>

                <p className="text-2xl font-bold text-blue-500 mb-3">
                  {formatCurrency(vehicle.price, vehicle.currency)}
                </p>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-3">
                  <div>{formatMileage(vehicle.mileage)}</div>
                  <div>{vehicle.transmission}</div>
                  <div>{vehicle.fuelType}</div>
                  <div>{vehicle.color}</div>
                </div>

                <div className="pt-3 border-t border-gray-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {vehicle.location.city}, {vehicle.location.state}
                    </span>
                    {vehicle.seller.role === 'DEALER' && vehicle.seller.dealershipName && (
                      <span className="text-blue-500 text-xs">
                        {vehicle.seller.dealershipName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {vehicles.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No vehicles found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed rounded transition-colors"
            >
              Previous
            </button>

            <span className="text-gray-400">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed rounded transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
