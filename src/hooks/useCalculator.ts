import { useReducer, useMemo } from 'react'
import type { CalculatorState, CountryCode, Fee, TierConfig, CalculationResults } from '../types'
import { COUNTRIES } from '../data/countries'
import { findRegion } from '../data/regions'
import { calculateCommission } from '../engine/calculator'

// ---- Actions ----

type Action =
  | { type: 'SET_COUNTRY'; payload: CountryCode }
  | { type: 'SET_REGION'; payload: string }
  | { type: 'SET_SALE_PRICE'; payload: number }
  | { type: 'SET_COMMISSION_RATE'; payload: number }
  | { type: 'SET_LISTING_AGENT_RATE'; payload: number }
  | { type: 'SET_BUYER_AGENT_RATE'; payload: number }
  | { type: 'SET_ROLE'; payload: 'listing' | 'buyer' }
  | { type: 'SET_AGENT_SPLIT_PERCENT'; payload: number }
  | { type: 'TOGGLE_TIERED' }
  | { type: 'SET_TIERS'; payload: TierConfig[] }
  | { type: 'ADD_TIER' }
  | { type: 'REMOVE_TIER'; payload: string }
  | { type: 'UPDATE_TIER'; payload: TierConfig }
  | { type: 'SET_GCI_EARNED'; payload: number }
  | { type: 'TOGGLE_TAX' }
  | { type: 'SET_TAX_RATE'; payload: number }
  | { type: 'ADD_FEE'; payload: Fee }
  | { type: 'REMOVE_FEE'; payload: string }
  | { type: 'UPDATE_FEE'; payload: Fee }

// ---- Initial State ----

function buildInitialState(defaultCountry: CountryCode = 'US'): CalculatorState {
  const config = COUNTRIES[defaultCountry]
  const halfRate = config.defaultCommissionRate / 2

  return {
    country: defaultCountry,
    region: null,
    salePrice: 0,
    commissionRate: config.defaultCommissionRate,
    listingAgentRate: halfRate,
    buyerAgentRate: config.hasBuyerAgent ? halfRate : 0,
    role: 'listing',
    agentSplitPercent: 70,
    tieredMode: false,
    tiers: [],
    gciEarnedSoFar: 0,
    taxEnabled: false,
    taxRate: config.defaultTaxRate,
    fees: [],
  }
}

// ---- Reducer ----

let feeCounter = 0
let tierCounter = 0

function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'SET_COUNTRY': {
      const config = COUNTRIES[action.payload]
      const halfRate = config.defaultCommissionRate / 2
      return {
        ...state,
        country: action.payload,
        region: null,
        commissionRate: config.defaultCommissionRate,
        listingAgentRate: halfRate,
        buyerAgentRate: config.hasBuyerAgent ? halfRate : 0,
        role: 'listing',
        taxEnabled: false,
        taxRate: config.defaultTaxRate,
      }
    }

    case 'SET_REGION': {
      const region = findRegion(state.country, action.payload)
      if (!region) return { ...state, region: action.payload }
      const halfRate = region.defaultCommissionRate / 2
      return {
        ...state,
        region: action.payload,
        commissionRate: region.defaultCommissionRate,
        listingAgentRate: halfRate,
        buyerAgentRate: COUNTRIES[state.country].hasBuyerAgent ? halfRate : 0,
        ...(region.taxRate !== undefined ? { taxRate: region.taxRate } : {}),
      }
    }

    case 'SET_SALE_PRICE':
      return { ...state, salePrice: action.payload }

    case 'SET_COMMISSION_RATE': {
      const halfRate = action.payload / 2
      return {
        ...state,
        commissionRate: action.payload,
        listingAgentRate: halfRate,
        buyerAgentRate: COUNTRIES[state.country].hasBuyerAgent ? halfRate : 0,
      }
    }

    case 'SET_LISTING_AGENT_RATE': {
      const newListing = action.payload
      const newBuyer = Math.max(0, state.commissionRate - newListing)
      return {
        ...state,
        listingAgentRate: newListing,
        buyerAgentRate: newBuyer,
      }
    }

    case 'SET_BUYER_AGENT_RATE': {
      const newBuyer = action.payload
      const newListing = Math.max(0, state.commissionRate - newBuyer)
      return {
        ...state,
        buyerAgentRate: newBuyer,
        listingAgentRate: newListing,
      }
    }

    case 'SET_ROLE':
      return { ...state, role: action.payload }

    case 'SET_AGENT_SPLIT_PERCENT':
      return { ...state, agentSplitPercent: action.payload }

    case 'TOGGLE_TIERED':
      return {
        ...state,
        tieredMode: !state.tieredMode,
        tiers: !state.tieredMode && state.tiers.length === 0
          ? [
              { id: `tier-${++tierCounter}`, upToGCI: 50000, agentPercent: 60 },
              { id: `tier-${++tierCounter}`, upToGCI: 100000, agentPercent: 80 },
            ]
          : state.tiers,
      }

    case 'SET_TIERS':
      return { ...state, tiers: action.payload }

    case 'ADD_TIER': {
      const lastTier = state.tiers[state.tiers.length - 1]
      const newThreshold = lastTier ? lastTier.upToGCI + 50000 : 50000
      const newPercent = lastTier ? Math.min(100, lastTier.agentPercent + 10) : 70
      return {
        ...state,
        tiers: [...state.tiers, {
          id: `tier-${++tierCounter}`,
          upToGCI: newThreshold,
          agentPercent: newPercent,
        }],
      }
    }

    case 'REMOVE_TIER':
      return { ...state, tiers: state.tiers.filter(t => t.id !== action.payload) }

    case 'UPDATE_TIER':
      return {
        ...state,
        tiers: state.tiers.map(t => t.id === action.payload.id ? action.payload : t),
      }

    case 'SET_GCI_EARNED':
      return { ...state, gciEarnedSoFar: action.payload }

    case 'TOGGLE_TAX':
      return { ...state, taxEnabled: !state.taxEnabled }

    case 'SET_TAX_RATE':
      return { ...state, taxRate: action.payload }

    case 'ADD_FEE':
      return { ...state, fees: [...state.fees, { ...action.payload, id: `fee-${++feeCounter}` }] }

    case 'REMOVE_FEE':
      return { ...state, fees: state.fees.filter(f => f.id !== action.payload) }

    case 'UPDATE_FEE':
      return {
        ...state,
        fees: state.fees.map(f => f.id === action.payload.id ? action.payload : f),
      }

    default:
      return state
  }
}

// ---- Hook ----

export type { Action }

export function useCalculator(defaultCountry: CountryCode = 'US') {
  const [state, dispatch] = useReducer(reducer, defaultCountry, buildInitialState)

  const results: CalculationResults = useMemo(
    () => calculateCommission(state),
    [state],
  )

  return { state, dispatch, results }
}
