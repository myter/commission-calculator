import type { CountryCode } from '../types'
import { COUNTRIES } from '../data/countries'
import type { Action } from '../hooks/useCalculator'

interface Props {
  role: 'listing' | 'buyer'
  country: CountryCode
  dispatch: React.Dispatch<Action>
}

export function RoleToggle({ role, country, dispatch }: Props) {
  const config = COUNTRIES[country]

  // No toggle needed for Australia (single agent model)
  if (!config.hasBuyerAgent) return null

  return (
    <div>
      <label className="block text-sm font-medium text-wv-text mb-1">
        I am the...
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => dispatch({ type: 'SET_ROLE', payload: 'listing' })}
          className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            role === 'listing'
              ? 'bg-wv-primary text-white'
              : 'bg-wv-accent-light text-wv-text hover:bg-wv-accent-mid'
          }`}
        >
          {config.listingAgentLabel}
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_ROLE', payload: 'buyer' })}
          className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            role === 'buyer'
              ? 'bg-wv-primary text-white'
              : 'bg-wv-accent-light text-wv-text hover:bg-wv-accent-mid'
          }`}
        >
          {config.buyerAgentLabel}
        </button>
      </div>
    </div>
  )
}
