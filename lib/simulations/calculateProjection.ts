import { MonthlyFinancialData } from '@/lib/insights/mockData'
import {
  SimulationChange,
  MonthProjection,
  ProjectionResult,
} from './types'

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec',
]

function getMonthLabel(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

function isSameOrAfter(date: Date, reference: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  const r = new Date(reference.getFullYear(), reference.getMonth(), 1)
  return d >= r
}

function isBefore(date: Date, reference: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  const r = new Date(reference.getFullYear(), reference.getMonth(), 1)
  return d < r
}

function isChangeActiveInMonth(change: SimulationChange, month: Date): boolean {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
  
  // Check if the change has started
  if (isBefore(monthStart, change.startDate)) {
    return false
  }
  
  // Check if the change has ended (for non-recurring or time-limited changes)
  if (change.endDate && isSameOrAfter(monthStart, change.endDate)) {
    return false
  }
  
  // For one-time changes, only apply in the start month
  if (!change.isRecurring) {
    const changeMonth = new Date(change.startDate.getFullYear(), change.startDate.getMonth(), 1)
    return monthStart.getTime() === changeMonth.getTime()
  }
  
  return true
}

export function calculateProjection(
  baseData: MonthlyFinancialData,
  changes: SimulationChange[],
  projectionMonths: number = 12
): ProjectionResult {
  const projections: MonthProjection[] = []
  
  // Start from current month
  const startDate = new Date()
  startDate.setDate(1) // First of the month
  
  let baseCash = baseData.cashBalance
  let simulatedCash = baseData.cashBalance
  
  let totalRevenueDiff = 0
  let totalExpensesDiff = 0
  let totalProfitDiff = 0
  let breakEvenMonth: string | undefined
  
  for (let i = 0; i < projectionMonths; i++) {
    const month = new Date(startDate)
    month.setMonth(month.getMonth() + i)
    
    // Base case (extrapolating current month)
    const baseRevenue = baseData.revenue
    const baseExpenses = baseData.fixedCosts + baseData.variableCosts
    const baseProfit = baseRevenue - baseExpenses
    
    // Calculate changes for this month
    let revenueChange = 0
    let expensesChange = 0
    
    for (const change of changes) {
      if (!isChangeActiveInMonth(change, month)) {
        continue
      }
      
      switch (change.type) {
        case 'revenue':
        case 'one_time_revenue':
          revenueChange += change.amount
          break
        case 'cost_reduction':
          // Negative amount = reduction, positive = increase
          expensesChange += change.amount
          break
        case 'one_time_cost':
          expensesChange += Math.abs(change.amount)
          break
      }
    }
    
    const simulatedRevenue = baseRevenue + revenueChange
    const simulatedExpenses = baseExpenses + expensesChange
    const simulatedProfit = simulatedRevenue - simulatedExpenses
    
    // Update cash balances
    baseCash += baseProfit
    simulatedCash += simulatedProfit
    
    const revenueDifference = simulatedRevenue - baseRevenue
    const expensesDifference = simulatedExpenses - baseExpenses
    const profitDifference = simulatedProfit - baseProfit
    const cashDifference = simulatedCash - baseCash
    
    totalRevenueDiff += revenueDifference
    totalExpensesDiff += expensesDifference
    totalProfitDiff += profitDifference
    
    // Check for break-even (when cumulative investment is recovered)
    if (!breakEvenMonth && totalProfitDiff > 0 && i > 0) {
      // Check if we crossed from negative to positive
      const prevProjection = projections[i - 1]
      if (prevProjection) {
        const prevCumulativeProfit = projections.reduce(
          (sum, p) => sum + p.profitDifference,
          0
        ) - profitDifference
        if (prevCumulativeProfit < 0 && totalProfitDiff >= 0) {
          breakEvenMonth = getMonthLabel(month)
        }
      }
    }
    
    projections.push({
      month,
      monthLabel: getMonthLabel(month),
      baseRevenue,
      baseExpenses,
      baseProfit,
      baseCash,
      simulatedRevenue,
      simulatedExpenses,
      simulatedProfit,
      simulatedCash,
      revenueDifference,
      expensesDifference,
      profitDifference,
      cashDifference,
    })
  }
  
  const lastProjection = projections[projections.length - 1]
  
  return {
    projections,
    summary: {
      totalRevenueDifference: totalRevenueDiff,
      totalExpensesDifference: totalExpensesDiff,
      totalProfitDifference: totalProfitDiff,
      finalCashDifference: lastProjection?.cashDifference || 0,
      breakEvenMonth,
    },
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCompact(value: number): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''
  
  if (absValue >= 1000000) {
    return `${sign}${(absValue / 1000000).toFixed(1).replace('.', ',')} mkr`
  }
  if (absValue >= 1000) {
    return `${sign}${Math.round(absValue / 1000)} tkr`
  }
  return `${sign}${absValue} kr`
}

