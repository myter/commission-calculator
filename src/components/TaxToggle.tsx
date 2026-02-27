import type { CountryCode } from '../types'
import { COUNTRIES } from '../data/countries'
import type { Action } from '../hooks/useCalculator'

interface Props {
  country: CountryCode
  taxEnabled: boolean
  taxRate: number
  dispatch: React.Dispatch<Action>
}

export function TaxToggle({ country, taxEnabled, taxRate, dispatch }: Props) {
  const config = COUNTRIES[country]
  if (!config.hasTaxToggle) return null

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={taxEnabled}
          onChange={() => dispatch({ type: 'TOGGLE_TAX' })}
        />
        <span className="text-sm font-medium text-wv-text">
          Include {config.taxLabel} on commission
        </span>
      </label>

      {taxEnabled && (
        <div className="flex items-center gap-2 pl-6">
          <label className="text-sm text-wv-muted">{config.taxLabel} Rate:</label>
          <div className="relative w-20">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={taxRate || ''}
              onChange={e => dispatch({
                type: 'SET_TAX_RATE',
                payload: parseFloat(e.target.value) || 0,
              })}
              className="w-full pr-6 pl-2 py-1.5 border border-wv-border rounded-lg text-sm text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 transition-colors"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-wv-muted text-sm">%</span>
          </div>
        </div>
      )}
    </div>
  )
}
