import type { CountryCode } from '../types'
import { COUNTRIES } from '../data/countries'
import type { Action } from '../hooks/useCalculator'
import type { TierConfig } from '../types'

interface Props {
  tiers: TierConfig[]
  gciEarnedSoFar: number
  country: CountryCode
  dispatch: React.Dispatch<Action>
}

export function TieredSplitEditor({ tiers, gciEarnedSoFar, country, dispatch }: Props) {
  const symbol = COUNTRIES[country].currencySymbol

  return (
    <div className="space-y-3 pl-3 border-l-2 border-wv-accent-mid">
      <div>
        <label className="block text-sm font-medium text-wv-text mb-1">
          GCI Earned So Far This Year
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-wv-muted text-sm">
            {symbol}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={gciEarnedSoFar > 0 ? gciEarnedSoFar.toLocaleString('en-US') : ''}
            onChange={e => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              dispatch({ type: 'SET_GCI_EARNED', payload: raw ? parseInt(raw, 10) : 0 })
            }}
            placeholder="0"
            className="w-full pl-10 pr-3 py-2.5 border border-wv-border rounded-xl text-sm text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 focus:border-wv-accent transition-colors"
          />
        </div>
        <p className="text-xs text-wv-muted mt-1">
          Your cumulative gross commission income before this deal
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-wv-text">Commission Tiers</p>
        {tiers.map((tier, idx) => (
          <div key={tier.id} className="flex items-center gap-2">
            <span className="text-xs text-wv-muted w-6">{idx + 1}.</span>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-wv-muted">Up to</span>
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-wv-muted text-xs">
                  {symbol}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={tier.upToGCI > 0 ? tier.upToGCI.toLocaleString('en-US') : ''}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, '')
                    dispatch({
                      type: 'UPDATE_TIER',
                      payload: { ...tier, upToGCI: raw ? parseInt(raw, 10) : 0 },
                    })
                  }}
                  className="w-full pl-7 pr-2 py-1.5 border border-wv-border rounded-lg text-xs text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 transition-colors"
                />
              </div>
              <span className="text-xs text-wv-muted">@</span>
              <div className="relative w-20">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tier.agentPercent || ''}
                  onChange={e => dispatch({
                    type: 'UPDATE_TIER',
                    payload: { ...tier, agentPercent: parseFloat(e.target.value) || 0 },
                  })}
                  className="w-full pr-6 pl-2 py-1.5 border border-wv-border rounded-lg text-xs text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 transition-colors"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-wv-muted text-xs">%</span>
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: 'REMOVE_TIER', payload: tier.id })}
              className="text-wv-muted hover:text-wv-red text-sm px-1 transition-colors"
              title="Remove tier"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => dispatch({ type: 'ADD_TIER' })}
        className="text-sm text-wv-accent hover:text-wv-primary font-medium transition-colors"
      >
        + Add Tier
      </button>
    </div>
  )
}
