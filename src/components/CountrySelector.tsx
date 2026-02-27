import type { CountryCode } from '../types'
import { COUNTRIES, COUNTRY_LIST } from '../data/countries'
import type { Action } from '../hooks/useCalculator'

interface Props {
  selected: CountryCode
  dispatch: React.Dispatch<Action>
}

export function CountrySelector({ selected, dispatch }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {COUNTRY_LIST.map(code => {
        const config = COUNTRIES[code]
        const isActive = selected === code
        return (
          <button
            key={code}
            onClick={() => dispatch({ type: 'SET_COUNTRY', payload: code })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-wv-primary text-white'
                : 'bg-wv-accent-light text-wv-text hover:bg-wv-accent-mid'
            }`}
          >
            {config.label}
          </button>
        )
      })}
    </div>
  )
}
