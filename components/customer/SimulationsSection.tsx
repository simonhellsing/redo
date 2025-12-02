'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface SimulationsSectionProps {
  reportContent: any
}

export function SimulationsSection({ reportContent }: SimulationsSectionProps) {
  const [revenueAdjustment, setRevenueAdjustment] = useState(0)
  const [costAdjustment, setCostAdjustment] = useState(0)
  const [simulatedResult, setSimulatedResult] = useState<number | null>(null)

  const baseRevenue = reportContent.revenue || 0
  const baseCosts = reportContent.expenses || 0
  const baseProfit = reportContent.profit || 0

  function runSimulation() {
    // Simple simulation: adjust revenue and costs, recalculate profit
    const adjustedRevenue = baseRevenue * (1 + revenueAdjustment / 100)
    const adjustedCosts = baseCosts * (1 + costAdjustment / 100)
    const newProfit = adjustedRevenue - adjustedCosts
    
    setSimulatedResult(newProfit)
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">What-If Simulations</h2>
        <p className="text-gray-600 mb-6">
          Adjust key variables to see how they affect your financial results.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="revenue_adjustment">
              Revenue Adjustment (%)
            </Label>
            <Input
              id="revenue_adjustment"
              type="number"
              value={revenueAdjustment}
              onChange={(e) => setRevenueAdjustment(Number(e.target.value))}
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">
              Current: SEK {baseRevenue.toLocaleString()}
            </p>
          </div>

          <div>
            <Label htmlFor="cost_adjustment">
              Cost Adjustment (%)
            </Label>
            <Input
              id="cost_adjustment"
              type="number"
              value={costAdjustment}
              onChange={(e) => setCostAdjustment(Number(e.target.value))}
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">
              Current: SEK {baseCosts.toLocaleString()}
            </p>
          </div>
        </div>

        <Button onClick={runSimulation} className="mb-6">
          Run Simulation
        </Button>

        {simulatedResult !== null && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Simulation Results</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Adjusted Revenue:</span>
                <span className="font-medium">
                  SEK {(baseRevenue * (1 + revenueAdjustment / 100)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Adjusted Costs:</span>
                <span className="font-medium">
                  SEK {(baseCosts * (1 + costAdjustment / 100)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-semibold">Projected Profit:</span>
                <span className={`font-bold ${simulatedResult >= baseProfit ? 'text-green-600' : 'text-red-600'}`}>
                  SEK {simulatedResult.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Base profit: SEK {baseProfit.toLocaleString()}
                {simulatedResult !== baseProfit && (
                  <span className={`ml-2 ${simulatedResult >= baseProfit ? 'text-green-600' : 'text-red-600'}`}>
                    ({simulatedResult >= baseProfit ? '+' : ''}
                    {((simulatedResult - baseProfit) / baseProfit * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <p className="text-sm text-gray-500">
          Note: This is a simplified simulation. Real business scenarios may involve more complex calculations.
        </p>
      </Card>
    </div>
  )
}

