import type { Metadata } from 'next'
import {
  BulletGrid,
  InvestorCallout,
  InvestorHero,
  InvestorPageShell,
  InvestorSubnav,
  Section,
} from '@/components/investors/InvestorSections'
import { investorSummary, tokenUtilities, valueDrivers } from '@/lib/investor-data'

export const metadata: Metadata = {
  title: 'Drive Token',
  description: 'Executive overview of the DRIVE token launch strategy.',
}

export default function DriveTokenPage() {
  return (
    <InvestorPageShell>
      <InvestorSubnav />
      <InvestorHero
        eyebrow="Drive Token"
        title="DRIVE is being positioned as the access, incentive, and capital coordination layer for The Drive ecosystem."
        description="This page gives the fast executive read: what the token is for, why the launch is staged, and how the token story supports the broader automotive asset-exchange strategy."
      />

      <Section
        eyebrow="Executive Summary"
        title="The token launch is meant to complement platform execution, not substitute for it."
        description={investorSummary.description}
      >
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <InvestorCallout>
            <strong className="block text-white">Why the token exists</strong>
            <span className="text-amber-50/85">
              DRIVE is framed as the connective layer between marketplace activity, ecosystem incentives, launch treasury,
              and future finance coordination.
            </span>
          </InvestorCallout>
          <InvestorCallout>
            <strong className="block text-white">Why the launch is phased</strong>
            <span className="text-amber-50/85">
              The valuation ladder only makes sense if the market sees stronger utility, stronger compliance readiness,
              and stronger operational depth at each round.
            </span>
          </InvestorCallout>
        </div>
      </Section>

      <Section
        eyebrow="Utility Layer"
        title="The token has to map to real platform functions."
        description="The site should keep the language disciplined and utility-led rather than speculative."
      >
        <BulletGrid items={tokenUtilities} />
      </Section>

      <Section
        eyebrow="Why this can matter"
        title="The strongest commercial logic sits where cross-border trade, premium assets, and finance infrastructure meet."
        description="Drive's token story is strongest when anchored to the strategic market arguments already established in the platform pitch."
      >
        <BulletGrid items={valueDrivers} />
      </Section>
    </InvestorPageShell>
  )
}
