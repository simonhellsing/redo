import { createServerSupabase } from '@/lib/supabase'
import { getCurrentUser } from './getCurrentUser'

export async function getCustomerUserInfo() {
  const user = await getCurrentUser()
  
  if (!user || user.profile?.role !== 'customer') {
    return null
  }

  const supabase = await createServerSupabase()

  // Get customer_user record to find which customer this user belongs to
  const { data: customerUser } = await supabase
    .from('customer_users')
    .select('customer_id, workspace_id, customers(*, workspaces(*))')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!customerUser) {
    return null
  }

  const customer = (customerUser as any).customers
  // Use workspace_id from customer_users if available, otherwise from customer
  const workspace = customer?.workspaces || (customerUser.workspace_id ? { id: customerUser.workspace_id } : null)

  return {
    user,
    customer,
    workspace,
  }
}

