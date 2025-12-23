export type GrowthProposal = {
  id: string
  name: string
  description: string
  investment: number
  monthlyCost?: number
  expectedReturn: number
  timeframeMonths: number
  roi: number // percentage
}

export type MonthlyFinancialData = {
  companyName: string
  period: {
    month: string
    monthNumber: number
    year: number
  }

  // Från huvudbok
  revenue: number
  previousMonthRevenue: number
  fixedCosts: number // 5000-serien: lokalhyra, löner, försäkring
  variableCosts: number // 4000-serien: inköp, material

  // Kassa
  cashBalance: number

  // Beräknade
  netProfit: number
  profitMargin: number
  burnRate: number // månadsvis burn rate om negativt resultat

  // Employees (optional, för intäkt/anställd)
  employees?: number
}

export type CalculatedScenarios = {
  // Framtidsprognos om status quo
  statusQuo: {
    yearEndRevenue: number
    yearEndProfit: number
    yearEndCash: number
    monthsRemaining: number
  }

  // What-if scenarios
  revenue10PctUp: {
    newMonthlyRevenue: number
    yearlyImpact: number
    newYearEndCash: number
  }

  costs10PctDown: {
    newMonthlyCosts: number
    yearlyImpact: number
    newYearEndCash: number
  }

  // Runway
  runway: {
    monthsOfCash: number
    isCritical: boolean
    bankruptcyMonths?: number
  }

  // Tillväxtförslag
  growthProposals: GrowthProposal[]
}

export const mockFinancialData: MonthlyFinancialData = {
  companyName: 'Exemplum AB',
  period: {
    month: 'November',
    monthNumber: 11,
    year: 2024,
  },

  // Från huvudbok
  revenue: 425000,
  previousMonthRevenue: 393500,
  fixedCosts: 180000, // Löner, hyra, försäkringar
  variableCosts: 95000, // Inköp, material, fraktRR

  // Kassa
  cashBalance: 890000,

  // Beräknade
  netProfit: 150000, // 425000 - 180000 - 95000
  profitMargin: 0.353, // 150000 / 425000
  burnRate: 275000, // fasta + rörliga kostnader

  // Anställda
  employees: 4,
}

// Alternative mock data for a struggling company
export const mockFinancialDataNegative: MonthlyFinancialData = {
  companyName: 'Krisbolaget AB',
  period: {
    month: 'November',
    monthNumber: 11,
    year: 2024,
  },

  revenue: 180000,
  previousMonthRevenue: 210000,
  fixedCosts: 185000,
  variableCosts: 45000,

  cashBalance: 320000,

  netProfit: -50000, // 180000 - 185000 - 45000
  profitMargin: -0.278,
  burnRate: 230000,

  employees: 3,
}

