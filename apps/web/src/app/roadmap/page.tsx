import type { Metadata } from 'next'
import {
  InvestorCallout,
  InvestorPageShell,
  InvestorSubnav,
  RoadmapTimeline,
  Section,
} from '@/components/investors/InvestorSections'

export const metadata: Metadata = {
  title: 'Drive Roadmap',
  description: 'Unified platform and token roadmap for The Drive.',
}

export default function RoadmapPage() {
  return (
    <InvestorPageShell>
      <InvestorSubnav />
      <Section
        eyebrow="Roadmap"
        title="One roadmap for platform execution and token execution."
        description="The old split between a venture-only product roadmap and a separate token narrative has been replaced with one sequence. Each token milestone is tied to real platform maturity."
      >
        <RoadmapTimeline />
      </Section>

      <Section
        eyebrow="Planning Discipline"
        title="This roadmap is structured to remove chronology confusion."
        description="Phase ordering is now explicit: product readiness, compliance and utility definition, private and strategic capital progression, then pre-public and public launch readiness."
      >
        <InvestorCallout>
          The sequencing is deliberate. The token launch should read as the consequence of execution progress — not as a disconnected event that arrives before the underlying platform and compliance work are ready.
        </InvestorCallout>
      </Section>
    </InvestorPageShell>
  )
}
