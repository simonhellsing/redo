import { QuickScenario, SimulationChange } from './types'
import { MonthlyFinancialData } from '@/lib/insights/mockData'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export const quickScenarios: QuickScenario[] = [
  {
    id: 'new-customer',
    name: 'Ny kund',
    description: 'Lägg till en ny kund som betalar 25 000 kr/månad',
    icon: '👤',
    color: 'emerald',
    createChanges: (startDate: Date): SimulationChange[] => [
      {
        id: generateId(),
        type: 'revenue',
        description: 'Ny kund - 25 000 kr/månad',
        amount: 25000,
        startDate,
        isRecurring: true,
      },
    ],
  },
  {
    id: 'cost-reduction',
    name: 'Kostnadssänkning 10%',
    description: 'Minska kostnaderna med 10% från valt datum',
    icon: '✂️',
    color: 'violet',
    createChanges: (startDate: Date, baseData: MonthlyFinancialData): SimulationChange[] => {
      const totalCosts = baseData.fixedCosts + baseData.variableCosts
      const reduction = totalCosts * 0.1
      return [
        {
          id: generateId(),
          type: 'cost_reduction',
          description: 'Kostnadssänkning 10%',
          amount: -reduction,
          startDate,
          isRecurring: true,
        },
      ]
    },
  },
  {
    id: 'marketing-campaign',
    name: 'LinkedIn-kampanj',
    description: '50 000 kr investering → 2 nya kunder efter 2 månader',
    icon: '📣',
    color: 'blue',
    createChanges: (startDate: Date): SimulationChange[] => {
      const customerStartDate = addMonths(startDate, 2)
      return [
        {
          id: generateId(),
          type: 'one_time_cost',
          description: 'LinkedIn-kampanj investering',
          amount: -50000,
          startDate,
          isRecurring: false,
        },
        {
          id: generateId(),
          type: 'revenue',
          description: '2 nya kunder från kampanj (50 000 kr/mån)',
          amount: 50000,
          startDate: customerStartDate,
          isRecurring: true,
        },
      ]
    },
  },
  {
    id: 'price-increase',
    name: 'Prishöjning 5%',
    description: 'Höj intäkterna med 5% genom prishöjning',
    icon: '💰',
    color: 'amber',
    createChanges: (startDate: Date, baseData: MonthlyFinancialData): SimulationChange[] => {
      const increase = baseData.revenue * 0.05
      return [
        {
          id: generateId(),
          type: 'revenue',
          description: 'Prishöjning 5%',
          amount: increase,
          startDate,
          isRecurring: true,
        },
      ]
    },
  },
  {
    id: 'new-employee',
    name: 'Ny säljare',
    description: '45 000 kr/mån kostnad → +50 000 kr intäkter efter 2 månader',
    icon: '👔',
    color: 'blue',
    createChanges: (startDate: Date): SimulationChange[] => {
      const revenueStartDate = addMonths(startDate, 2)
      return [
        {
          id: generateId(),
          type: 'cost_reduction', // Using negative means it's an increase
          description: 'Ny säljare - lönekostnad',
          amount: 45000, // This will be added to costs
          startDate,
          isRecurring: true,
        },
        {
          id: generateId(),
          type: 'revenue',
          description: 'Ny säljare - intäkter från nya kunder',
          amount: 50000,
          startDate: revenueStartDate,
          isRecurring: true,
        },
      ]
    },
  },
]

export function getScenarioById(id: string): QuickScenario | undefined {
  return quickScenarios.find((s) => s.id === id)
}

