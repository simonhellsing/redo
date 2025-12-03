import { Card } from '@/components/ui/Card'
import { createAdminSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AcceptAdminInvitationForm } from '@/components/auth/AcceptAdminInvitationForm'

export default async function AdminInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  
  try {
    const supabase = createAdminSupabase()

    // Query invitation
    const { data: invitations, error: invitationError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('type', 'administrator')
      .is('accepted_at', null)

    if (invitationError) {
      console.error('Error fetching invitation:', invitationError)
      return (
        <div className="bg-[var(--neutral-0)] min-h-screen flex items-center justify-center p-4 w-full">
          <div className="box-border flex flex-col gap-[20px] items-center px-5 py-10 w-full max-w-[400px]">
            <Card className="w-full">
              <h1 className="text-xl font-bold mb-4">Error</h1>
              <p className="text-gray-600">Error: {invitationError.message}</p>
              <p className="text-gray-500 text-sm mt-2">Token: {token}</p>
            </Card>
          </div>
        </div>
      )
    }

    if (!invitations || invitations.length === 0) {
      console.error('No invitation found for token:', token)
      return (
        <div className="bg-[var(--neutral-0)] min-h-screen flex items-center justify-center p-4 w-full">
          <div className="box-border flex flex-col gap-[20px] items-center px-5 py-10 w-full max-w-[400px]">
            <Card className="w-full">
              <h1 className="text-xl font-bold mb-4">Invitation Not Found</h1>
              <p className="text-gray-600">No invitation found for this token.</p>
              <p className="text-gray-500 text-sm mt-2">Token: {token}</p>
            </Card>
          </div>
        </div>
      )
    }

    const invitation = invitations[0]

    // Get workspace information
    let workspace = null
    if (invitation.workspace_id) {
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id, name, logo_url')
        .eq('id', invitation.workspace_id)
        .single()
      
      if (!workspaceError && workspaceData) {
        workspace = workspaceData
      }
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return (
        <div className="bg-[var(--neutral-0)] min-h-screen flex items-center justify-center p-4 w-full">
          <div className="box-border flex flex-col gap-[20px] items-center px-5 py-10 w-full max-w-[400px]">
            <Card className="w-full">
              <h1 className="text-xl font-bold mb-4">Invitation Expired</h1>
              <p className="text-gray-600">This invitation link has expired.</p>
            </Card>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-[var(--neutral-0)] min-h-screen flex items-center justify-center p-4 w-full">
        <div className="box-border flex flex-col gap-[20px] items-center px-5 py-10 w-full max-w-[400px]">
          <AcceptAdminInvitationForm
            invitation={invitation}
            workspaceName={workspace?.name}
            workspaceLogo={workspace?.logo_url}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Unexpected error in invite page:', error)
    notFound()
    return null
  }
}

