import { Card } from '@/components/ui/Card'
import { getUserWorkspace } from '@/lib/auth/getUserWorkspace'
import { CustomerForm } from '@/components/admin/CustomerForm'

export default async function NewCustomerPage() {
  const workspace = await getUserWorkspace()

  if (!workspace) {
    return (
      <div>
        <p>Please create a workspace first.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Customer</h1>
      
      <Card className="max-w-2xl">
        <CustomerForm workspaceId={workspace.id} />
      </Card>
    </div>
  )
}

