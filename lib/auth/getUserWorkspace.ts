import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from './requireAdministrator'

export async function getUserWorkspace() {
  const user = await requireAdministrator()
  const supabase = await createServerSupabase()

  // Get user's workspace (for MVP, assume one workspace per user)
  // First check if user owns a workspace
  const { data: ownedWorkspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  if (ownedWorkspace) {
    return ownedWorkspace
  }

  // Otherwise, get first workspace they're a member of
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(*)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (membership && membership.workspaces) {
    return membership.workspaces as any
  }

  return null
}

