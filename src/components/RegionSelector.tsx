import type { CountryCode } from '../types'
import { COUNTRIES } from '../data/countries'
import { getRegionsForCountry } from '../data/regions'
import type { Action } from '../hooks/useCalculator'

interface Props {
  country: CountryCode
  selected: string | null
  dispatch: React.Dispatch<Action>
}

export function RegionSelector({ country, selected, dispatch }: Props) {
  const config = COUNTRIES[country]
  if (!config.hasRegionSelector) return null

  const regions = getRegionsForCountry(country)
  if (regions.length === 0) return null

  return (
    <div>
      <label className="block text-sm font-medium text-wv-text mb-1">
        {config.regionLabel}
      </label>
      <select
        value={selected ?? ''}
        onChange={e => dispatch({ type: 'SET_REGION', payload: e.target.value })}
        className="w-full px-3 py-2.5 border border-wv-border rounded-xl text-sm text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 focus:border-wv-accent transition-colors"
      >
        <option value="">Select {config.regionLabel.toLowerCase()}...</option>
        {regions.map(r => (
          <option key={r.code} value={r.code}>
            {r.name} ({r.defaultCommissionRate}%)
          </option>
        ))}
      </select>
    </div>
  )
}
