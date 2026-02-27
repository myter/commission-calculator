import type { CountryCode } from '../types'
import { COUNTRIES } from '../data/countries'
import type { Action } from '../hooks/useCalculator'

interface Props {
  value: number
  country: CountryCode
  dispatch: React.Dispatch<Action>
}

export function SalePriceInput({ value, country, dispatch }: Props) {
  const symbol = COUNTRIES[country].currencySymbol

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    dispatch({ type: 'SET_SALE_PRICE', payload: raw ? parseInt(raw, 10) : 0 })
  }

  const displayValue = value > 0 ? value.toLocaleString('en-US') : ''

  return (
    <div>
      <label className="block text-sm font-medium text-wv-text mb-1">
        Property Sale Price
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-wv-muted text-sm">
          {symbol}
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          className="w-full pl-10 pr-3 py-2.5 border border-wv-border rounded-xl text-sm text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 focus:border-wv-accent transition-colors"
        />
      </div>
    </div>
  )
}
