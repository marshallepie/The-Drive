'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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

interface Filters {
  make: string
  model: string
  minPrice: string
  maxPrice: string
  minYear: string
  maxYear: string
  condition: string
  fuelType: string
  transmission: string
  location: string
}

export default function VehiclesPage() {
  const searchParams = useSearchParams()

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    make:         searchParams.get('make')         ?? '',
    model:        searchParams.get('model')        ?? '',
    minPrice:     searchParams.get('minPrice')     ?? '',
    maxPrice:     searchParams.get('maxPrice')     ?? '',
    minYear:      searchParams.get('minYear')      ?? '',
    maxYear:      searchParams.get('maxYear')      ?? '',
    condition:    searchParams.get('condition')    ?? '',
    fuelType:     searchParams.get('fuelType')     ?? '',
    transmission: searchParams.get('transmission') ?? '',
    location:     searchParams.get('location')     ?? '',
  })

  const [appliedFilters, setAppliedFilters] = useState<Filters>(filters)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Debounce filter changes
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      setAppliedFilters(filters)
      setPage(1) // Reset to page 1 when filters change
    }, 800) // Wait 800ms after user stops typing

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [filters])

  useEffect(() => {
    fetchVehicles()
  }, [page, appliedFilters])

  const fetchVehicles = async () => {
    try {
      setLoading(true)

      // Build query params
      const params = new URLSearchParams({ page: page.toString(), limit: '12' })

      if (appliedFilters.make) params.append('make', appliedFilters.make)
      if (appliedFilters.model) params.append('model', appliedFilters.model)
      if (appliedFilters.minPrice) params.append('minPrice', appliedFilters.minPrice)
      if (appliedFilters.maxPrice) params.append('maxPrice', appliedFilters.maxPrice)
      if (appliedFilters.minYear) params.append('minYear', appliedFilters.minYear)
      if (appliedFilters.maxYear) params.append('maxYear', appliedFilters.maxYear)
      if (appliedFilters.condition) params.append('condition', appliedFilters.condition)
      if (appliedFilters.fuelType) params.append('fuelType', appliedFilters.fuelType)
      if (appliedFilters.transmission) params.append('transmission', appliedFilters.transmission)
      if (appliedFilters.location) params.append('location', appliedFilters.location)

      const response = await apiClient.get(`/api/v1/vehicles?${params.toString()}`)

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

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    const emptyFilters = {
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      condition: '',
      fuelType: '',
      transmission: '',
      location: '',
    }
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setPage(1)
  }, [])

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Browse Vehicles</h1>
            <p className="text-gray-400">Discover your next vehicle</p>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded mb-8">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-500 hover:text-blue-400"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Make */}
                <div>
                  <label className="block text-sm font-medium mb-2">Make</label>
                  <input
                    type="text"
                    value={filters.make}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                    placeholder="e.g., Toyota"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <input
                    type="text"
                    value={filters.model}
                    onChange={(e) => handleFilterChange('model', e.target.value)}
                    placeholder="e.g., Camry"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="Min"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="Max"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Year Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Year Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.minYear}
                      onChange={(e) => handleFilterChange('minYear', e.target.value)}
                      placeholder="Min"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      value={filters.maxYear}
                      onChange={(e) => handleFilterChange('maxYear', e.target.value)}
                      placeholder="Max"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium mb-2">Condition</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="NEW">New</option>
                    <option value="USED">Used</option>
                    <option value="CERTIFIED_PRE_OWNED">Certified Pre-Owned</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Fuel Type</label>
                  <select
                    value={filters.fuelType}
                    onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="PLUG_IN_HYBRID">Plug-in Hybrid</option>
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium mb-2">Transmission</label>
                  <select
                    value={filters.transmission}
                    onChange={(e) => handleFilterChange('transmission', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                    <option value="CVT">CVT</option>
                    <option value="SEMI_AUTOMATIC">Semi-Automatic</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="City or State"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Vehicles Grid */}
          <div className="flex-1">
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
        </div>
      </div>
    </main>
  )
}
