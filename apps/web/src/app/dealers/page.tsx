'use client'

import Link from 'next/link'

const features = [
  { icon: '🚗', title: 'Pre-public listings', desc: 'Access stock before it hits retail platforms.' },
  { icon: '🌍', title: 'International marketplace', desc: 'Buy and sell across borders with delivered pricing.' },
  { icon: '🔒', title: 'Drive escrow', desc: 'Every transaction protected by Drive escrow — no chargebacks.' },
  { icon: '📊', title: 'Dealer analytics', desc: 'Track enquiries, views, and sales performance.' },
  { icon: '💬', title: 'Direct buyer messaging', desc: 'Built-in chat with every buyer who enquires.' },
  { icon: '📥', title: 'Bulk stock import', desc: 'Import your entire stock from any listing URL in seconds.' },
]

const rebateSteps = [
  { sales: 1, rebate: 100 },
  { sales: 2, rebate: 200 },
  { sales: 3, rebate: 300 },
  { sales: 4, rebate: 400 },
  { sales: 5, rebate: 500 },
  { sales: 6, rebate: 600, free: true },
]

export default function DealersPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-400 border border-blue-800 rounded-full px-4 py-1.5 mb-6">
            Dealer Membership
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            The marketplace built<br className="hidden sm:block" /> for serious dealers.
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-xl mx-auto mb-10">
            Join Drive and access pre-public stock, international buyers, and escrow-protected transactions — all from one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register?role=DEALER&plan=annual"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-10 rounded-xl transition-colors text-base"
            >
              Join for £600 / year
            </Link>
            <Link
              href="/auth/register?role=DEALER&plan=monthly"
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-10 rounded-xl transition-colors text-base"
            >
              Start at £70 / month
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 sm:px-6 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Simple pricing</h2>
          <p className="text-gray-400 text-center mb-12">No hidden fees. Cancel anytime. Rebates on every sale.</p>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Monthly */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Monthly</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">£70</span>
                  <span className="text-gray-400">/&nbsp;month</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">Billed monthly · cancel anytime</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {features.map((f) => (
                  <li key={f.title} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-blue-400 mt-0.5 shrink-0">✓</span>
                    {f.title}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register?role=DEALER&plan=monthly"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-center text-sm"
              >
                Get started monthly
              </Link>
            </div>

            {/* Annual — highlighted */}
            <div className="relative bg-gray-900 border border-blue-600 rounded-2xl p-8 flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  BEST VALUE — SAVE £240
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-2">Annual</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">£600</span>
                  <span className="text-gray-400">/&nbsp;year</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">£50/mo equivalent · one payment</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {features.map((f) => (
                  <li key={f.title} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                    {f.title}
                  </li>
                ))}
                <li className="flex items-start gap-3 text-sm text-green-400 font-medium">
                  <span className="mt-0.5 shrink-0">✓</span>
                  £100 per-sale rebate — sell 6, subscription is free
                </li>
              </ul>

              <Link
                href="/auth/register?role=DEALER&plan=annual"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-center text-sm"
              >
                Join for £600/yr
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rebate section — annual only */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Your subscription pays for itself</h2>
            <p className="text-gray-400">
              Every vehicle you sell through Drive earns you a £100 rebate against your annual membership.
              Sell six cars and your £600 subscription is completely free.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="space-y-3">
              {rebateSteps.map(({ sales, rebate, free }) => (
                <div key={sales} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                    {sales}
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${free ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${(rebate / 600) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-28 text-right ${free ? 'text-green-400' : 'text-gray-300'}`}>
                    {free ? '£600 — FREE ✓' : `£${rebate} back`}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-6 text-center">
              Rebate applies to annual membership only. Credited automatically when each sale completes through Drive escrow.
            </p>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-16 px-4 sm:px-6 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to sell faster</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your dealership?</h2>
          <p className="text-gray-400 mb-8">
            We're onboarding a select group of dealers. Join now and help shape the platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register?role=DEALER&plan=annual"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-10 rounded-xl transition-colors"
            >
              Join for £600 / year
            </Link>
            <Link
              href="/auth/register?role=DEALER&plan=monthly"
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-10 rounded-xl transition-colors"
            >
              Start at £70 / month
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
