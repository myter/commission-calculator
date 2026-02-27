import type { ChartSegment } from '../types'

interface Props {
  segments: ChartSegment[]
  centerLabel?: string
  size?: number
  strokeWidth?: number
}

export function DonutChart({ segments, centerLabel, size = 180, strokeWidth = 36 }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  if (segments.length === 0 || segments.every(s => s.value <= 0)) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto block">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(20, 0, 51, 0.08)"
          strokeWidth={strokeWidth}
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm"
          fill="rgba(20, 0, 51, 0.35)"
        >
          Enter a sale price
        </text>
      </svg>
    )
  }

  let cumulativePercent = 0

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map(segment => {
          if (segment.percentage <= 0) return null
          const dashLength = (segment.percentage / 100) * circumference
          const dashGap = circumference - dashLength
          const offset = -(cumulativePercent / 100) * circumference
          cumulativePercent += segment.percentage

          return (
            <circle
              key={segment.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${dashGap}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-dasharray 0.3s ease, stroke-dashoffset 0.3s ease' }}
            />
          )
        })}
        {centerLabel && (
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-base font-bold"
            fill="#16a34a"
          >
            {centerLabel}
          </text>
        )}
      </svg>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {segments.map(segment => (
          segment.value > 0 && (
            <div key={segment.label} className="flex items-center gap-1.5 text-xs text-wv-muted">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              {segment.label}
            </div>
          )
        ))}
      </div>
    </div>
  )
}
