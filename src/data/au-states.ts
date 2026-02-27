import type { RegionEntry } from '../types'

export const AU_STATES: RegionEntry[] = [
  { code: 'NSW', name: 'New South Wales', defaultCommissionRate: 2.10, taxRate: 10, taxType: 'GST' },
  { code: 'VIC', name: 'Victoria', defaultCommissionRate: 2.00, taxRate: 10, taxType: 'GST' },
  { code: 'QLD', name: 'Queensland', defaultCommissionRate: 2.55, taxRate: 10, taxType: 'GST' },
  { code: 'SA', name: 'South Australia', defaultCommissionRate: 2.10, taxRate: 10, taxType: 'GST' },
  { code: 'WA', name: 'Western Australia', defaultCommissionRate: 2.40, taxRate: 10, taxType: 'GST' },
  { code: 'TAS', name: 'Tasmania', defaultCommissionRate: 2.80, taxRate: 10, taxType: 'GST' },
  { code: 'NT', name: 'Northern Territory', defaultCommissionRate: 2.80, taxRate: 10, taxType: 'GST' },
  { code: 'ACT', name: 'Australian Capital Territory', defaultCommissionRate: 2.20, taxRate: 10, taxType: 'GST' },
]
