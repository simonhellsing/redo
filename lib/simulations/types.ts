import { MonthlyFinancialData } from '@/lib/insights/mockData'

export type ChangeType =
  | 'revenue'
  | 'cost_reduction'
  | 'one_time_cost'
  | 'one_time_revenue'

export type SimulationChange = {
  id: string
  type: ChangeType
  description: string
  amount: number // Positive for revenue, negative for cost
  startDate: Date
  endDate?: Date // Optional - for time-limited changes
  isRecurring: boolean // Monthly vs one-time
}

export type SimulationState = {
  baseData: MonthlyFinancialData
  changes: SimulationChange[]
  projectionMonths: number // Default 12
}

export type MonthProjection = {
  month: Date
  monthLabel: string // e.g., "Jan 2025"
  baseRevenue: number
  baseExpenses: number
  baseProfit: number
  baseCash: number
  simulatedRevenue: number
  simulatedExpenses: number
  simulatedProfit: number
  simulatedCash: number
  revenueDifference: number
  expensesDifference: number
  profitDifference: number
  cashDifference: number
}

export type ProjectionResult = {
  projections: MonthProjection[]
  summary: {
    totalRevenueDifference: number
    totalExpensesDifference: number
    totalProfitDifference: number
    finalCashDifference: number
    breakEvenMonth?: string // If applicable
  }
}

export type QuickScenario = {
  id: string
  name: string
  description: string
  icon: string
  color: 'emerald' | 'violet' | 'amber' | 'blue' | 'red'
  createChanges: (startDate: Date, baseData: MonthlyFinancialData) => SimulationChange[]
}


