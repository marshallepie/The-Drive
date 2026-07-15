'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

const inputCls =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20'

export default function Home() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/preview-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setError(payload.error || 'Access could not be granted.')
        return
      }

      router.push(payload.redirectTo || '/vehicles')
      router.refresh()
    } catch {
      setError('Preview access is temporarily unavailable. Please try again shortly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-8 shadow-2xl shadow-black/40 sm:p-10">
            <div className="mb-6 inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Investor Preview • Under Construction
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              The Drive is currently under construction.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              This preview is available to invited viewers only during development.
              If you have been issued a username and password by Marshall, continue below.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">Current state</p>
                <p className="mt-3 text-sm leading-6 text-white/70">Marketplace, finance, and Web3 flows are still being refined before broader release.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">Who gets access</p>
                <p className="mt-3 text-sm leading-6 text-white/70">Invited investors, collaborators, and approved reviewers during this preview phase.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">Need credentials?</p>
                <p className="mt-3 text-sm leading-6 text-white/70">Request temporary access directly from Marshall before broader public launch.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <Link
                href="mailto:me@marshallepie.com?subject=The%20Drive%20preview%20access"
                className="rounded-full border border-white/15 px-4 py-2 text-white/80 transition hover:border-amber-400/50 hover:text-white"
              >
                Request access
              </Link>
              <Link
                href="/pitch"
                className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-amber-100 transition hover:bg-amber-400/15"
              >
                View pitch materials
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">Preview access</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Enter issued credentials</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Access is controlled during development. Credentials are issued manually by Marshall.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-white/80">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Issued username"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Issued password"
                  className={inputCls}
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-amber-400/50"
              >
                {isSubmitting ? 'Checking access…' : 'Continue to preview'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-white/60">
              Temporary preview access is a staging measure only. Stronger access control should replace this before wider launch.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
