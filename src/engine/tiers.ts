import type { TierConfig } from '../types'

export interface TieredSplitResult {
  agentNet: number
  brokerNet: number
  effectiveSplitPercent: number
}

export function calculateTieredBrokerSplit(
  grossCommission: number,
  tiers: TierConfig[],
  gciEarnedSoFar: number,
): TieredSplitResult {
  if (tiers.length === 0 || grossCommission <= 0) {
    return { agentNet: 0, brokerNet: grossCommission, effectiveSplitPercent: 0 }
  }

  const sortedTiers = [...tiers].sort((a, b) => a.upToGCI - b.upToGCI)

  let remaining = grossCommission
  let agentTotal = 0
  let currentGci = gciEarnedSoFar

  for (const tier of sortedTiers) {
    if (remaining <= 0) break

    const roomInTier = Math.max(0, tier.upToGCI - currentGci)
    if (roomInTier <= 0) continue

    const amountInTier = Math.min(remaining, roomInTier)
    const agentShare = amountInTier * (tier.agentPercent / 100)

    agentTotal += agentShare
    remaining -= amountInTier
    currentGci += amountInTier
  }

  // Any remaining beyond all tiers: apply last tier's rate
  if (remaining > 0 && sortedTiers.length > 0) {
    const lastTier = sortedTiers[sortedTiers.length - 1]
    agentTotal += remaining * (lastTier.agentPercent / 100)
  }

  const brokerTotal = grossCommission - agentTotal

  return {
    agentNet: agentTotal,
    brokerNet: brokerTotal,
    effectiveSplitPercent: grossCommission > 0
      ? (agentTotal / grossCommission) * 100
      : 0,
  }
}
