// ---- Country ----

export type CountryCode = 'US' | 'AU' | 'CA' | 'OTHER'

export interface CountryConfig {
  code: CountryCode
  label: string
  currencySymbol: string
  defaultCommissionRate: number
  hasRegionSelector: boolean
  hasBuyerAgent: boolean
  hasTaxToggle: boolean
  defaultTaxRate: number
  taxLabel: string
  listingAgentLabel: string
  buyerAgentLabel: string
  regionLabel: string
}

// ---- Region ----

export interface RegionEntry {
  code: string
  name: string
  defaultCommissionRate: number
  taxRate?: number
  taxType?: string
}

// ---- Fee ----

export interface Fee {
  id: string
  label: string
  type: 'flat' | 'percentage'
  value: number
}

// ---- Tiered Split ----

export interface TierConfig {
  id: string
  upToGCI: number
  agentPercent: number
}

// ---- Calculator State ----

export interface CalculatorState {
  country: CountryCode
  region: string | null
  salePrice: number
  commissionRate: number
  listingAgentRate: number
  buyerAgentRate: number
  role: 'listing' | 'buyer'
  agentSplitPercent: number
  tieredMode: boolean
  tiers: TierConfig[]
  gciEarnedSoFar: number
  taxEnabled: boolean
  taxRate: number
  fees: Fee[]
}

// ---- Calculation Results ----

export interface CalculationResults {
  totalCommission: number
  listingAgentGross: number
  buyerAgentGross: number
  agentGross: number
  brokerShare: number
  agentShareBeforeFees: number
  effectiveSplitPercent: number
  taxAmount: number
  totalFees: number
  feeBreakdown: { label: string; amount: number }[]
  agentTakeHome: number
  chartSegments: ChartSegment[]
}

export interface ChartSegment {
  label: string
  value: number
  color: string
  percentage: number
}

// ---- Widget Config ----

export interface WidgetConfig {
  containerId?: string
  defaultCountry?: CountryCode
  ctaText?: string
  ctaUrl?: string
  ctaVisible?: boolean
}
