import type { CountryCode, RegionEntry } from '../types'
import { US_STATES } from './us-states'
import { AU_STATES } from './au-states'
import { CA_PROVINCES } from './ca-provinces'

export function getRegionsForCountry(country: CountryCode): RegionEntry[] {
  switch (country) {
    case 'US': return US_STATES
    case 'AU': return AU_STATES
    case 'CA': return CA_PROVINCES
    default: return []
  }
}

export function findRegion(country: CountryCode, code: string): RegionEntry | undefined {
  return getRegionsForCountry(country).find(r => r.code === code)
}
