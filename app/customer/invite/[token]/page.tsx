import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createServerSupabase } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import { AcceptInvitationForm } from '@/components/auth/AcceptInvitationForm'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createServerSupabase()

  const { data: invitation } = await supabase
    .from('invitations')
    .select('*, customers(*)')
    .eq('token', token)
    .eq('type', 'customer')
    .is('accepted_at', null)
    .single()

  if (!invitation) {
    notFound()
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <h1 className="text-xl font-bold mb-4">Invitation Expired</h1>
          <p className="text-gray-600">This invitation link has expired.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome to Redo</h1>
        <p className="text-center text-gray-600 mb-6">
          You've been invited to view reports for{' '}
          <span className="font-semibold">{(invitation.customers as any)?.name}</span>
        </p>
        <AcceptInvitationForm invitation={invitation} />
      </Card>
    </div>
  )
}

