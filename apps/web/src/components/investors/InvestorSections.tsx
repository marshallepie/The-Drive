import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  complianceGates,
  headlineStats,
  investorCTAs,
  investorNavLinks,
  reserveAllocations,
  roadmapPhases,
  strategicPillars,
  tokenRounds,
} from '@/lib/investor-data'

function statusClasses(status: 'live' | 'next' | 'planned' | 'target') {
  switch (status) {
    case 'live':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
    case 'next':
      return 'border-amber-400/30 bg-amber-400/10 text-amber-200'
    case 'planned':
      return 'border-blue-400/30 bg-blue-400/10 text-blue-200'
    case 'target':
      return 'border-white/15 bg-white/5 text-white/80'
  }
}

export function InvestorPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">{children}</div>
    </main>
  )
}

export function InvestorSubnav() {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {investorNavLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/75 transition hover:border-amber-400/40 hover:text-white"
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}

export function InvestorHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-8 shadow-2xl shadow-black/40 sm:p-10">
      <div className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
        {eyebrow}
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link
              href={investorCTAs.primary.href}
              className="rounded-full bg-amber-400 px-4 py-2 font-semibold text-black transition hover:bg-amber-300"
            >
              {investorCTAs.primary.label}
            </Link>
            <Link
              href={investorCTAs.secondary.href}
              className="rounded-full border border-white/15 px-4 py-2 text-white/80 transition hover:border-amber-400/50 hover:text-white"
            >
              {investorCTAs.secondary.label}
            </Link>
          </div>
        </div>
        <StatGrid />
      </div>
    </section>
  )
}

export function StatGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      {headlineStats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">{stat.label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
          {stat.detail ? <p className="mt-2 text-sm leading-6 text-white/60">{stat.detail}</p> : null}
        </div>
      ))}
    </div>
  )
}

export function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 sm:p-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
        {description ? <p className="mt-4 text-base leading-7 text-white/65">{description}</p> : null}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  )
}

export function BulletGrid({ items }: { items: string[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/75">
          {item}
        </div>
      ))}
    </div>
  )
}

export function StrategicPillars() {
  return (
    <div className="flex flex-wrap gap-2">
      {strategicPillars.map((pillar) => (
        <span
          key={pillar}
          className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100"
        >
          {pillar}
        </span>
      ))}
    </div>
  )
}

export function RoundTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.2em] text-amber-200/80">
            <tr>
              <th className="px-4 py-3">Round</th>
              <th className="px-4 py-3">FDV</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Sale size</th>
              <th className="px-4 py-3">Allocation</th>
              <th className="px-4 py-3">Raise</th>
              <th className="px-4 py-3">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-black/30 text-white/80">
            {tokenRounds.map((round) => (
              <tr key={round.name}>
                <td className="px-4 py-4 font-medium text-white">{round.name}</td>
                <td className="px-4 py-4">{round.fdv}</td>
                <td className="px-4 py-4">{round.price}</td>
                <td className="px-4 py-4">{round.saleSize}</td>
                <td className="px-4 py-4">{round.allocation}</td>
                <td className="px-4 py-4">{round.raise}</td>
                <td className="px-4 py-4 text-white/65">{round.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ReserveGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {reserveAllocations.map((item) => (
        <div key={item.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-100">
              {item.allocation}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/65">{item.detail}</p>
        </div>
      ))}
    </div>
  )
}

export function RoadmapTimeline() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {roadmapPhases.map((phase) => (
        <div key={phase.phase} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">{phase.phase}</p>
              <h3 className="mt-1 text-xl font-semibold text-white">{phase.timing}</h3>
            </div>
            <span className={`rounded-full border px-3 py-1 text-sm font-medium ${statusClasses(phase.status)}`}>
              {phase.status}
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">Platform</p>
              <p className="mt-3 text-sm leading-6 text-white/70">{phase.platform}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">Token</p>
              <p className="mt-3 text-sm leading-6 text-white/70">{phase.token}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ComplianceChecklist() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {complianceGates.map((gate) => (
        <div key={gate.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-lg font-semibold text-white">{gate.name}</h3>
          <p className="mt-3 text-sm leading-6 text-white/65">{gate.detail}</p>
        </div>
      ))}
    </div>
  )
}

export function InvestorCallout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-sm leading-6 text-amber-50">
      {children}
    </div>
  )
}
