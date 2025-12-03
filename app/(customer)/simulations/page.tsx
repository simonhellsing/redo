import { Card } from '@/components/ui/Card'
import { getCustomerUserInfo } from '@/lib/auth/getCustomerUserInfo'

export default async function SimulationsPage() {
  const customerInfo = await getCustomerUserInfo()

  if (!customerInfo?.customer) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Simuleringar</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Ingen kund kopplad till ditt konto.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Simuleringar</h1>
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">Simuleringar kommer snart.</p>
        </div>
      </Card>
    </div>
  )
}

