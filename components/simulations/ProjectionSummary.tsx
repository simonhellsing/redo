'use client'

import { ProjectionResult } from '@/lib/simulations/types'
import { formatCompact } from '@/lib/simulations/calculateProjection'

interface ProjectionSummaryProps {
  result: ProjectionResult
}

export function ProjectionSummary({ result }: ProjectionSummaryProps) {
  const { summary, projections } = result
  const lastProjection = projections[projections.length - 1]

  const summaryItems = [
    {
      label: 'Total intäktsförändring',
      value: summary.totalRevenueDifference,
      subtitle: 'över hela perioden',
    },
    {
      label: 'Total kostnadsförändring',
      value: summary.totalExpensesDifference,
      subtitle: 'över hela perioden',
      invertColor: true, // Negative is good for expenses
    },
    {
      label: 'Total resultatförändring',
      value: summary.totalProfitDifference,
      subtitle: 'över hela perioden',
    },
    {
      label: 'Kassa vid periodens slut',
      value: lastProjection?.simulatedCash || 0,
      subtitle: `(${formatCompact(summary.finalCashDifference)} vs basfall)`,
      showAbsolute: true,
    },
  ]

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Sammanfattning (12 månader)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summaryItems.map((item) => {
          const isPositive = item.invertColor
            ? item.value < 0
            : item.value > 0
          const colorClass = item.value === 0
            ? 'text-neutral-600'
            : isPositive
              ? 'text-emerald-600'
              : 'text-red-600'

          return (
            <div
              key={item.label}
              className="p-4 bg-neutral-50 rounded-lg"
            >
              <p className="text-sm text-neutral-500 mb-1">{item.label}</p>
              <p className={`text-2xl font-bold ${colorClass}`}>
                {item.showAbsolute
                  ? formatCompact(item.value)
                  : formatCompact(item.value)}
              </p>
              <p className="text-xs text-neutral-400 mt-1">{item.subtitle}</p>
            </div>
          )
        })}
      </div>

      {summary.breakEvenMonth && (
        <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-800">
            <span className="font-semibold">Break-even:</span>{' '}
            Investeringen betalar sig tillbaka i {summary.breakEvenMonth}
          </p>
        </div>
      )}
    </div>
  )
}


