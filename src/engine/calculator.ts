import type { CalculatorState, CalculationResults, ChartSegment, Fee } from '../types'
import { calculateTieredBrokerSplit } from './tiers'

export function calculateCommission(state: CalculatorState): CalculationResults {
  const { salePrice, commissionRate, country } = state

  // 1. Total commission
  const totalCommission = salePrice * (commissionRate / 100)

  // 2. Listing / buyer agent split
  let listingAgentGross: number
  let buyerAgentGross: number

  if (country === 'AU') {
    // Australia: seller-pays-only model, no buyer agent
    listingAgentGross = totalCommission
    buyerAgentGross = 0
  } else {
    listingAgentGross = salePrice * (state.listingAgentRate / 100)
    buyerAgentGross = salePrice * (state.buyerAgentRate / 100)
  }

  // 3. Agent's gross commission (based on which role user selected)
  const agentGross = state.role === 'listing' || country === 'AU'
    ? listingAgentGross
    : buyerAgentGross

  // 4. Broker split
  let agentShareBeforeFees: number
  let brokerShare: number
  let effectiveSplitPercent: number

  if (state.tieredMode && state.tiers.length > 0) {
    const tieredResult = calculateTieredBrokerSplit(
      agentGross,
      state.tiers,
      state.gciEarnedSoFar,
    )
    agentShareBeforeFees = tieredResult.agentNet
    brokerShare = tieredResult.brokerNet
    effectiveSplitPercent = tieredResult.effectiveSplitPercent
  } else {
    agentShareBeforeFees = agentGross * (state.agentSplitPercent / 100)
    brokerShare = agentGross - agentShareBeforeFees
    effectiveSplitPercent = state.agentSplitPercent
  }

  // 5. Tax (GST/HST on total commission — informational)
  const taxAmount = state.taxEnabled
    ? totalCommission * (state.taxRate / 100)
    : 0

  // 6. Fees (deducted from agent's share)
  const feeBreakdown = calculateFeeBreakdown(state.fees, agentGross)
  const totalFees = feeBreakdown.reduce((sum, f) => sum + f.amount, 0)

  // 7. Agent take-home
  const agentTakeHome = agentShareBeforeFees - totalFees

  // 8. Chart segments
  const chartSegments = buildChartSegments(
    agentTakeHome,
    brokerShare,
    totalFees,
    buyerAgentGross,
    country === 'AU',
    state.role,
  )

  return {
    totalCommission,
    listingAgentGross,
    buyerAgentGross,
    agentGross,
    brokerShare,
    agentShareBeforeFees,
    effectiveSplitPercent,
    taxAmount,
    totalFees,
    feeBreakdown,
    agentTakeHome,
    chartSegments,
  }
}

function calculateFeeBreakdown(
  fees: Fee[],
  agentGross: number,
): { label: string; amount: number }[] {
  return fees.map(fee => ({
    label: fee.label,
    amount: fee.type === 'flat'
      ? fee.value
      : agentGross * (fee.value / 100),
  }))
}

function buildChartSegments(
  agentTakeHome: number,
  brokerShare: number,
  totalFees: number,
  buyerAgentGross: number,
  isAustralia: boolean,
  role: 'listing' | 'buyer',
): ChartSegment[] {
  const segments: ChartSegment[] = []
  const total = agentTakeHome + brokerShare + totalFees +
    (role === 'listing' && !isAustralia ? buyerAgentGross : 0)

  if (total <= 0) return segments

  if (agentTakeHome > 0) {
    segments.push({
      label: 'Your Take-Home',
      value: agentTakeHome,
      color: '#16a34a',
      percentage: (agentTakeHome / total) * 100,
    })
  }

  if (brokerShare > 0) {
    segments.push({
      label: 'Brokerage Share',
      value: brokerShare,
      color: '#6200ff',
      percentage: (brokerShare / total) * 100,
    })
  }

  if (totalFees > 0) {
    segments.push({
      label: 'Fees',
      value: totalFees,
      color: '#a855f7',
      percentage: (totalFees / total) * 100,
    })
  }

  if (role === 'listing' && !isAustralia && buyerAgentGross > 0) {
    segments.push({
      label: "Buyer's Agent",
      value: buyerAgentGross,
      color: '#c4b5fd',
      percentage: (buyerAgentGross / total) * 100,
    })
  }

  return segments
}
