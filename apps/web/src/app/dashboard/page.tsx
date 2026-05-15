'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatMileage } from '@drive/shared'

interface Subscription {
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'LAPSED' | 'CANCELLED'
  subscription_year_start: string | null
  subscription_year_end: string | null
  amount_paid: string
  rebate_earned: string
  qualifying_sales: number
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  currency: string
  mileage: number
  status: string
  images: string[]
  location: { city: string; state: string }
}

interface TxSummary {
  id: string
  status: string
  amount: string
  currency: string
  make: string
  model: string
  year: number
  images: string[]
  role: 'buyer' | 'seller'
  created_at: string
}

const SUBSCRIPTION_AMOUNT = 600
const SALES_TO_COVER = 6

function SubscriptionWidget({ sub }: { sub: Subscription | null }) {
  if (!sub) {
    return (
      <div className="bg-gray-900 border border-yellow-600/40 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-2">Subscription</h2>
        <p className="text-gray-400 text-sm mb-4">No subscription found.</p>
        <Link
          href="/subscription"
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 px-5 rounded-lg transition-colors"
        >
          Activate Account
        </Link>
      </div>
    )
  }

  const rebate = parseFloat(sub.rebate_earned)
  const salesMade = sub.qualifying_sales
  const salesRemaining = Math.max(0, SALES_TO_COVER - salesMade)
  const netCost = Math.max(0, SUBSCRIPTION_AMOUNT - rebate)
  const progress = Math.min((rebate / SUBSCRIPTION_AMOUNT) * 100, 100)
  const isFree = netCost === 0

  const statusColour =
    sub.status === 'ACTIVE'    ? 'text-green-400 bg-green-400/10 border-green-400/30'  :
    sub.status === 'LAPSED'    ? 'text-red-400 bg-red-400/10 border-red-400/30'        :
    sub.status === 'CANCELLED' ? 'text-gray-400 bg-gray-700 border-gray-600'           :
                                  'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Annual Subscription</h2>
          <p className="text-gray-400 text-sm">
            {formatDate(sub.subscription_year_start)} — {formatDate(sub.subscription_year_end)}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColour}`}>
          {sub.status.replace('_', ' ')}
        </span>
      </div>

      {/* Cost summary */}
      <div className="grid grid-cols-3 gap-4 mb-5 text-center">
        <div>
          <p className="text-2xl font-bold">£{SUBSCRIPTION_AMOUNT}</p>
          <p className="text-xs text-gray-400 mt-1">Paid</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-400">£{rebate.toFixed(0)}</p>
          <p className="text-xs text-gray-400 mt-1">Rebate earned</p>
        </div>
        <div>
          <p className={`text-2xl font-bold ${isFree ? 'text-green-400' : 'text-white'}`}>
            {isFree ? 'FREE' : `£${netCost}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Net cost</p>
        </div>
      </div>

      {/* Rebate progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{salesMade} sale{salesMade !== 1 ? 's' : ''} this year</span>
          <span>£{rebate.toFixed(0)} / £{SUBSCRIPTION_AMOUNT}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!isFree && (
        <p className="text-sm text-blue-400">
          {salesRemaining} more sale{salesRemaining !== 1 ? 's' : ''} to cover your subscription
        </p>
      )}
      {isFree && (
        <p className="text-sm text-green-400 font-medium">
          Subscription fully covered by sales rebates
        </p>
      )}

      {sub.status === 'PENDING_PAYMENT' && (
        <Link
          href="/subscription"
          className="inline-block mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 px-5 rounded-lg transition-colors"
        >
          Complete Payment
        </Link>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [transactions, setTransactions] = useState<TxSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await apiClient.delete(`/api/v1/vehicles/${id}`)
      setVehicles((prev) => prev.filter((v) => v.id !== id))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/auth/login'); return }
    if (user?.role !== 'DEALER') { router.replace('/'); return }

    Promise.all([
      apiClient.get('/api/v1/subscriptions/status').catch(() => null),
      apiClient.get('/api/v1/users/listings').catch(() => null),
      apiClient.get('/api/v1/transactions').catch(() => null),
    ]).then(([subRes, listingsRes, txRes]) => {
      if (subRes?.data?.data?.subscription) setSubscription(subRes.data.data.subscription)
      if (listingsRes?.data?.data?.vehicles) setVehicles(listingsRes.data.data.vehicles)
      if (txRes?.data?.data?.transactions) setTransactions(txRes.data.data.transactions)
    }).finally(() => setLoading(false))
  }, [isAuthenticated, user, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </main>
    )
  }

  const activeListings = vehicles.filter((v) => v.status === 'LIVE').length
  const totalListings  = vehicles.length

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {user?.dealershipName ?? `${user?.firstName} ${user?.lastName}`}
          </h1>
          <p className="text-gray-400 mt-1">Dealer Dashboard</p>
        </div>

        {/* Top grid: subscription + quick stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Subscription widget — spans 2 cols */}
          <div className="lg:col-span-2">
            <SubscriptionWidget sub={subscription} />
          </div>

          {/* Quick stats */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 flex-1">
              <p className="text-3xl font-bold">{activeListings}</p>
              <p className="text-gray-400 text-sm mt-1">Active listings</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 flex-1">
              <p className="text-3xl font-bold">{subscription?.qualifying_sales ?? 0}</p>
              <p className="text-gray-400 text-sm mt-1">Sales this year</p>
            </div>
          </div>
        </div>

        {/* CTA bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/vehicles/new"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            + List a Vehicle
          </Link>
          <Link
            href="/vehicles/import"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            Import Stock
          </Link>
          <Link
            href="/vehicles"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            Browse Marketplace
          </Link>
        </div>

        {/* Listings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Your Listings
            {totalListings > 0 && (
              <span className="ml-2 text-sm text-gray-400 font-normal">({totalListings})</span>
            )}
          </h2>

          {vehicles.length === 0 ? (
            <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-12 text-center">
              <p className="text-gray-400 mb-4">No listings yet.</p>
              <Link
                href="/vehicles/new"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
              >
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {vehicles.map((v) => {
                const label = `${v.year > 1900 ? v.year + ' ' : ''}${v.make} ${v.model}`.trim()
                return (
                  <div key={v.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors group relative">
                    {/* Edit / Delete action buttons */}
                    <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/vehicles/${v.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-black/70 hover:bg-blue-600 text-white rounded-lg p-1.5 transition-colors"
                        title="Edit listing"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(v.id, label)}
                        disabled={deletingId === v.id}
                        className="bg-black/70 hover:bg-red-600 text-white rounded-lg p-1.5 transition-colors disabled:opacity-50"
                        title="Delete listing"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <Link href={`/vehicles/${v.id}`} className="block">
                      <div className="aspect-video bg-gray-800">
                        {v.images?.[0] ? (
                          <img
                            src={v.images[0]}
                            alt={label}
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            v.status === 'LIVE'  ? 'bg-green-500/15 text-green-400' :
                            v.status === 'DRAFT' ? 'bg-yellow-500/15 text-yellow-400' :
                            v.status === 'SOLD'  ? 'bg-gray-700 text-gray-400' :
                                                   'bg-gray-700 text-gray-400'
                          }`}>
                            {v.status}
                          </span>
                        </div>
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-blue-400 font-bold mt-1">{formatCurrency(v.price, v.currency)}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatMileage(v.mileage)} · {v.location.city}</p>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Transactions */}
        {transactions.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">
              Recent Transactions
              <span className="ml-2 text-sm text-gray-400 font-normal">({transactions.length})</span>
            </h2>
            <div className="flex flex-col gap-3">
              {transactions.slice(0, 10).map((tx) => (
                <Link
                  key={tx.id}
                  href={`/transactions/${tx.id}`}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-5 py-4 flex items-center gap-4 transition-colors"
                >
                  {tx.images?.[0] ? (
                    <img src={tx.images[0]} alt="" className="w-16 h-10 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-10 bg-gray-800 rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{tx.year} {tx.make} {tx.model}</p>
                    <p className="text-blue-400 font-bold text-sm">{formatCurrency(parseFloat(tx.amount), tx.currency)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tx.status === 'COMPLETED' ? 'bg-green-500/15 text-green-400' :
                      tx.status === 'ESCROWED'  ? 'bg-blue-500/15 text-blue-400' :
                      tx.status === 'INITIATED' ? 'bg-yellow-500/15 text-yellow-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {tx.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{tx.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
