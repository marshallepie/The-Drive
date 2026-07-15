import type { Metadata } from 'next'
import {
  ComplianceChecklist,
  InvestorCallout,
  InvestorPageShell,
  InvestorSubnav,
  Section,
} from '@/components/investors/InvestorSections'

export const metadata: Metadata = {
  title: 'Drive Compliance',
  description: 'Compliance, legal, audit, and launch-readiness gates for DRIVE.',
}

export default function CompliancePage() {
  return (
    <InvestorPageShell>
      <InvestorSubnav />
      <Section
        eyebrow="Compliance"
        title="The launch needs to look legally disciplined and operationally serious."
        description="This page exists to show that the DRIVE launch story is gated by real legal, participant-control, audit, and market-readiness requirements."
      >
        <ComplianceChecklist />
      </Section>

      <Section
        eyebrow="Communications Standard"
        title="Public-facing language should remain conditional until readiness is proven."
        description="The investor surface should make clear that the token story remains subject to structuring, restrictions, and deployment controls."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InvestorCallout>
            <strong className="block text-white">Private rounds first</strong>
            <span className="text-amber-50/85">
              Private and strategic allocations should be framed through formal documentation, screening, and jurisdiction-aware participant controls.
            </span>
          </InvestorCallout>
          <InvestorCallout>
            <strong className="block text-white">Public access only after readiness</strong>
            <span className="text-amber-50/85">
              TGE, exchange onboarding, and wider public communications should remain downstream of audit completion and launch operations planning.
            </span>
          </InvestorCallout>
        </div>
      </Section>
    </InvestorPageShell>
  )
}
