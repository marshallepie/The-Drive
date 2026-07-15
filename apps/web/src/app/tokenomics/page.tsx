import type { Metadata } from 'next'
import {
  InvestorCallout,
  InvestorPageShell,
  InvestorSubnav,
  ReserveGrid,
  RoundTable,
  Section,
} from '@/components/investors/InvestorSections'

export const metadata: Metadata = {
  title: 'Drive Tokenomics',
  description: 'Token supply, round structure, reserve allocation, and capital progression for DRIVE.',
}

export default function TokenomicsPage() {
  return (
    <InvestorPageShell>
      <InvestorSubnav />
      <Section
        eyebrow="Tokenomics"
        title="1B DRIVE supply, five staged rounds, and a 40% reserve layer."
        description="This page is the clean numerical reference for the launch structure. It keeps the token supply, pricing ladder, round sizes, and reserve logic in one place."
      >
        <RoundTable />
      </Section>

      <Section
        eyebrow="Verified Totals"
        title="The current launch model sells 600M DRIVE and raises £270M."
        description="The numbers below are derived directly from the approved round structure and should remain synchronized across all investor-facing pages."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <InvestorCallout>
            <strong className="block text-white">600M DRIVE sold</strong>
            <span className="text-amber-50/85">This represents 60% of the total 1B supply.</span>
          </InvestorCallout>
          <InvestorCallout>
            <strong className="block text-white">£270M raised</strong>
            <span className="text-amber-50/85">Total capital raised across Friends & Family, private, strategic, pre-public, and public rounds.</span>
          </InvestorCallout>
          <InvestorCallout>
            <strong className="block text-white">400M DRIVE reserved</strong>
            <span className="text-amber-50/85">The remaining 40% is held outside the five sale rounds.</span>
          </InvestorCallout>
        </div>
      </Section>

      <Section
        eyebrow="Reserve Structure"
        title="The remaining allocation is intended for treasury durability and ecosystem execution."
        description="Reserve logic should be presented as disciplined and operational rather than vague."
      >
        <ReserveGrid />
      </Section>

      <Section
        eyebrow="Launch Conditions"
        title="Public launch should remain conditional, not assumed."
        description="The tokenomics story is strongest when the TGE is described as the final step after legal structuring, smart contract audit, liquidity planning, and exchange-readiness work are materially complete."
      >
        <InvestorCallout>
          DRIVE tokenomics are being presented as a staged launch model. Public access and the £1B target should be framed as contingent on legal, technical, and market-readiness gates rather than as automatic outcomes.
        </InvestorCallout>
      </Section>
    </InvestorPageShell>
  )
}
