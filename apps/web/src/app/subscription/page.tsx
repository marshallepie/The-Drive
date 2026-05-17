'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  'Bulk stock import tool',
]

const rebateSteps = [1, 2, 3, 4, 5, 6]

type Plan = 'monthly' | 'annual'

function SubscriptionContent() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [plan, setPlan] = useState<Plan>((searchParams.get('plan') as Plan) || 'annual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/auth/register'); return }
    if (user?.role !== 'DEALER') { router.replace('/'); return }
    apiClient
      .get('/api/v1/subscriptions/status')
      .then((res) => {
        if (res.data.data.subscription?.status === 'ACTIVE') router.replace('/dashboard')
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [isAuthenticated, user, router])

  const handleActivate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.post('/api/v1/subscriptions/checkout', { plan })
      const { url, testMode } = res.data.data
      if (testMode || !url) {
        router.push('/subscription/success?test=1')
      } else {
        window.location.href = url
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start subscription. Please try again.')
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

  const isAnnual = plan === 'annual'

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Dealer Membership
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Activate Your Dealer Account</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            One payment. Full access. Your first sale earns £100 back.
          </p>
        </div>

        {/* Plan toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setPlan('monthly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                plan === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly — £70
            </button>
            <button
              onClick={() => setPlan('annual')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                plan === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual — £600
              <span className="ml-2 text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full">
                Save £240
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* Pricing card */}
          <div className={`bg-gray-900 rounded-2xl p-8 border ${isAnnual ? 'border-blue-600' : 'border-gray-700'}`}>
            {isAnnual && (
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Best value</p>
            )}

            <div className="mb-2">
              <span className="text-5xl font-bold">{isAnnual ? '£600' : '£70'}</span>
              <span className="text-gray-400 ml-2">{isAnnual ? '/ year' : '/ month'}</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              {isAnnual ? '£50/mo equivalent — save £240 vs monthly' : 'Billed monthly · cancel anytime'}
            </p>

            {isAnnual && (
              <p className="text-green-400 font-medium text-sm mb-6">
                + £100 rebate per vehicle sold — sell 6 and it's free
              </p>
            )}

            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className={`mt-0.5 shrink-0 ${isAnnual ? 'text-green-400' : 'text-blue-400'}`}>✓</span>
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
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors text-base"
            >
              {loading
                ? 'Processing...'
                : isAnnual
                  ? 'Activate — £600/yr'
                  : 'Activate — £70/mo'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Secure payment via Stripe · VAT may apply
            </p>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Rebate (annual only) */}
            {isAnnual && (
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-1">Sales Rebate</h2>
                <p className="text-sm text-gray-400 mb-5">
                  Earn £100 back for every vehicle you sell through Drive.
                  Sell 6 and your subscription is free.
                </p>
                <div className="space-y-2">
                  {rebateSteps.map((n) => (
                    <div key={n} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                        {n}
                      </div>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${n === 6 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${(n / 6) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm w-20 text-right ${n === 6 ? 'text-green-400' : 'text-gray-400'}`}>
                        {n < 6 ? `£${n * 100} back` : 'FREE ✓'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly note */}
            {!isAnnual && (
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-2">Upgrade anytime</h2>
                <p className="text-sm text-gray-400">
                  Start monthly and switch to annual whenever you're ready.
                  The £100-per-sale rebate applies to annual members only.
                </p>
                <button
                  onClick={() => setPlan('annual')}
                  className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Switch to annual — save £240 →
                </button>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3">Questions?</h2>
              <p className="text-sm text-gray-400">
                We're onboarding a select group of dealers to shape the platform.
                Your feedback directly influences what gets built next.
              </p>
              <Link
                href="/dealers"
                className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← View full dealer info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <SubscriptionContent />
    </Suspense>
  )
}
