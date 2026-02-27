import type { RegionEntry } from '../types'

export const CA_PROVINCES: RegionEntry[] = [
  { code: 'ON', name: 'Ontario', defaultCommissionRate: 5.00, taxRate: 13, taxType: 'HST' },
  { code: 'BC', name: 'British Columbia', defaultCommissionRate: 4.50, taxRate: 12, taxType: 'GST+PST' },
  { code: 'AB', name: 'Alberta', defaultCommissionRate: 4.50, taxRate: 5, taxType: 'GST' },
  { code: 'QC', name: 'Quebec', defaultCommissionRate: 5.00, taxRate: 14.975, taxType: 'GST+QST' },
  { code: 'MB', name: 'Manitoba', defaultCommissionRate: 5.00, taxRate: 12, taxType: 'GST+PST' },
  { code: 'SK', name: 'Saskatchewan', defaultCommissionRate: 5.00, taxRate: 11, taxType: 'GST+PST' },
  { code: 'NS', name: 'Nova Scotia', defaultCommissionRate: 5.00, taxRate: 15, taxType: 'HST' },
  { code: 'NB', name: 'New Brunswick', defaultCommissionRate: 5.00, taxRate: 15, taxType: 'HST' },
  { code: 'NL', name: 'Newfoundland and Labrador', defaultCommissionRate: 5.00, taxRate: 15, taxType: 'HST' },
  { code: 'PE', name: 'Prince Edward Island', defaultCommissionRate: 5.00, taxRate: 15, taxType: 'HST' },
  { code: 'NT', name: 'Northwest Territories', defaultCommissionRate: 5.00, taxRate: 5, taxType: 'GST' },
  { code: 'YT', name: 'Yukon', defaultCommissionRate: 5.00, taxRate: 5, taxType: 'GST' },
  { code: 'NU', name: 'Nunavut', defaultCommissionRate: 5.00, taxRate: 5, taxType: 'GST' },
]
