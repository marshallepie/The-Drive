export type NavLink = {
  href: string
  label: string
}

export type HeadlineStat = {
  label: string
  value: string
  detail?: string
}

export type TokenRound = {
  name: string
  fdv: string
  price: string
  saleSize: string
  allocation: string
  raise: string
  purpose: string
}

export type ReserveAllocation = {
  name: string
  allocation: string
  detail: string
}

export type RoadmapPhase = {
  phase: string
  platform: string
  token: string
  timing: string
  status: 'live' | 'next' | 'planned' | 'target'
}

export type ComplianceGate = {
  name: string
  detail: string
}

export const investorNavLinks: NavLink[] = [
  { href: '/pitch', label: 'Pitch' },
  { href: '/drive-token', label: 'Drive Token' },
  { href: '/tokenomics', label: 'Tokenomics' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/compliance', label: 'Compliance' },
  { href: '/investor-brief', label: 'Investor Brief' },
]

export const headlineStats: HeadlineStat[] = [
  { label: 'Total Supply', value: '1B DRIVE', detail: 'Fixed launch supply' },
  { label: 'Starting FDV', value: '£100M', detail: 'Friends & Family reference point' },
  { label: 'Public Target', value: '£1B', detail: 'Public round / TGE target' },
  { label: 'Cumulative Raise', value: '£270M', detail: 'Across five staged rounds' },
]

export const tokenRounds: TokenRound[] = [
  {
    name: 'Friends & Family',
    fdv: '£100M',
    price: '£0.10',
    saleSize: '100M DRIVE',
    allocation: '10%',
    raise: '£10M',
    purpose: 'Seed treasury, legal structuring, technical setup, and aligned early supporters.',
  },
  {
    name: 'Private Round 1',
    fdv: '£200M',
    price: '£0.20',
    saleSize: '150M DRIVE',
    allocation: '15%',
    raise: '£30M',
    purpose: 'Fund product expansion, token infrastructure, utility integration, and partner growth.',
  },
  {
    name: 'Private Round 2 / Strategic',
    fdv: '£400M',
    price: '£0.40',
    saleSize: '150M DRIVE',
    allocation: '15%',
    raise: '£60M',
    purpose: 'Bring in strategic backers, strengthen market position, and support scale-up.',
  },
  {
    name: 'Pre-Public',
    fdv: '£700M',
    price: '£0.70',
    saleSize: '100M DRIVE',
    allocation: '10%',
    raise: '£70M',
    purpose: 'Prepare liquidity, exchange onboarding, treasury depth, and launch operations.',
  },
  {
    name: 'Public Round / TGE',
    fdv: '£1B',
    price: '£1.00',
    saleSize: '100M DRIVE',
    allocation: '10%',
    raise: '£100M',
    purpose: 'Public market entry, price discovery, exchange access, and ecosystem participation.',
  },
]

export const reserveAllocations: ReserveAllocation[] = [
  {
    name: 'Treasury Reserve',
    allocation: '15%',
    detail: 'Long-duration strategic treasury for operating runway, expansion, and launch resilience.',
  },
  {
    name: 'Team / Founders',
    allocation: '10%',
    detail: 'Core operator alignment tied to execution and long-term platform buildout.',
  },
  {
    name: 'Advisors',
    allocation: '5%',
    detail: 'Structured allocation for legal, strategic, technical, and market guidance.',
  },
  {
    name: 'Liquidity / Market Making',
    allocation: '5%',
    detail: 'Dedicated liquidity support for orderly market access and launch operations.',
  },
  {
    name: 'Ecosystem Incentives',
    allocation: '5%',
    detail: 'Partner, marketplace, and growth incentives across the wider mobility ecosystem.',
  },
]

export const roadmapPhases: RoadmapPhase[] = [
  {
    phase: 'Phase 1',
    timing: 'Live',
    status: 'live',
    platform: 'Marketplace alpha, role-based access, vehicle listings, search, and deployed preview infrastructure.',
    token: 'Token concept established as the strategic commerce, finance, and participation layer for Drive.',
  },
  {
    phase: 'Phase 2',
    timing: 'Next',
    status: 'next',
    platform: 'Dealer onboarding, PEKEMA integration, cross-border flows, payments, and escrow readiness.',
    token: 'Legal structuring, utility definition, treasury architecture, and compliance workstreams.',
  },
  {
    phase: 'Phase 3',
    timing: 'Planned',
    status: 'planned',
    platform: 'Finance products, partner integrations, and expansion of vehicle-backed commerce infrastructure.',
    token: 'Private rounds, strategic allocation, smart contract preparation, and audit readiness.',
  },
  {
    phase: 'Phase 4',
    timing: 'Target',
    status: 'target',
    platform: 'Broader global exchange infrastructure, larger-scale distribution, and deeper liquidity coordination.',
    token: 'Pre-public, liquidity preparation, exchange onboarding, and public TGE execution.',
  },
]

export const complianceGates: ComplianceGate[] = [
  {
    name: 'Token classification and legal structuring',
    detail: 'Complete securities-law analysis, issuance architecture, and jurisdictional positioning before public launch.',
  },
  {
    name: 'KYC / AML / sanctions controls',
    detail: 'Screen all private round participants and enforce territory controls for restricted markets.',
  },
  {
    name: 'Private sale documentation',
    detail: 'Use formal round terms, disclosures, vesting schedules, and investor communication controls.',
  },
  {
    name: 'Smart contract audit',
    detail: 'Audit token contracts, treasury controls, and launch-critical contract infrastructure before TGE.',
  },
  {
    name: 'Exchange and liquidity readiness',
    detail: 'Prepare treasury, market-making, listing materials, and operational launch runbooks before public access.',
  },
]

export const strategicPillars = [
  'Global automotive asset exchange',
  'UK premium supply to ASEAN demand',
  'Tokenized participation and settlement infrastructure',
  'Vehicle-backed finance and ecosystem growth',
]

export const problemStatements = [
  'OEMs lose pricing visibility and control after the first sale.',
  'Cross-border premium vehicle demand is fragmented across opaque intermediaries.',
  'High-value automotive assets remain difficult to finance, distribute, and fractionalize at scale.',
]

export const valueDrivers = [
  'PEKEMA-linked distribution logic creates an institutional bridge into Malaysia and wider ASEAN demand.',
  'Drive combines marketplace infrastructure, financing logic, and token-based coordination in one stack.',
  'The token launch is staged to reprice execution risk as platform utility, legal readiness, and market depth improve.',
]

export const tokenUtilities = [
  'Marketplace access and ecosystem participation layer',
  'Transaction and settlement coordination across mobility commerce flows',
  'Incentive layer for partners, users, and strategic ecosystem growth',
  'Treasury and liquidity coordination for launch, expansion, and future finance rails',
  'Future vehicle-backed finance and tokenized asset participation infrastructure',
]

export const investorCTAs = {
  primary: {
    href: 'mailto:me@marshallepie.com?subject=Drive%20Token%20Investor%20Discussion',
    label: 'Request investor discussion',
  },
  secondary: {
    href: 'mailto:me@marshallepie.com?subject=Drive%20Token%20Investor%20Brief',
    label: 'Request token brief',
  },
}

export const investorSummary = {
  title: 'The Drive is positioning the DRIVE token as the capital and coordination layer for a global automotive commerce, finance, and asset-exchange platform.',
  description:
    'The launch model moves from a £100M starting FDV to a £1B public target through five staged rounds tied to execution maturity, compliance readiness, and ecosystem expansion.',
  disclaimer:
    'Draft investor materials only. Token launch progression remains subject to legal structuring, compliance, audit completion, and market-readiness gates.',
}
