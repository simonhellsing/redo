import { Card } from '@/components/ui/Card'
import { createServerSupabase } from '@/lib/supabase'
import { getUserWorkspace } from '@/lib/auth/getUserWorkspace'
import { notFound } from 'next/navigation'
import { CustomerForm } from '@/components/admin/CustomerForm'

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ customerId: string }>
}) {
  try {
    const { customerId } = await params
    const workspace = await getUserWorkspace()
    
    if (!workspace) {
      notFound()
    }

    const supabase = await createServerSupabase()

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('workspace_id', workspace.id)
      .single()

    if (error || !customer) {
      notFound()
    }

    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Customer</h1>
        
        <Card className="max-w-2xl">
          <CustomerForm 
            customer={customer} 
            workspaceId={workspace.id}
          />
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading edit customer page:', error)
    notFound()
  }
}

