import type { Fee, CountryCode } from '../types'
import { COUNTRIES } from '../data/countries'
import type { Action } from '../hooks/useCalculator'

interface Props {
  fees: Fee[]
  country: CountryCode
  dispatch: React.Dispatch<Action>
}

const QUICK_ADD_FEES = [
  { label: 'Transaction Fee', type: 'flat' as const, value: 500 },
  { label: 'Referral Fee', type: 'percentage' as const, value: 25 },
  { label: 'Franchise Royalty', type: 'percentage' as const, value: 6 },
  { label: 'Admin/Tech Fee', type: 'flat' as const, value: 250 },
]

export function FeeSection({ fees, country, dispatch }: Props) {
  const symbol = COUNTRIES[country].currencySymbol

  const addQuickFee = (preset: typeof QUICK_ADD_FEES[0]) => {
    dispatch({
      type: 'ADD_FEE',
      payload: { id: '', label: preset.label, type: preset.type, value: preset.value },
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-wv-text">Additional Fees</p>
      </div>

      {fees.length > 0 && (
        <div className="space-y-2">
          {fees.map(fee => (
            <div key={fee.id} className="flex items-center gap-2">
              <input
                type="text"
                value={fee.label}
                onChange={e => dispatch({
                  type: 'UPDATE_FEE',
                  payload: { ...fee, label: e.target.value },
                })}
                placeholder="Fee name"
                className="flex-1 px-2 py-1.5 border border-wv-border rounded-lg text-sm text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 transition-colors"
              />
              <select
                value={fee.type}
                onChange={e => dispatch({
                  type: 'UPDATE_FEE',
                  payload: { ...fee, type: e.target.value as 'flat' | 'percentage' },
                })}
                className="px-2 py-1.5 border border-wv-border rounded-lg text-sm text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 transition-colors"
              >
                <option value="flat">{symbol} Flat</option>
                <option value="percentage">% of GCI</option>
              </select>
              <div className="relative w-24">
                {fee.type === 'flat' && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-wv-muted text-xs">
                    {symbol}
                  </span>
                )}
                <input
                  type="number"
                  min="0"
                  step={fee.type === 'flat' ? '1' : '0.1'}
                  value={fee.value || ''}
                  onChange={e => dispatch({
                    type: 'UPDATE_FEE',
                    payload: { ...fee, value: parseFloat(e.target.value) || 0 },
                  })}
                  className={`w-full ${fee.type === 'flat' ? 'pl-7' : 'pl-2'} pr-6 py-1.5 border border-wv-border rounded-lg text-sm text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 transition-colors`}
                />
                {fee.type === 'percentage' && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-wv-muted text-xs">%</span>
                )}
              </div>
              <button
                onClick={() => dispatch({ type: 'REMOVE_FEE', payload: fee.id })}
                className="text-wv-muted hover:text-wv-red text-sm px-1 transition-colors"
                title="Remove fee"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {QUICK_ADD_FEES.map(preset => (
          <button
            key={preset.label}
            onClick={() => addQuickFee(preset)}
            className="px-3 py-1 text-xs bg-wv-accent-light text-wv-text rounded-full hover:bg-wv-accent-mid transition-colors"
          >
            + {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
