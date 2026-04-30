'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const isTestMode = searchParams.get('test') === '1'

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-3">You're in.</h1>
        <p className="text-gray-400 mb-2">
          Your dealer account is now active.
        </p>

        {isTestMode && (
          <p className="text-yellow-500/80 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 mb-6 inline-block">
            Test mode — subscription activated without payment
          </p>
        )}

        <p className="text-gray-400 text-sm mb-8">
          Head to your dashboard to manage listings, track your subscription rebate,
          and explore the dealer marketplace.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/vehicles/new"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            List a Vehicle
          </Link>
        </div>
      </div>
    </main>
  )
}
