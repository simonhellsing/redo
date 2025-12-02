import React from 'react'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { getUserWorkspace } from '@/lib/auth/getUserWorkspace'
import { createServerSupabase } from '@/lib/supabase'
import { AdminLayoutWithNavigation } from '@/components/layout/AdminLayoutWithNavigation'

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdministrator()
  
  const workspace = await getUserWorkspace()
  
  // If no workspace, render without navigation (for workspace setup page)
  if (!workspace) {
    return (
      <div className="w-full h-screen overflow-hidden bg-[#ffffff]">
        {children}
      </div>
    )
  }

  const supabase = await createServerSupabase()
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, logo_url')
    .eq('workspace_id', workspace.id)
    .order('name', { ascending: true })

  // Apply branding colors to CSS variables
  const brandingStyle = {
    '--brand-primary': workspace.primary_color || '#3b82f6',
    '--brand-accent': workspace.accent_color || '#8b5cf6',
  } as React.CSSProperties

  return (
    <div style={brandingStyle} className="h-full w-full">
      <AdminLayoutWithNavigation
        workspace={{
          id: workspace.id,
          name: workspace.name || 'Workspace',
          logo_url: workspace.logo_url || null,
        }}
        customers={customers || []}
        userName={user.profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
        userEmail={user.email || undefined}
      >
        {children}
      </AdminLayoutWithNavigation>
    </div>
  )
}

