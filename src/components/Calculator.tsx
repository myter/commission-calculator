import type { CountryCode, WidgetConfig } from '../types'
import { COUNTRIES } from '../data/countries'
import { useCalculator } from '../hooks/useCalculator'
import { CTA_CONFIG } from '../config'
import { CountrySelector } from './CountrySelector'
import { RegionSelector } from './RegionSelector'
import { SalePriceInput } from './SalePriceInput'
import { CommissionRates } from './CommissionRates'
import { RoleToggle } from './RoleToggle'
import { BrokerSplit } from './BrokerSplit'
import { TieredSplitEditor } from './TieredSplitEditor'
import { TaxToggle } from './TaxToggle'
import { FeeSection } from './FeeSection'
import { ResultsPanel } from './ResultsPanel'
import { CtaBanner } from './CtaBanner'

interface Props {
  config?: WidgetConfig
}

export function Calculator({ config }: Props) {
  const defaultCountry = (config?.defaultCountry ?? 'US') as CountryCode
  const { state, dispatch, results } = useCalculator(defaultCountry)
  const countryConfig = COUNTRIES[state.country]

  return (
    <div className="max-w-3xl mx-auto font-satoshi">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-5">
          <div className="space-y-4 bg-wv-card rounded-2xl border border-wv-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-wv-text">Commission Calculator</h2>

            <CountrySelector selected={state.country} dispatch={dispatch} />

            <RegionSelector
              country={state.country}
              selected={state.region}
              dispatch={dispatch}
            />

            <SalePriceInput
              value={state.salePrice}
              country={state.country}
              dispatch={dispatch}
            />

            <CommissionRates
              country={state.country}
              commissionRate={state.commissionRate}
              listingAgentRate={state.listingAgentRate}
              buyerAgentRate={state.buyerAgentRate}
              dispatch={dispatch}
            />

            <RoleToggle
              role={state.role}
              country={state.country}
              dispatch={dispatch}
            />

            <div className="border-t border-wv-border pt-4">
              <BrokerSplit
                agentSplitPercent={state.agentSplitPercent}
                tieredMode={state.tieredMode}
                dispatch={dispatch}
              />

              {state.tieredMode && (
                <div className="mt-3">
                  <TieredSplitEditor
                    tiers={state.tiers}
                    gciEarnedSoFar={state.gciEarnedSoFar}
                    country={state.country}
                    dispatch={dispatch}
                  />
                </div>
              )}
            </div>

            {countryConfig.hasTaxToggle && (
              <div className="border-t border-wv-border pt-4">
                <TaxToggle
                  country={state.country}
                  taxEnabled={state.taxEnabled}
                  taxRate={state.taxRate}
                  dispatch={dispatch}
                />
              </div>
            )}

            <div className="border-t border-wv-border pt-4">
              <FeeSection
                fees={state.fees}
                country={state.country}
                dispatch={dispatch}
              />
            </div>

            <CtaBanner
              text={config?.ctaText ?? CTA_CONFIG.feesCta.text}
              linkText={CTA_CONFIG.feesCta.linkText}
              url={config?.ctaUrl ?? CTA_CONFIG.feesCta.url}
              visible={CTA_CONFIG.feesCta.visible}
            />
          </div>
        </div>

        {/* Right: Results */}
        <div>
          <div className="bg-wv-card rounded-2xl border border-wv-border p-6 shadow-sm md:sticky md:top-4">
            <ResultsPanel
              results={results}
              country={state.country}
              role={state.role}
              taxEnabled={state.taxEnabled}
              tieredMode={state.tieredMode}
              effectiveSplitPercent={results.effectiveSplitPercent}
            />

            <div className="mt-4">
              <CtaBanner
                text={CTA_CONFIG.resultsCta.text}
                linkText={CTA_CONFIG.resultsCta.linkText}
                url={config?.ctaUrl ?? CTA_CONFIG.resultsCta.url}
                visible={CTA_CONFIG.resultsCta.visible}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
