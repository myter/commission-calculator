import { describe, it, expect } from 'vitest'
import { calculateCommission } from '../calculator'
import { calculateTieredBrokerSplit } from '../tiers'
import type { CalculatorState, TierConfig } from '../../types'

// Helper: build a default state and override specific fields
function makeState(overrides: Partial<CalculatorState> = {}): CalculatorState {
  return {
    country: 'US',
    region: null,
    salePrice: 500000,
    commissionRate: 6,
    listingAgentRate: 3,
    buyerAgentRate: 3,
    role: 'listing',
    agentSplitPercent: 70,
    tieredMode: false,
    tiers: [],
    gciEarnedSoFar: 0,
    taxEnabled: false,
    taxRate: 0,
    fees: [],
    ...overrides,
  }
}

// ───────────────────────────────────────────
// 1. BASIC US COMMISSION
// ───────────────────────────────────────────
describe('Basic US commission', () => {
  it('$500K sale at 6% total, 3%/3% split, listing agent, 70/30 broker split', () => {
    const r = calculateCommission(makeState())

    expect(r.totalCommission).toBe(30000)        // 500K * 6%
    expect(r.listingAgentGross).toBe(15000)       // 500K * 3%
    expect(r.buyerAgentGross).toBe(15000)         // 500K * 3%
    expect(r.agentGross).toBe(15000)              // listing agent role
    expect(r.brokerShare).toBe(4500)              // 15K * 30%
    expect(r.agentShareBeforeFees).toBe(10500)    // 15K * 70%
    expect(r.totalFees).toBe(0)
    expect(r.agentTakeHome).toBe(10500)
    expect(r.effectiveSplitPercent).toBe(70)
    expect(r.taxAmount).toBe(0)
  })

  it('buyer agent role gets buyer side of commission', () => {
    const r = calculateCommission(makeState({ role: 'buyer' }))

    expect(r.agentGross).toBe(15000)             // buyer agent gets 3% side
    expect(r.agentShareBeforeFees).toBe(10500)
    expect(r.agentTakeHome).toBe(10500)
  })

  it('asymmetric listing/buyer split: 3.5% listing, 2.5% buyer', () => {
    const r = calculateCommission(makeState({
      listingAgentRate: 3.5,
      buyerAgentRate: 2.5,
    }))

    expect(r.listingAgentGross).toBe(17500)       // 500K * 3.5%
    expect(r.buyerAgentGross).toBe(12500)         // 500K * 2.5%
    expect(r.agentGross).toBe(17500)              // listing role
    expect(r.agentShareBeforeFees).toBeCloseTo(12250) // 17500 * 70%
  })

  it('$0 sale price gives all zeros', () => {
    const r = calculateCommission(makeState({ salePrice: 0 }))

    expect(r.totalCommission).toBe(0)
    expect(r.listingAgentGross).toBe(0)
    expect(r.buyerAgentGross).toBe(0)
    expect(r.agentGross).toBe(0)
    expect(r.agentTakeHome).toBe(0)
  })

  it('100/0 agent-broker split: agent keeps everything', () => {
    const r = calculateCommission(makeState({ agentSplitPercent: 100 }))

    expect(r.brokerShare).toBe(0)
    expect(r.agentShareBeforeFees).toBe(15000)
    expect(r.agentTakeHome).toBe(15000)
  })

  it('0/100 agent-broker split: broker keeps everything', () => {
    const r = calculateCommission(makeState({ agentSplitPercent: 0 }))

    expect(r.brokerShare).toBe(15000)
    expect(r.agentShareBeforeFees).toBe(0)
    expect(r.agentTakeHome).toBe(0)
  })
})

// ───────────────────────────────────────────
// 2. AUSTRALIA-SPECIFIC
// ───────────────────────────────────────────
describe('Australia commission', () => {
  it('AU: no buyer agent, all commission to selling agent', () => {
    const r = calculateCommission(makeState({
      country: 'AU',
      commissionRate: 2,
      listingAgentRate: 2,
      buyerAgentRate: 0,
      salePrice: 800000,
    }))

    expect(r.totalCommission).toBe(16000)         // 800K * 2%
    expect(r.listingAgentGross).toBe(16000)       // all goes to selling agent
    expect(r.buyerAgentGross).toBe(0)
    expect(r.agentGross).toBe(16000)              // AU always uses listing side
  })

  it('AU with GST 10%', () => {
    const r = calculateCommission(makeState({
      country: 'AU',
      commissionRate: 2,
      listingAgentRate: 2,
      buyerAgentRate: 0,
      salePrice: 800000,
      taxEnabled: true,
      taxRate: 10,
    }))

    expect(r.taxAmount).toBe(1600)                // 16000 * 10%
    // Tax is informational only, doesn't affect take-home
    expect(r.agentGross).toBe(16000)
  })

  it('AU: buyer role still gets listing agent commission', () => {
    const r = calculateCommission(makeState({
      country: 'AU',
      commissionRate: 2,
      listingAgentRate: 2,
      buyerAgentRate: 0,
      salePrice: 800000,
      role: 'buyer', // shouldn't matter for AU
    }))

    // AU always uses listing side regardless of role
    expect(r.agentGross).toBe(16000)
  })
})

// ───────────────────────────────────────────
// 3. CANADA WITH HST/GST
// ───────────────────────────────────────────
describe('Canada commission', () => {
  it('CA: $500K at 5%, 2.5%/2.5%, HST 13%', () => {
    const r = calculateCommission(makeState({
      country: 'CA',
      commissionRate: 5,
      listingAgentRate: 2.5,
      buyerAgentRate: 2.5,
      salePrice: 500000,
      taxEnabled: true,
      taxRate: 13,
    }))

    expect(r.totalCommission).toBe(25000)         // 500K * 5%
    expect(r.listingAgentGross).toBe(12500)
    expect(r.buyerAgentGross).toBe(12500)
    expect(r.taxAmount).toBe(3250)                // 25000 * 13%
  })
})

// ───────────────────────────────────────────
// 4. FEES
// ───────────────────────────────────────────
describe('Fees', () => {
  it('flat fee deducted from agent share', () => {
    const r = calculateCommission(makeState({
      fees: [
        { id: 'f1', label: 'Transaction Fee', type: 'flat', value: 500 },
      ],
    }))

    expect(r.totalFees).toBe(500)
    expect(r.agentTakeHome).toBe(10500 - 500)     // 10000
    expect(r.feeBreakdown[0].label).toBe('Transaction Fee')
    expect(r.feeBreakdown[0].amount).toBe(500)
  })

  it('percentage fee calculated on agent gross commission', () => {
    const r = calculateCommission(makeState({
      fees: [
        { id: 'f1', label: 'Referral Fee', type: 'percentage', value: 25 },
      ],
    }))

    // 25% of agentGross ($15,000) = $3,750
    expect(r.feeBreakdown[0].amount).toBe(3750)
    expect(r.totalFees).toBe(3750)
    expect(r.agentTakeHome).toBe(10500 - 3750)    // 6750
  })

  it('multiple fees stack correctly', () => {
    const r = calculateCommission(makeState({
      fees: [
        { id: 'f1', label: 'Transaction Fee', type: 'flat', value: 500 },
        { id: 'f2', label: 'Admin Fee', type: 'flat', value: 250 },
        { id: 'f3', label: 'Franchise Royalty', type: 'percentage', value: 6 },
      ],
    }))

    // Flat: 500 + 250 = 750
    // Pct: 15000 * 6% = 900
    // Total: 1650
    expect(r.totalFees).toBe(1650)
    expect(r.agentTakeHome).toBe(10500 - 1650)    // 8850
  })

  it('fees can exceed agent share, resulting in negative take-home', () => {
    const r = calculateCommission(makeState({
      fees: [
        { id: 'f1', label: 'Huge Fee', type: 'flat', value: 20000 },
      ],
    }))

    expect(r.agentTakeHome).toBe(10500 - 20000)   // -9500
  })
})

// ───────────────────────────────────────────
// 5. TIERED BROKER SPLITS
// ───────────────────────────────────────────
describe('Tiered broker splits', () => {
  const defaultTiers: TierConfig[] = [
    { id: 't1', upToGCI: 50000, agentPercent: 60 },
    { id: 't2', upToGCI: 100000, agentPercent: 80 },
  ]

  it('basic tiered split: all commission fits in first tier', () => {
    // Agent gross = $15,000, GCI earned so far = $0
    // All $15K falls in tier 1 (up to $50K) at 60%
    const result = calculateTieredBrokerSplit(15000, defaultTiers, 0)

    expect(result.agentNet).toBe(9000)            // 15000 * 60%
    expect(result.brokerNet).toBe(6000)           // 15000 * 40%
    expect(result.effectiveSplitPercent).toBe(60)
  })

  it('commission spans two tiers', () => {
    // Agent gross = $15,000, GCI earned so far = $45,000
    // First $5K fills tier 1 (45K→50K) at 60% = $3,000
    // Remaining $10K in tier 2 (50K→60K) at 80% = $8,000
    // Agent total = $11,000
    const result = calculateTieredBrokerSplit(15000, defaultTiers, 45000)

    expect(result.agentNet).toBe(11000)
    expect(result.brokerNet).toBe(4000)
    expect(result.effectiveSplitPercent).toBeCloseTo(73.33, 1)
  })

  it('GCI already past first tier: all in second tier', () => {
    // GCI earned so far = $60,000 (past tier 1's $50K)
    // All $15K falls in tier 2 at 80%
    const result = calculateTieredBrokerSplit(15000, defaultTiers, 60000)

    expect(result.agentNet).toBe(12000)           // 15000 * 80%
    expect(result.brokerNet).toBe(3000)
    expect(result.effectiveSplitPercent).toBe(80)
  })

  it('commission exceeds all tiers: uses last tier rate for overflow', () => {
    // GCI earned so far = $95,000
    // First $5K fills tier 2 (95K→100K) at 80% = $4,000
    // Remaining $10K beyond all tiers, uses last tier rate (80%) = $8,000
    // Agent total = $12,000
    const result = calculateTieredBrokerSplit(15000, defaultTiers, 95000)

    expect(result.agentNet).toBe(12000)
    expect(result.brokerNet).toBe(3000)
  })

  it('GCI already past all tiers: uses last tier rate for everything', () => {
    // GCI earned so far = $150,000 (past both tiers)
    const result = calculateTieredBrokerSplit(15000, defaultTiers, 150000)

    expect(result.agentNet).toBe(12000)           // all at 80%
    expect(result.brokerNet).toBe(3000)
    expect(result.effectiveSplitPercent).toBe(80)
  })

  it('zero gross commission', () => {
    const result = calculateTieredBrokerSplit(0, defaultTiers, 0)

    expect(result.agentNet).toBe(0)
    expect(result.brokerNet).toBe(0)
    expect(result.effectiveSplitPercent).toBe(0)
  })

  it('empty tiers array', () => {
    const result = calculateTieredBrokerSplit(15000, [], 0)

    expect(result.agentNet).toBe(0)
    expect(result.brokerNet).toBe(15000)
  })

  it('single tier', () => {
    const tiers: TierConfig[] = [
      { id: 't1', upToGCI: 100000, agentPercent: 75 },
    ]
    const result = calculateTieredBrokerSplit(20000, tiers, 0)

    expect(result.agentNet).toBe(15000)           // 20000 * 75%
    expect(result.brokerNet).toBe(5000)
    expect(result.effectiveSplitPercent).toBe(75)
  })

  it('tiered mode end-to-end through calculateCommission', () => {
    const r = calculateCommission(makeState({
      tieredMode: true,
      tiers: defaultTiers,
      gciEarnedSoFar: 45000,
    }))

    // Agent gross = $15,000
    // $5K at 60% = $3,000, $10K at 80% = $8,000 → agent = $11,000
    expect(r.agentShareBeforeFees).toBe(11000)
    expect(r.brokerShare).toBe(4000)
    expect(r.agentTakeHome).toBe(11000)
    expect(r.effectiveSplitPercent).toBeCloseTo(73.33, 1)
  })
})

// ───────────────────────────────────────────
// 6. EDGE CASES & CONSISTENCY CHECKS
// ───────────────────────────────────────────
describe('Edge cases and consistency', () => {
  it('agent take-home + broker share + fees = agent gross', () => {
    const r = calculateCommission(makeState({
      fees: [
        { id: 'f1', label: 'Fee', type: 'flat', value: 500 },
        { id: 'f2', label: 'Pct Fee', type: 'percentage', value: 10 },
      ],
    }))

    // agentTakeHome + brokerShare + totalFees should equal agentGross
    expect(r.agentTakeHome + r.brokerShare + r.totalFees).toBeCloseTo(r.agentGross, 2)
  })

  it('listing + buyer gross = total commission (non-AU)', () => {
    const r = calculateCommission(makeState({
      listingAgentRate: 3.5,
      buyerAgentRate: 2.5,
    }))

    expect(r.listingAgentGross + r.buyerAgentGross).toBeCloseTo(r.totalCommission, 2)
  })

  it('very large sale: $50M property', () => {
    const r = calculateCommission(makeState({ salePrice: 50000000 }))

    expect(r.totalCommission).toBe(3000000)
    expect(r.agentGross).toBe(1500000)
    expect(r.agentTakeHome).toBe(1050000)         // 70% of 1.5M
  })

  it('very small commission rate: 0.5%', () => {
    const r = calculateCommission(makeState({
      commissionRate: 0.5,
      listingAgentRate: 0.25,
      buyerAgentRate: 0.25,
    }))

    expect(r.totalCommission).toBe(2500)          // 500K * 0.5%
    expect(r.agentGross).toBe(1250)
    expect(r.agentTakeHome).toBe(875)             // 70% of 1250
  })

  it('chart segments sum to agent gross when listing + no fees', () => {
    const r = calculateCommission(makeState())

    const chartTotal = r.chartSegments.reduce((sum, s) => sum + s.value, 0)
    // Should equal: take-home + broker + buyer agent
    expect(chartTotal).toBeCloseTo(r.agentTakeHome + r.brokerShare + r.buyerAgentGross, 2)
  })

  it('chart segment percentages sum to 100', () => {
    const r = calculateCommission(makeState({
      fees: [{ id: 'f1', label: 'Fee', type: 'flat', value: 1000 }],
    }))

    const pctTotal = r.chartSegments.reduce((sum, s) => sum + s.percentage, 0)
    expect(pctTotal).toBeCloseTo(100, 1)
  })

  it('tiered + fees consistency: take-home = share before fees - fees', () => {
    const r = calculateCommission(makeState({
      tieredMode: true,
      tiers: [
        { id: 't1', upToGCI: 50000, agentPercent: 60 },
        { id: 't2', upToGCI: 100000, agentPercent: 80 },
      ],
      gciEarnedSoFar: 45000,
      fees: [
        { id: 'f1', label: 'Transaction', type: 'flat', value: 500 },
        { id: 'f2', label: 'Referral', type: 'percentage', value: 25 },
      ],
    }))

    expect(r.agentTakeHome).toBeCloseTo(r.agentShareBeforeFees - r.totalFees, 2)
    // Also: agentShareBeforeFees + brokerShare = agentGross
    expect(r.agentShareBeforeFees + r.brokerShare).toBeCloseTo(r.agentGross, 2)
  })
})
