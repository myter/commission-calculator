import type { CountryCode } from '../types'
import { COUNTRIES } from '../data/countries'
import type { Action } from '../hooks/useCalculator'

interface Props {
  country: CountryCode
  commissionRate: number
  listingAgentRate: number
  buyerAgentRate: number
  dispatch: React.Dispatch<Action>
}

export function CommissionRates({
  country,
  commissionRate,
  listingAgentRate,
  buyerAgentRate,
  dispatch,
}: Props) {
  const config = COUNTRIES[country]

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-wv-text mb-1">
          Total Commission Rate
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={commissionRate || ''}
            onChange={e => dispatch({
              type: 'SET_COMMISSION_RATE',
              payload: parseFloat(e.target.value) || 0,
            })}
            className="w-full pr-8 pl-3 py-2.5 border border-wv-border rounded-xl text-sm text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 focus:border-wv-accent transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-wv-muted text-sm">%</span>
        </div>
      </div>

      {config.hasBuyerAgent ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-wv-text mb-1">
              {config.listingAgentLabel} (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max={commissionRate}
                value={listingAgentRate || ''}
                onChange={e => dispatch({
                  type: 'SET_LISTING_AGENT_RATE',
                  payload: parseFloat(e.target.value) || 0,
                })}
                className="w-full pr-8 pl-3 py-2.5 border border-wv-border rounded-xl text-sm text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 focus:border-wv-accent transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-wv-muted text-sm">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-wv-text mb-1">
              {config.buyerAgentLabel} (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max={commissionRate}
                value={buyerAgentRate || ''}
                onChange={e => dispatch({
                  type: 'SET_BUYER_AGENT_RATE',
                  payload: parseFloat(e.target.value) || 0,
                })}
                className="w-full pr-8 pl-3 py-2.5 border border-wv-border rounded-xl text-sm text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 focus:border-wv-accent transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-wv-muted text-sm">%</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-wv-muted">
          In Australia, commission is paid only by the seller. There is no separate buyer's agent commission.
        </p>
      )}
    </div>
  )
}
