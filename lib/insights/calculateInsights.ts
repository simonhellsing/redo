import {
  MonthlyFinancialData,
  CalculatedScenarios,
  GrowthProposal,
} from './mockData'

/**
 * Calculate all insights and scenarios from financial data
 */
export function calculateInsights(
  data: MonthlyFinancialData
): CalculatedScenarios {
  const monthsRemaining = 12 - data.period.monthNumber

  // Status quo projection (if rest of year looks like this month)
  const statusQuo = calculateStatusQuo(data, monthsRemaining)

  // What-if: +10% revenue
  const revenue10PctUp = calculateRevenueIncrease(data, 0.1, monthsRemaining)

  // What-if: -10% costs
  const costs10PctDown = calculateCostReduction(data, 0.1, monthsRemaining)

  // Runway calculation
  const runway = calculateRunway(data)

  // Growth proposals (only relevant if profitable or has cash)
  const growthProposals = generateGrowthProposals(data)

  return {
    statusQuo,
    revenue10PctUp,
    costs10PctDown,
    runway,
    growthProposals,
  }
}

function calculateStatusQuo(
  data: MonthlyFinancialData,
  monthsRemaining: number
) {
  const yearEndRevenue = data.revenue * 12
  const yearEndProfit = data.netProfit * 12
  const yearEndCash = data.cashBalance + data.netProfit * monthsRemaining

  return {
    yearEndRevenue,
    yearEndProfit,
    yearEndCash,
    monthsRemaining,
  }
}

function calculateRevenueIncrease(
  data: MonthlyFinancialData,
  percentage: number,
  monthsRemaining: number
) {
  const increaseAmount = data.revenue * percentage
  const newMonthlyRevenue = data.revenue + increaseAmount
  const yearlyImpact = increaseAmount * 12
  const additionalProfit = increaseAmount * monthsRemaining
  const newYearEndCash =
    data.cashBalance + data.netProfit * monthsRemaining + additionalProfit

  return {
    newMonthlyRevenue,
    yearlyImpact,
    newYearEndCash,
  }
}

function calculateCostReduction(
  data: MonthlyFinancialData,
  percentage: number,
  monthsRemaining: number
) {
  const totalCosts = data.fixedCosts + data.variableCosts
  const savings = totalCosts * percentage
  const newMonthlyCosts = totalCosts - savings
  const yearlyImpact = savings * 12
  const additionalSavings = savings * monthsRemaining
  const newYearEndCash =
    data.cashBalance + data.netProfit * monthsRemaining + additionalSavings

  return {
    newMonthlyCosts,
    yearlyImpact,
    newYearEndCash,
  }
}

function calculateRunway(data: MonthlyFinancialData) {
  // If profitable, runway is essentially infinite (or based on cash reserve)
  if (data.netProfit >= 0) {
    // Still calculate months of cash as safety buffer
    const monthsOfCash = Math.floor(data.cashBalance / data.burnRate)
    return {
      monthsOfCash,
      isCritical: false,
    }
  }

  // If losing money, calculate bankruptcy timeline
  const monthlyLoss = Math.abs(data.netProfit)
  const bankruptcyMonths = Math.floor(data.cashBalance / monthlyLoss)

  return {
    monthsOfCash: bankruptcyMonths,
    isCritical: bankruptcyMonths <= 6,
    bankruptcyMonths,
  }
}

function generateGrowthProposals(
  data: MonthlyFinancialData
): GrowthProposal[] {
  const proposals: GrowthProposal[] = []

  // Only suggest growth if company is profitable or has runway
  const hasRunway = data.cashBalance > data.burnRate * 3

  if (data.netProfit > 0 || hasRunway) {
    // LinkedIn advertising proposal
    const linkedInInvestment = 50000
    const expectedNewCustomers = 2
    const customerMonthlyValue = 25000
    const linkedInTimeframe = 3
    const linkedInReturn =
      expectedNewCustomers * customerMonthlyValue * linkedInTimeframe
    const linkedInNetReturn = linkedInReturn - linkedInInvestment

    proposals.push({
      id: 'linkedin-ads',
      name: 'LinkedIn-annonsering',
      description: `Investera ${formatCompact(linkedInInvestment)} i LinkedIn-annonsering för att nå ${expectedNewCustomers} nya kunder`,
      investment: linkedInInvestment,
      expectedReturn: linkedInNetReturn,
      timeframeMonths: linkedInTimeframe,
      roi: Math.round((linkedInNetReturn / linkedInInvestment) * 100),
    })

    // New salesperson proposal
    const salespersonMonthlyCost = 45000
    const customersPerMonth = 2
    const salespersonTimeframe = 6
    const salespersonRevenue =
      customersPerMonth * customerMonthlyValue * salespersonTimeframe
    const salespersonCost = salespersonMonthlyCost * salespersonTimeframe
    const salespersonNetReturn = salespersonRevenue - salespersonCost
    const breakEvenMonths = Math.ceil(
      salespersonMonthlyCost / (customersPerMonth * customerMonthlyValue - salespersonMonthlyCost)
    )

    proposals.push({
      id: 'new-salesperson',
      name: 'Ny säljare',
      description: `Anställ en säljare som tar in ${customersPerMonth} kunder/månad`,
      investment: 0,
      monthlyCost: salespersonMonthlyCost,
      expectedReturn: salespersonNetReturn,
      timeframeMonths: salespersonTimeframe,
      roi: Math.round((salespersonNetReturn / salespersonCost) * 100),
    })

    // Price increase proposal (always zero investment)
    const priceIncreasePercent = 0.05
    const priceIncreaseYearlyReturn = data.revenue * priceIncreasePercent * 12

    proposals.push({
      id: 'price-increase',
      name: 'Prisökning 5%',
      description:
        'Höj priset med 5% - minimalt kundbortfall förväntas',
      investment: 0,
      expectedReturn: priceIncreaseYearlyReturn,
      timeframeMonths: 12,
      roi: Infinity, // No investment, pure return
    })
  }

  return proposals
}

function formatCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} mkr`
  }
  if (value >= 1000) {
    return `${Math.round(value / 1000)} tkr`
  }
  return `${value} kr`
}

/**
 * Calculate revenue change percentage
 */
export function calculateRevenueChange(data: MonthlyFinancialData): number {
  if (data.previousMonthRevenue === 0) return 0
  return (
    ((data.revenue - data.previousMonthRevenue) / data.previousMonthRevenue) *
    100
  )
}

/**
 * Calculate revenue per employee
 */
export function calculateRevenuePerEmployee(
  data: MonthlyFinancialData
): number | null {
  if (!data.employees || data.employees === 0) return null
  return data.revenue / data.employees
}

/**
 * Format a number as SEK with space separator
 */
export function formatSEK(value: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format a number in millions (mkr)
 */
export function formatMillions(value: number): string {
  const millions = value / 1000000
  return `${millions.toFixed(1).replace('.', ',')} mkr`
}

/**
 * Format percentage with sign
 */
export function formatPercentage(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(0)}%`
}

