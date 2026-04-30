'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputCls =
  'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition'
const selectCls =
  'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400 transition'

export default function Home() {
  const router = useRouter()
  const [search, setSearch] = useState({
    make: '',
    maxPrice: '',
    condition: '',
    fuelType: '',
    location: '',
  })

  const set =
    (key: keyof typeof search) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setSearch((s) => ({ ...s, [key]: e.target.value }))

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search.make.trim())     params.set('make', search.make.trim())
    if (search.maxPrice)        params.set('maxPrice', search.maxPrice)
    if (search.condition)       params.set('condition', search.condition)
    if (search.fuelType)        params.set('fuelType', search.fuelType)
    if (search.location.trim()) params.set('location', search.location.trim())
    const qs = params.toString()
    router.push(`/vehicles${qs ? '?' + qs : ''}`)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero Image with Search Overlay */}
        <div className="mb-8 shadow-xl relative overflow-hidden">

          {/* Mobile Image */}
          <div className="block md:hidden">
            <Image
              src="/drive-range.png"
              alt="Drive automotive marketplace"
              width={800}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Desktop Image */}
          <div className="hidden md:block rounded-lg overflow-hidden">
            <Image
              src="/drive-front-page-range.png"
              alt="Drive automotive marketplace"
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Search Overlay — top-left quadrant, half width */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 w-1/2 bg-black/55 backdrop-blur-md rounded-lg px-4 py-5 md:px-6 md:py-6">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
              Find your vehicle
            </p>
            <div className="flex flex-col gap-2">

              <input
                type="text"
                placeholder="Make (e.g. BMW)"
                value={search.make}
                onChange={set('make')}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className={inputCls}
              />

              <select value={search.maxPrice} onChange={set('maxPrice')} className={selectCls}>
                <option value=""      className="bg-gray-900 text-white">Any Price</option>
                <option value="10000" className="bg-gray-900 text-white">Under £10,000</option>
                <option value="25000" className="bg-gray-900 text-white">Under £25,000</option>
                <option value="50000" className="bg-gray-900 text-white">Under £50,000</option>
                <option value="100000" className="bg-gray-900 text-white">Under £100,000</option>
                <option value="250000" className="bg-gray-900 text-white">Under £250,000</option>
              </select>

              <select value={search.condition} onChange={set('condition')} className={selectCls}>
                <option value=""                   className="bg-gray-900 text-white">Any Condition</option>
                <option value="NEW"                className="bg-gray-900 text-white">New</option>
                <option value="USED"               className="bg-gray-900 text-white">Used</option>
                <option value="CERTIFIED_PRE_OWNED" className="bg-gray-900 text-white">Certified Pre-Owned</option>
              </select>

              <select value={search.fuelType} onChange={set('fuelType')} className={selectCls}>
                <option value=""              className="bg-gray-900 text-white">Any Fuel Type</option>
                <option value="PETROL"        className="bg-gray-900 text-white">Petrol</option>
                <option value="DIESEL"        className="bg-gray-900 text-white">Diesel</option>
                <option value="ELECTRIC"      className="bg-gray-900 text-white">Electric</option>
                <option value="HYBRID"        className="bg-gray-900 text-white">Hybrid</option>
                <option value="PLUG_IN_HYBRID" className="bg-gray-900 text-white">Plug-in Hybrid</option>
              </select>

              <input
                type="text"
                placeholder="Location"
                value={search.location}
                onChange={set('location')}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className={inputCls}
              />

              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-7 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tagline */}
        <div className="block md:hidden mb-12 text-center px-4">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            The Web 3 Marketplace And Vault For Collector Cars
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/vehicles"
            className="p-6 border border-gray-700 rounded-lg bg-gray-900 hover:bg-gray-800 hover:border-blue-500 transition-all cursor-pointer group"
          >
            <h2 className="text-2xl font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors">
              Browse Vehicles
            </h2>
            <p className="text-gray-300">
              Discover thousands of vehicles from dealers and private sellers
            </p>
          </Link>

          <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
            <h2 className="text-2xl font-semibold mb-2 text-white">Secure Payments</h2>
            <p className="text-gray-300">
              Pay with traditional methods or cryptocurrency via smart contract escrow
            </p>
          </div>

          <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
            <h2 className="text-2xl font-semibold mb-2 text-white">Finance Options</h2>
            <p className="text-gray-300">
              Apply for financing directly through our platform
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
