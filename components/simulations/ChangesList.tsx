'use client'

import { SimulationChange } from '@/lib/simulations/types'
import { formatCompact } from '@/lib/simulations/calculateProjection'

interface ChangesListProps {
  changes: SimulationChange[]
  onRemoveChange: (id: string) => void
}

const MONTH_NAMES = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
]

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

function getTypeIcon(type: SimulationChange['type']): string {
  switch (type) {
    case 'revenue':
      return '📈'
    case 'cost_reduction':
      return '✂️'
    case 'one_time_cost':
      return '💸'
    case 'one_time_revenue':
      return '💵'
    default:
      return '📊'
  }
}

function getTypeColor(type: SimulationChange['type']): string {
  switch (type) {
    case 'revenue':
    case 'one_time_revenue':
      return 'text-emerald-600 bg-emerald-50'
    case 'cost_reduction':
      return 'text-violet-600 bg-violet-50'
    case 'one_time_cost':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-neutral-600 bg-neutral-50'
  }
}

export function ChangesList({ changes, onRemoveChange }: ChangesListProps) {
  if (changes.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <p>Inga förändringar tillagda ännu.</p>
        <p className="text-sm mt-1">
          Lägg till förändringar för att se hur de påverkar din prognos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {changes.map((change) => (
        <div
          key={change.id}
          className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{getTypeIcon(change.type)}</span>
            <div>
              <p className="font-medium text-neutral-900">{change.description}</p>
              <p className="text-sm text-neutral-500">
                Från {formatDate(change.startDate)}
                {change.isRecurring && ' · Återkommande'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(change.type)}`}
            >
              {formatCompact(change.amount)}
              {change.isRecurring && '/mån'}
            </span>
            <button
              onClick={() => onRemoveChange(change.id)}
              className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
              title="Ta bort"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

