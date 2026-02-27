import type { WidgetConfig } from './types'
import { Calculator } from './components/Calculator'

interface Props {
  config?: WidgetConfig
}

function App({ config }: Props) {
  return (
    <div className="min-h-screen bg-wv-bg py-8 px-4 font-satoshi">
      <Calculator config={config} />
    </div>
  )
}

export default App
