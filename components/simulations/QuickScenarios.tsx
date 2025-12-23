'use client'

import { QuickScenario } from '@/lib/simulations/types'
import { quickScenarios } from '@/lib/simulations/scenarios'

interface QuickScenariosProps {
  onSelectScenario: (scenario: QuickScenario) => void
}

const colorClasses = {
  emerald: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
  violet: 'bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20',
  amber: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20',
  blue: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
  red: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20',
}

export function QuickScenarios({ onSelectScenario }: QuickScenariosProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {quickScenarios.map((scenario) => (
        <button
          key={scenario.id}
          onClick={() => onSelectScenario(scenario)}
          className={`p-4 rounded-xl border text-left transition-all ${colorClasses[scenario.color]}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{scenario.icon}</span>
            <span className="font-semibold text-neutral-900">{scenario.name}</span>
          </div>
          <p className="text-sm text-neutral-600">{scenario.description}</p>
        </button>
      ))}
    </div>
  )
}

