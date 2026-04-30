'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import apiClient from '@/lib/api/client'
import { useAuth } from '@/contexts/AuthContext'

const features = [
  'Access to the international dealer marketplace',
  'Pre-public & pre-auction vehicle listings',
  'Wholesale pricing tier — separate from retail',
  'Cross-border delivered pricing engine',
  'Drive escrow for all transactions',
  'Dealer analytics dashboard',
]

const rebateSteps = [1, 2, 3, 4, 5, 6]

export default function SubscriptionPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/register')
      return
    }
    if (user?.role !== 'DEALER') {
      router.replace('/')
      return
    }
    // If dealer already has active subscription, go straight to dashboard
    apiClient
      .get('/api/v1/subscriptions/status')
      .then((res) => {
        if (res.data.data.subscription?.status === 'ACTIVE') {
          router.replace('/dashboard')
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [isAuthenticated, user, router])

  const handleActivate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.post('/api/v1/subscriptions/checkout')
      const { url, testMode } = res.data.data

      if (testMode || !url) {
        // Stripe not configured — subscription activated in test mode
        router.push('/subscription/success?test=1')
      } else {
        // Redirect to Stripe Checkout
        window.location.href = url
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to start subscription. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Dealer Membership
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Activate Your Dealer Account
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Join the Drive dealer network and access the international vehicle marketplace
            before listings go public.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* Pricing card */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">£600</span>
              <span className="text-gray-400 ml-2">/ year</span>
            </div>

            <p className="text-green-400 font-medium mb-6">
              Refundable through vehicle sales
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base"
            >
              {loading ? 'Processing...' : 'Activate Account — £600/yr'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Secure payment · Cancel anytime · VAT may apply
            </p>
          </div>

          {/* Rebate calculator */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-1">Sales Rebate</h2>
              <p className="text-sm text-gray-400 mb-5">
                Earn £100 back for every vehicle you sell through Drive. Sell 6 and
                your subscription is free.
              </p>

              <div className="space-y-2">
                {rebateSteps.map((n) => (
                  <div key={n} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                      {n}
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(n / 6) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-16 text-right">
                      {n < 6 ? `£${n * 100} back` : 'FREE ✓'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3">Questions?</h2>
              <p className="text-sm text-gray-400">
                We are onboarding a select group of dealers to shape the platform.
                Your feedback directly influences what gets built next.
              </p>
              <Link
                href="/"
                className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
