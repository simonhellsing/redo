import { SimulationsView } from '@/components/simulations/SimulationsView'
import { mockFinancialData } from '@/lib/insights/mockData'
import Link from 'next/link'

export const metadata = {
  title: 'Simuleringar | Mock',
  description: 'Testa olika scenarios och se hur de påverkar din ekonomi',
}

export default function MockSimulationsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/mock"
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              ← Tillbaka till presentation
            </Link>
          </div>
          <h1 className="text-lg font-semibold text-neutral-900">
            Simuleringar – {mockFinancialData.companyName}
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">
            Testa olika scenarios
          </h2>
          <p className="text-neutral-500 mt-1">
            Lägg till förändringar och se hur de påverkar din prognos över tid.
          </p>
        </div>

        <SimulationsView baseData={mockFinancialData} />
      </main>
    </div>
  )
}

