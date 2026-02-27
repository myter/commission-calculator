import type { CountryCode, CalculationResults } from '../types'
import { COUNTRIES } from '../data/countries'
import { formatCurrency } from '../utils/format'
import { DonutChart } from './DonutChart'

interface Props {
  results: CalculationResults
  country: CountryCode
  role: 'listing' | 'buyer'
  taxEnabled: boolean
  tieredMode: boolean
  effectiveSplitPercent: number
}

export function ResultsPanel({
  results,
  country,
  role,
  taxEnabled,
  tieredMode,
  effectiveSplitPercent,
}: Props) {
  const config = COUNTRIES[country]
  const hasBuyerAgent = config.hasBuyerAgent
  const fc = (n: number) => formatCurrency(n, country)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-wv-primary uppercase tracking-wider">
        Commission Breakdown
      </h3>

      <DonutChart
        segments={results.chartSegments}
        centerLabel={results.agentTakeHome > 0 ? fc(results.agentTakeHome) : undefined}
      />

      <div className="space-y-1">
        <ResultRow label="Total Commission" value={fc(results.totalCommission)} />

        {hasBuyerAgent && (
          <>
            <ResultRow
              label={`${config.listingAgentLabel} Commission`}
              value={fc(results.listingAgentGross)}
              indent
            />
            <ResultRow
              label={`${config.buyerAgentLabel} Commission`}
              value={fc(results.buyerAgentGross)}
              indent
            />
          </>
        )}

        <div className="border-t border-wv-border my-2" />

        <ResultRow
          label={`Your Gross Commission (${role === 'listing' ? config.listingAgentLabel : config.buyerAgentLabel})`}
          value={fc(results.agentGross)}
        />

        <ResultRow
          label={`Brokerage Share${tieredMode ? ` (effective ${effectiveSplitPercent.toFixed(1)}% you / ${(100 - effectiveSplitPercent).toFixed(1)}% broker)` : ''}`}
          value={`-${fc(results.brokerShare)}`}
          muted
          indent
        />

        <ResultRow
          label="Your Share Before Fees"
          value={fc(results.agentShareBeforeFees)}
        />

        {results.feeBreakdown.map((fee, i) => (
          <ResultRow
            key={i}
            label={fee.label}
            value={`-${fc(fee.amount)}`}
            muted
            indent
          />
        ))}

        {results.totalFees > 0 && (
          <ResultRow
            label="Total Fees"
            value={`-${fc(results.totalFees)}`}
            muted
          />
        )}

        <div className="border-t-2 border-wv-border-strong my-2" />

        <div className="flex justify-between items-center py-1">
          <span className="text-base font-bold text-wv-text">Your Take-Home</span>
          <span className={`text-xl font-bold ${results.agentTakeHome >= 0 ? 'text-wv-green' : 'text-wv-red'}`}>
            {fc(results.agentTakeHome)}
          </span>
        </div>

        {taxEnabled && results.taxAmount > 0 && (
          <>
            <div className="border-t border-wv-border my-2" />
            <ResultRow
              label={`${config.taxLabel} on Commission (informational)`}
              value={fc(results.taxAmount)}
              muted
              small
            />
            <ResultRow
              label={`Commission + ${config.taxLabel}`}
              value={fc(results.totalCommission + results.taxAmount)}
              muted
              small
            />
          </>
        )}
      </div>
    </div>
  )
}

function ResultRow({
  label,
  value,
  indent,
  muted,
  small,
}: {
  label: string
  value: string
  indent?: boolean
  muted?: boolean
  small?: boolean
}) {
  return (
    <div className={`flex justify-between items-center py-0.5 ${muted ? 'opacity-60' : ''}`}>
      <span className={`${small ? 'text-xs' : 'text-sm'} text-wv-text ${indent ? 'pl-4' : ''}`}>{label}</span>
      <span className={`${small ? 'text-xs' : 'text-sm'} font-medium text-wv-text`}>{value}</span>
    </div>
  )
}
