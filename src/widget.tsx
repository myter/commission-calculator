import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import type { CountryCode, WidgetConfig } from './types'

function mount() {
  const script = document.currentScript as HTMLScriptElement | null
  const config: WidgetConfig = {
    containerId: script?.dataset.container || 'commission-calculator',
    defaultCountry: (script?.dataset.country as CountryCode) || 'US',
    ctaText: script?.dataset.ctaText || undefined,
    ctaUrl: script?.dataset.ctaUrl || undefined,
    ctaVisible: script?.dataset.ctaVisible !== 'false',
  }

  const container = document.getElementById(config.containerId!)
  if (!container) {
    console.error(`[CommissionCalc] Container #${config.containerId} not found`)
    return
  }

  const root = createRoot(container)
  root.render(<App config={config} />)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
