'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MonthlyFinancialData } from '@/lib/insights/mockData'
import { SimulationChange, QuickScenario } from '@/lib/simulations/types'
import { calculateProjection, formatCompact } from '@/lib/simulations/calculateProjection'
import { ChangeForm } from './ChangeForm'
import { ChangesList } from './ChangesList'
import { QuickScenarios } from './QuickScenarios'
import { TimelineChart } from './TimelineChart'
import { ProjectionSummary } from './ProjectionSummary'

interface SimulationsViewProps {
  baseData: MonthlyFinancialData
}

export function SimulationsView({ baseData }: SimulationsViewProps) {
  const [changes, setChanges] = useState<SimulationChange[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<'cash' | 'profit' | 'revenue'>('cash')

  const projectionResult = useMemo(() => {
    return calculateProjection(baseData, changes, 12)
  }, [baseData, changes])

  function handleAddChange(change: SimulationChange) {
    setChanges((prev) => [...prev, change])
    setShowAddForm(false)
  }

  function handleRemoveChange(id: string) {
    setChanges((prev) => prev.filter((c) => c.id !== id))
  }

  function handleSelectScenario(scenario: QuickScenario) {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() + 1)
    startDate.setDate(1)
    
    const newChanges = scenario.createChanges(startDate, baseData)
    setChanges((prev) => [...prev, ...newChanges])
  }

  function handleClearAll() {
    setChanges([])
  }

  return (
    <div className="space-y-6">
      {/* Current situation */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Nuvarande situation
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-500">Intäkter/mån</p>
            <p className="text-xl font-bold text-neutral-900">
              {formatCompact(baseData.revenue)}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-500">Kostnader/mån</p>
            <p className="text-xl font-bold text-neutral-900">
              {formatCompact(baseData.fixedCosts + baseData.variableCosts)}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-500">Resultat/mån</p>
            <p className={`text-xl font-bold ${baseData.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCompact(baseData.netProfit)}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-500">Kassa</p>
            <p className="text-xl font-bold text-neutral-900">
              {formatCompact(baseData.cashBalance)}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick scenarios */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Snabbval – Lägg till scenario
        </h2>
        <QuickScenarios onSelectScenario={handleSelectScenario} />
      </Card>

      {/* Changes list */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Dina förändringar ({changes.length})
          </h2>
          <div className="flex gap-2">
            {changes.length > 0 && (
              <Button variant="ghost" size="small" onClick={handleClearAll}>
                Rensa alla
              </Button>
            )}
            <Button
              variant="primary"
              size="small"
              onClick={() => setShowAddForm(true)}
            >
              + Lägg till egen
            </Button>
          </div>
        </div>

        {showAddForm ? (
          <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <ChangeForm
              onAddChange={handleAddChange}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        ) : null}

        <ChangesList changes={changes} onRemoveChange={handleRemoveChange} />
      </Card>

      {/* Timeline chart */}
      {changes.length > 0 && (
        <>
          <Card padding="none">
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Prognos
                </h2>
                <div className="flex gap-2">
                  {(['cash', 'profit', 'revenue'] as const).map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedMetric === metric
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {metric === 'cash' ? 'Kassa' : metric === 'profit' ? 'Resultat' : 'Intäkter'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4">
              <TimelineChart
                projections={projectionResult.projections}
                metric={selectedMetric}
              />
            </div>
          </Card>

          {/* Summary */}
          <ProjectionSummary result={projectionResult} />

          {/* Monthly breakdown table */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Månadsvis uppdelning
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 px-3 font-medium text-neutral-500">Månad</th>
                    <th className="text-right py-2 px-3 font-medium text-neutral-500">Intäkter</th>
                    <th className="text-right py-2 px-3 font-medium text-neutral-500">Kostnader</th>
                    <th className="text-right py-2 px-3 font-medium text-neutral-500">Resultat</th>
                    <th className="text-right py-2 px-3 font-medium text-neutral-500">Kassa</th>
                    <th className="text-right py-2 px-3 font-medium text-neutral-500">Skillnad</th>
                  </tr>
                </thead>
                <tbody>
                  {projectionResult.projections.map((p) => (
                    <tr key={p.monthLabel} className="border-b border-neutral-100">
                      <td className="py-2 px-3 font-medium">{p.monthLabel}</td>
                      <td className="py-2 px-3 text-right">
                        {formatCompact(p.simulatedRevenue)}
                        {p.revenueDifference !== 0 && (
                          <span className={`ml-1 text-xs ${p.revenueDifference > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ({formatCompact(p.revenueDifference)})
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {formatCompact(p.simulatedExpenses)}
                        {p.expensesDifference !== 0 && (
                          <span className={`ml-1 text-xs ${p.expensesDifference < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ({formatCompact(p.expensesDifference)})
                          </span>
                        )}
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${p.simulatedProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCompact(p.simulatedProfit)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {formatCompact(p.simulatedCash)}
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${p.cashDifference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCompact(p.cashDifference)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

