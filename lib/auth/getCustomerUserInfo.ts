import { createAdminSupabase } from '@/lib/supabase/server'
import { getCurrentUser } from './getCurrentUser'

export async function getCustomerUserInfo() {
  const user = await getCurrentUser()
  // We only require that the user is authenticated here.
  // Role is not strictly enforced because some invited customer users
  // may have been created with a different default role in their profile.
  if (!user) {
    return null
  }

  // Use admin client so we can reliably read the customer_users mapping and related
  // customer/workspace info even when RLS is strict, while still scoping by user_id.
  const adminSupabase = createAdminSupabase()

  // Get customer_user record to find which customer this user belongs to
  const { data: customerUser } = await adminSupabase
    .from('customer_users')
    .select('customer_id, workspace_id, customers(*, workspaces(*))')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!customerUser) {
    // Fallback: use customer_id from user metadata if present (for older or
    // partially-migrated accounts that don't yet have a customer_users row).
    const metaCustomerId = (user.user_metadata as any)?.customer_id
    if (!metaCustomerId) {
      return null
    }

    const { data: customer } = await adminSupabase
      .from('customers')
      .select('*')
      .eq('id', metaCustomerId)
      .single()

    if (!customer) {
      return null
    }

    let workspace: any = null
    if (customer.workspace_id) {
      const { data: workspaceData } = await adminSupabase
        .from('workspaces')
        .select('id, name, logo_url')
        .eq('id', customer.workspace_id)
        .single()
      if (workspaceData) {
        workspace = workspaceData
      }
    }

    return {
      user,
      customer,
      workspace,
    }
  }

  const customer = (customerUser as any).customers

  // Try to get full workspace info (including name and logo) from the join.
  let workspace: any = customer?.workspaces || (customerUser.workspace_id ? { id: customerUser.workspace_id } : null)

  // If we only have an id (because RLS prevented loading workspace fields),
  // fall back to an admin client to safely fetch just this workspace's basic info.
  if (workspace && (!workspace.name || !workspace.logo_url) && customerUser.workspace_id) {
    try {
      const { data: workspaceData, error: workspaceError } = await adminSupabase
        .from('workspaces')
        .select('id, name, logo_url')
        .eq('id', customerUser.workspace_id)
        .single()

      if (!workspaceError && workspaceData) {
        workspace = workspaceData
      }
    } catch (err) {
      // If this fails for any reason, just keep the minimal workspace object
      console.error('Failed to load workspace info for customer user:', err)
    }
  }

  return {
    user,
    customer,
    workspace,
  }
}

