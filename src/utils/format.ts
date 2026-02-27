import type { CountryCode } from '../types'
import { COUNTRIES } from '../data/countries'

export function formatCurrency(amount: number, country: CountryCode): string {
  const config = COUNTRIES[country]
  const symbol = config.currencySymbol

  if (amount < 0) {
    return `-${symbol}${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function formatCurrencyDetailed(amount: number, country: CountryCode): string {
  const config = COUNTRIES[country]
  const symbol = config.currencySymbol

  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
