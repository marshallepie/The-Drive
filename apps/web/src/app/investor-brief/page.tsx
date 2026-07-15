import type { Metadata } from 'next'
import {
  InvestorCallout,
  InvestorPageShell,
  InvestorSubnav,
  ReserveGrid,
  RoundTable,
  Section,
} from '@/components/investors/InvestorSections'
import { investorSummary } from '@/lib/investor-data'

export const metadata: Metadata = {
  title: 'Drive Investor Brief',
  description: 'One-page investor brief for the DRIVE launch strategy.',
}

export default function InvestorBriefPage() {
  return (
    <InvestorPageShell>
      <InvestorSubnav />
      <Section
        eyebrow="Investor Brief"
        title="Drive Coin is being framed as the launch layer for a broader mobility-finance-commerce ecosystem."
        description="This page compresses the core investor read into a single web-native brief: launch structure, reserve logic, and why the staged model matters."
      >
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <InvestorCallout>
            <strong className="block text-white">Executive read</strong>
            <span className="text-amber-50/85">{investorSummary.description}</span>
          </InvestorCallout>
          <InvestorCallout>
            <strong className="block text-white">Financing capacity note</strong>
            <span className="text-amber-50/85">
              At a £1B public target, customer finance can be discussed more credibly, but finance-led growth still requires disciplined reserve planning and operational controls.
            </span>
          </InvestorCallout>
        </div>
      </Section>

      <Section
        eyebrow="Round Summary"
        title="The pricing ladder is designed to move with utility, compliance maturity, and launch readiness."
      >
        <RoundTable />
      </Section>

      <Section
        eyebrow="Reserve Summary"
        title="The unsold 40% is reserved for treasury durability, incentives, and market operations."
      >
        <ReserveGrid />
      </Section>

      <Section
        eyebrow="Final Positioning"
        title="The strongest investor-facing narrative is the disciplined one."
        description="Start with a mathematically coherent structure, tie repricing to real execution progress, and delay broad public access until legal, technical, and market-readiness conditions are materially stronger."
      >
        <InvestorCallout>{investorSummary.disclaimer}</InvestorCallout>
      </Section>
    </InvestorPageShell>
  )
}
