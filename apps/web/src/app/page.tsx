'use client'

import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'

const inputCls =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [requestName, setRequestName] = useState('')
  const [requestEmail, setRequestEmail] = useState('')
  const [requestCompany, setRequestCompany] = useState('')
  const [requestReason, setRequestReason] = useState('')
  const [requestError, setRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)

  const nextPath = useMemo(() => {
    if (typeof window === 'undefined') {
      return '/vehicles'
    }

    const value = new URLSearchParams(window.location.search).get('next')
    return value || '/vehicles'
  }, [])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)

    try {
      const response = await fetch('/api/preview-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, next: nextPath }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setLoginError(payload.error || 'Access could not be granted.')
        return
      }

      if (payload.tokens) {
        localStorage.setItem('accessToken', payload.tokens.accessToken)
        localStorage.setItem('refreshToken', payload.tokens.refreshToken)
      }
      if (payload.user) {
        localStorage.setItem('user', JSON.stringify(payload.user))
      }

      window.location.href = payload.redirectTo || nextPath
    } catch {
      setLoginError('Preview access is temporarily unavailable. Please try again shortly.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRequestAccess = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRequestError('')
    setRequestSuccess('')
    setIsRequesting(true)

    try {
      const response = await fetch('/api/preview-access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: requestName,
          email: requestEmail,
          company: requestCompany,
          reason: requestReason,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setRequestError(payload.error || 'Preview access could not be requested right now.')
        return
      }

      setRequestSuccess(
        payload.message || 'Your preview access request has been sent. Marshall Epie will be in touch.',
      )
      setRequestName('')
      setRequestEmail('')
      setRequestCompany('')
      setRequestReason('')
    } catch {
      setRequestError('Preview access could not be requested right now.')
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-8 shadow-2xl shadow-black/40 sm:p-10">
            <div className="mb-6 inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Investor Preview • Under Construction
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              The Drive is currently under construction.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              This preview is available to invited viewers only during development.
              Approved viewers sign in with <strong className="text-white">email and password</strong> credentials issued after review.
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">Approval flow</p>
                <p className="mt-3 text-sm leading-6 text-white/70">Request access, await approval, then receive issued email/password credentials before signing in.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <Link
                href="#request-access"
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

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">Preview access</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Sign in with approved credentials</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Preview access now uses issued <strong className="text-white">email and password</strong> credentials rather than a shared username gate.
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
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

                {loginError ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {loginError}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-amber-400/50"
                >
                  {isLoggingIn ? 'Checking access…' : 'Continue to preview'}
                </button>
              </form>
            </div>

            <div id="request-access" className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">Request access</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Ask for preview access</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Submit your details below. Your request will be sent to Marshall Epie for review, and approved viewers will receive issued sign-in credentials.
              </p>

              <form onSubmit={handleRequestAccess} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="request-name" className="mb-2 block text-sm font-medium text-white/80">
                    Full name
                  </label>
                  <input
                    id="request-name"
                    type="text"
                    value={requestName}
                    onChange={(event) => setRequestName(event.target.value)}
                    placeholder="Your name"
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="request-email" className="mb-2 block text-sm font-medium text-white/80">
                    Email
                  </label>
                  <input
                    id="request-email"
                    type="email"
                    value={requestEmail}
                    onChange={(event) => setRequestEmail(event.target.value)}
                    placeholder="you@example.com"
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="request-company" className="mb-2 block text-sm font-medium text-white/80">
                    Company / organisation <span className="text-white/40">optional</span>
                  </label>
                  <input
                    id="request-company"
                    type="text"
                    value={requestCompany}
                    onChange={(event) => setRequestCompany(event.target.value)}
                    placeholder="Company or context"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="request-reason" className="mb-2 block text-sm font-medium text-white/80">
                    Why do you need access? <span className="text-white/40">optional</span>
                  </label>
                  <textarea
                    id="request-reason"
                    value={requestReason}
                    onChange={(event) => setRequestReason(event.target.value)}
                    placeholder="Tell us why you need preview access"
                    className={`${inputCls} min-h-[110px] resize-y`}
                  />
                </div>

                {requestSuccess ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    {requestSuccess}
                  </div>
                ) : null}

                {requestError ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {requestError}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isRequesting}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRequesting ? 'Sending request…' : 'Request preview access'}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-white/60">
                Once approved, credentials can be issued and sent directly to the requester. This gives a clear approval path instead of a silent mailto link.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
