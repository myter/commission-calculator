import type { Action } from '../hooks/useCalculator'

interface Props {
  agentSplitPercent: number
  tieredMode: boolean
  dispatch: React.Dispatch<Action>
}

export function BrokerSplit({ agentSplitPercent, tieredMode, dispatch }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-wv-text">
          Agent / Broker Split
        </label>
        <label className="flex items-center gap-2 text-xs text-wv-muted cursor-pointer">
          <input
            type="checkbox"
            checked={tieredMode}
            onChange={() => dispatch({ type: 'TOGGLE_TIERED' })}
          />
          Tiered split
        </label>
      </div>

      {!tieredMode && (
        <div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={agentSplitPercent}
              onChange={e => dispatch({
                type: 'SET_AGENT_SPLIT_PERCENT',
                payload: parseInt(e.target.value, 10),
              })}
              className="flex-1 h-1.5 cursor-pointer"
            />
            <div className="flex items-center gap-1 min-w-[80px]">
              <input
                type="number"
                min="0"
                max="100"
                value={agentSplitPercent}
                onChange={e => dispatch({
                  type: 'SET_AGENT_SPLIT_PERCENT',
                  payload: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)),
                })}
                className="w-14 px-2 py-1.5 border border-wv-border rounded-lg text-sm text-center text-wv-text bg-wv-input-bg focus:outline-none focus:ring-2 focus:ring-wv-accent/40 focus:border-wv-accent transition-colors"
              />
              <span className="text-sm text-wv-muted">%</span>
            </div>
          </div>
          <p className="text-xs text-wv-muted mt-1">
            You keep {agentSplitPercent}% / Brokerage gets {100 - agentSplitPercent}%
          </p>
        </div>
      )}
    </div>
  )
}
