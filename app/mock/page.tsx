import { InsightsPresentation } from '@/components/insights/InsightsPresentation'
import { mockFinancialData } from '@/lib/insights/mockData'

export const metadata = {
  title: 'Ekonomisk Sammanfattning | Mock',
  description: 'Interaktiv presentation av ekonomisk data',
}

export default function MockPage() {
  return <InsightsPresentation data={mockFinancialData} />
}


