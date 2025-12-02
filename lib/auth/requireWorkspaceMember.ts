import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from './requireAdministrator'

export async function requireWorkspaceMember(workspaceId: string) {
  const user = await requireAdministrator()
  const supabase = await createServerSupabase()

  // Check if user is owner or member
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  if (!workspace) {
    redirect('/overview')
  }

  if (workspace.owner_id === user.id) {
    return { user, workspace, role: 'owner' as const }
  }

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect('/overview')
  }

  return { user, workspace, role: membership.role as 'owner' | 'collaborator' }
}

