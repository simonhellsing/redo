'use client'

import { MonthProjection } from '@/lib/simulations/types'

interface TimelineChartProps {
  projections: MonthProjection[]
  metric: 'cash' | 'profit' | 'revenue'
}

export function TimelineChart({ projections, metric }: TimelineChartProps) {
  if (projections.length === 0) {
    return null
  }

  // Get values based on metric
  const getBaseValue = (p: MonthProjection) => {
    switch (metric) {
      case 'cash':
        return p.baseCash
      case 'profit':
        return p.baseProfit
      case 'revenue':
        return p.baseRevenue
    }
  }

  const getSimulatedValue = (p: MonthProjection) => {
    switch (metric) {
      case 'cash':
        return p.simulatedCash
      case 'profit':
        return p.simulatedProfit
      case 'revenue':
        return p.simulatedRevenue
    }
  }

  const baseValues = projections.map(getBaseValue)
  const simulatedValues = projections.map(getSimulatedValue)
  const allValues = [...baseValues, ...simulatedValues]
  
  const maxValue = Math.max(...allValues)
  const minValue = Math.min(...allValues, 0)
  const range = maxValue - minValue || 1

  const chartHeight = 200
  const chartWidth = 100 // percentage

  const getY = (value: number) => {
    return chartHeight - ((value - minValue) / range) * chartHeight
  }

  const basePoints = baseValues
    .map((v, i) => `${(i / (projections.length - 1)) * 100}%,${getY(v)}`)
    .join(' ')

  const simulatedPoints = simulatedValues
    .map((v, i) => `${(i / (projections.length - 1)) * 100}%,${getY(v)}`)
    .join(' ')

  // Create area fill path for the difference
  const areaPath = () => {
    const topLine = simulatedValues
      .map((v, i) => `${(i / (projections.length - 1)) * 100}%,${getY(v)}`)
      .join(' L ')
    const bottomLine = baseValues
      .map((v, i) => `${((projections.length - 1 - i) / (projections.length - 1)) * 100}%,${getY(v)}`)
      .join(' L ')
    return `M ${topLine} L ${bottomLine} Z`
  }

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)} mkr`
    }
    if (Math.abs(value) >= 1000) {
      return `${Math.round(value / 1000)} tkr`
    }
    return `${value} kr`
  }

  const metricLabel = {
    cash: 'Kassa',
    profit: 'Resultat',
    revenue: 'Intäkter',
  }[metric]

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4">
      <h3 className="text-sm font-medium text-neutral-500 mb-4">
        {metricLabel} över tid
      </h3>
      
      <div className="relative" style={{ height: chartHeight }}>
        <svg
          className="w-full h-full"
          viewBox={`0 0 100 ${chartHeight}`}
          preserveAspectRatio="none"
        >
          {/* Zero line if applicable */}
          {minValue < 0 && maxValue > 0 && (
            <line
              x1="0%"
              y1={getY(0)}
              x2="100%"
              y2={getY(0)}
              stroke="#e5e5e5"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          )}

          {/* Difference area */}
          <path
            d={areaPath().replace(/%/g, '')}
            fill="rgba(16, 185, 129, 0.1)"
          />

          {/* Base line */}
          <polyline
            points={basePoints.replace(/%/g, '')}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="4,4"
          />

          {/* Simulated line */}
          <polyline
            points={simulatedPoints.replace(/%/g, '')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-neutral-400 -ml-2 transform -translate-x-full">
          <span>{formatValue(maxValue)}</span>
          {minValue < 0 && <span>0</span>}
          <span>{formatValue(minValue)}</span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-neutral-400">
        {projections.filter((_, i) => i % 3 === 0 || i === projections.length - 1).map((p) => (
          <span key={p.monthLabel}>{p.monthLabel}</span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-neutral-400" style={{ borderStyle: 'dashed' }} />
          <span className="text-neutral-500">Basfall</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-emerald-500" />
          <span className="text-neutral-500">Med förändringar</span>
        </div>
      </div>
    </div>
  )
}


