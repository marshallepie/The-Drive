'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import apiClient from '@/lib/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@drive/shared'

interface Transaction {
  id: string
  vehicle_id: string
  buyer_id: string
  seller_id: string
  amount: string
  currency: string
  status: string
  payment_mode: string
  stripe_payment_intent_id: string | null
  created_at: string
  completed_at: string | null
  make: string
  model: string
  year: number
  images: string[]
  buyer_first_name: string
  buyer_last_name: string
  seller_first_name: string
  seller_last_name: string
  seller_dealership_name: string | null
}

const STATUS_STEPS = ['INITIATED', 'ESCROWED', 'COMPLETED']

const STATUS_LABELS: Record<string, string> = {
  INITIATED: 'Payment Pending',
  PENDING: 'Processing',
  ESCROWED: 'Funds Held in Escrow',
  COMPLETED: 'Sale Complete',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
}

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

// --- Stripe Payment Form ---
function StripePaymentForm({
  transactionId,
  onSuccess,
}: {
  transactionId: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setPaying(true)
    setError('')

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/transactions/${transactionId}?payment=complete`,
      },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message || 'Payment failed')
      setPaying(false)
      return
    }

    // Payment succeeded without redirect — poll for ESCROWED state
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={paying || !stripe}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {paying ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  )
}

// --- Test-mode mock payment ---
function TestPaymentForm({
  transactionId,
  onSuccess,
}: {
  transactionId: string
  onSuccess: () => void
}) {
  const [paying, setPaying] = useState(false)

  const handlePay = async () => {
    setPaying(true)
    // In test mode confirm immediately — this calls confirm which moves status to COMPLETED
    try {
      await apiClient.post(`/api/v1/transactions/${transactionId}/confirm`)
      onSuccess()
    } catch (err) {
      console.error(err)
      setPaying(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-5 py-4 text-sm text-yellow-400">
        <p className="font-semibold mb-1">Test Mode</p>
        <p className="text-yellow-400/80">No real payment is taken. Click below to simulate a successful purchase.</p>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Card number</p>
          <p className="font-mono text-sm text-gray-300">4242 4242 4242 4242</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Expiry</p>
            <p className="font-mono text-sm text-gray-300">12/34</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">CVC</p>
            <p className="font-mono text-sm text-gray-300">123</p>
          </div>
        </div>
      </div>
      <button
        onClick={handlePay}
        disabled={paying}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {paying ? 'Processing…' : 'Simulate Payment'}
      </button>
    </div>
  )
}

export default function TransactionPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [tx, setTx] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [testMode, setTestMode] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/auth/login')
  }, [isAuthenticated, authLoading])

  const fetchTx = useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/v1/transactions/${id}`)
      if (res.data.status === 'success') setTx(res.data.data.transaction)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transaction not found')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!isAuthenticated || !id) return
    fetchTx()

    // Check URL for return from Stripe redirect
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'complete') fetchTx()
  }, [isAuthenticated, id, fetchTx])

  // Retrieve client secret from sessionStorage (set when transaction was created)
  useEffect(() => {
    const stored = sessionStorage.getItem(`tx_secret_${id}`)
    const storedTest = sessionStorage.getItem(`tx_test_${id}`)
    if (stored) setClientSecret(stored)
    if (storedTest === '1') setTestMode(true)
  }, [id])

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      await apiClient.post(`/api/v1/transactions/${id}/confirm`)
      await fetchTx()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm')
    } finally {
      setConfirming(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this transaction?')) return
    setCancelling(true)
    try {
      await apiClient.post(`/api/v1/transactions/${id}/cancel`)
      await fetchTx()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel')
    } finally {
      setCancelling(false)
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading transaction…</p>
      </main>
    )
  }

  if (error || !tx) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-red-400 mb-4">{error || 'Transaction not found'}</p>
          <Link href="/vehicles" className="text-blue-400 hover:text-blue-300">← Browse vehicles</Link>
        </div>
      </main>
    )
  }

  const isBuyer = tx.buyer_id === user?.id
  const activeStep = STATUS_STEPS.indexOf(tx.status)
  const isTerminal = ['COMPLETED', 'CANCELLED', 'REFUNDED', 'FAILED'].includes(tx.status)
  const sellerName = tx.seller_dealership_name || `${tx.seller_first_name} ${tx.seller_last_name}`

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <Link href="/vehicles" className="text-blue-400 hover:text-blue-300 text-sm mb-8 inline-block">
          ← Back to vehicles
        </Link>

        {/* Vehicle summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <div className="flex items-center gap-4 p-5">
            {tx.images?.[0] ? (
              <img src={tx.images[0]} alt="" className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />
            ) : (
              <div className="w-24 h-16 bg-gray-800 rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{tx.year} {tx.make} {tx.model}</p>
              <p className="text-blue-400 font-bold text-lg">
                {formatCurrency(parseFloat(tx.amount), tx.currency)}
              </p>
              <p className="text-xs text-gray-500">Seller: {sellerName}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Transaction Status</h2>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              tx.status === 'COMPLETED' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
              tx.status === 'ESCROWED'  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
              ['CANCELLED','REFUNDED','FAILED'].includes(tx.status) ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}>
              {STATUS_LABELS[tx.status] || tx.status}
            </span>
          </div>

          {/* Progress bar */}
          {!['CANCELLED','REFUNDED','FAILED'].includes(tx.status) && (
            <div className="flex items-center gap-2 mb-4">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i <= activeStep
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-700 text-gray-600'
                  }`}>
                    {i <= activeStep ? '✓' : i + 1}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < activeStep ? 'bg-blue-600' : 'bg-gray-700'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Status description */}
          <div className="text-sm text-gray-400 space-y-1">
            {tx.status === 'INITIATED' && isBuyer && (
              <p>Complete your payment below to secure the vehicle in escrow.</p>
            )}
            {tx.status === 'INITIATED' && !isBuyer && (
              <p>Waiting for the buyer to complete payment.</p>
            )}
            {tx.status === 'ESCROWED' && isBuyer && (
              <p>Payment received and held securely. Once you've inspected the vehicle, confirm receipt to release funds to the seller.</p>
            )}
            {tx.status === 'ESCROWED' && !isBuyer && (
              <p>Funds are held in escrow. Waiting for the buyer to confirm receipt.</p>
            )}
            {tx.status === 'COMPLETED' && (
              <p>Sale complete. {isBuyer ? 'Funds have been released to the seller.' : 'Funds have been released to you.'}</p>
            )}
            {tx.status === 'CANCELLED' && <p>This transaction was cancelled.</p>}
            {tx.status === 'REFUNDED' && <p>Payment has been refunded to the buyer.</p>}
          </div>

          {/* Transaction ID */}
          <p className="text-xs text-gray-600 mt-3 font-mono">ID: {tx.id}</p>
        </div>

        {/* Payment form — buyer only, INITIATED state */}
        {isBuyer && tx.status === 'INITIATED' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-5">
              {testMode ? 'Test Payment' : 'Secure Payment'}
            </h2>

            {testMode ? (
              <TestPaymentForm transactionId={tx.id} onSuccess={fetchTx} />
            ) : stripePromise && clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <StripePaymentForm transactionId={tx.id} onSuccess={fetchTx} />
              </Elements>
            ) : (
              <p className="text-gray-400 text-sm">
                Payment configuration is missing. Please contact support.
              </p>
            )}
          </div>
        )}

        {/* Confirm receipt — buyer only, ESCROWED state */}
        {isBuyer && tx.status === 'ESCROWED' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Confirm Receipt</h2>
            <p className="text-sm text-gray-400 mb-5">
              By confirming, you release the funds to the seller. Only do this once you are satisfied with the vehicle.
            </p>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {confirming ? 'Confirming…' : 'Confirm & Release Funds'}
            </button>
          </div>
        )}

        {/* Completed celebration */}
        {tx.status === 'COMPLETED' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6 text-center">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-1">{isBuyer ? 'Congratulations!' : 'Sale Complete'}</h2>
            <p className="text-gray-400 text-sm">
              {isBuyer
                ? `You are now the owner of the ${tx.year} ${tx.make} ${tx.model}.`
                : `The sale has been completed and funds are being released to you.`}
            </p>
          </div>
        )}

        {/* Cancel button — only for active transactions */}
        {!isTerminal && (
          <div className="text-center">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors"
            >
              {cancelling ? 'Cancelling…' : 'Cancel transaction'}
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mt-4">
            {error}
          </p>
        )}
      </div>
    </main>
  )
}
