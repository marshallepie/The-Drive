import type { Metadata } from 'next'
import {
  BulletGrid,
  ComplianceChecklist,
  InvestorCallout,
  InvestorHero,
  InvestorPageShell,
  InvestorSubnav,
  RoadmapTimeline,
  RoundTable,
  Section,
  StrategicPillars,
} from '@/components/investors/InvestorSections'
import {
  investorSummary,
  problemStatements,
  tokenUtilities,
  valueDrivers,
} from '@/lib/investor-data'

export const metadata: Metadata = {
  title: 'The Drive Pitch',
  description: 'Investor pitch for the DRIVE token launch and automotive asset exchange roadmap.',
}

export default function PitchPage() {
  return (
    <InvestorPageShell>
      <InvestorSubnav />
      <InvestorHero
        eyebrow="Drive Investor Pitch"
        title="Building a global automotive asset exchange with DRIVE as the capital and coordination layer."
        description={investorSummary.description}
      />

      <Section
        eyebrow="Positioning"
        title="The Drive is not being framed as another listing site."
        description="The investor narrative centers on a broader mobility-commerce-finance platform where the DRIVE token coordinates access, incentives, treasury depth, and future finance rails."
      >
        <StrategicPillars />
      </Section>

      <Section
        eyebrow="Strategic Problem"
        title="The current automotive secondary market remains fragmented, opaque, and under-financialized."
        description="The strongest parts of the existing Drive thesis still hold: premium vehicles move across borders, OEMs lose visibility after first sale, and high-value automotive assets remain hard to finance and structure at scale."
      >
        <BulletGrid items={problemStatements} />
      </Section>

      <Section
        eyebrow="Why Drive"
        title="Drive sits at the intersection of premium supply, cross-border demand, and emerging tokenized finance."
        description="The UK-to-ASEAN corridor, PEKEMA-linked market access, and institutional appetite for structured real-world asset infrastructure create a credible launch context for DRIVE."
      >
        <BulletGrid items={valueDrivers} />
      </Section>

      <Section
        eyebrow="Token Role"
        title="The token is meant to deepen the platform, not distract from it."
        description="DRIVE is positioned as a utility, participation, and launch-capital layer that matures alongside the marketplace and finance stack."
      >
        <BulletGrid items={tokenUtilities} />
      </Section>

      <Section
        eyebrow="Launch Structure"
        title="Five staged rounds create a valuation ladder from £100M FDV to a £1B public target."
        description="The structure intentionally reprices execution risk over time. Legal maturity, platform utility, liquidity readiness, and partner growth are expected to justify each step up the ladder."
      >
        <RoundTable />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InvestorCallout>
            <strong className="block text-white">600M DRIVE sold</strong>
            <span className="text-amber-50/85">60% of total supply is allocated across the five sale rounds.</span>
          </InvestorCallout>
          <InvestorCallout>
            <strong className="block text-white">£270M cumulative raise</strong>
            <span className="text-amber-50/85">Capital progression is tied to execution maturity rather than a single event.</span>
          </InvestorCallout>
          <InvestorCallout>
            <strong className="block text-white">400M DRIVE reserved</strong>
            <span className="text-amber-50/85">The remaining allocation is held for treasury, team, advisors, liquidity, and ecosystem incentives.</span>
          </InvestorCallout>
        </div>
      </Section>

      <Section
        eyebrow="Roadmap"
        title="Platform execution and token execution need to move together."
        description="Drive should show token launch progression as a consequence of product, distribution, legal, and market-readiness milestones — not as a detached crypto event."
      >
        <RoadmapTimeline />
      </Section>

      <Section
        eyebrow="Compliance Gates"
        title="The launch story only works if the legal and operational gates look disciplined."
        description="The site should communicate seriousness: legal structuring first, participant controls second, audit discipline third, and public access only after readiness is real."
      >
        <ComplianceChecklist />
      </Section>

      <Section
        eyebrow="Investor Takeaway"
        title={investorSummary.title}
        description="The current pitch route now anchors the investor-facing story around DRIVE as the launch vehicle for a broader automotive asset-exchange strategy."
      >
        <InvestorCallout>{investorSummary.disclaimer}</InvestorCallout>
      </Section>
    </InvestorPageShell>
  )
}
