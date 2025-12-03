import React from 'react'
import { headers } from 'next/headers'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getUserWorkspace } from '@/lib/auth/getUserWorkspace'
import { createServerSupabase } from '@/lib/supabase'
import { AdminLayoutWithNavigation } from '@/components/layout/AdminLayoutWithNavigation'
import { redirect } from 'next/navigation'

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // For workspace setup page, allow access even if profile doesn't exist yet
  // (new users need to access this page to set up their workspace)
  const isWorkspaceSetup = pathname === '/overview/workspace-setup'
  
  let user
  let workspace = null
  
  if (isWorkspaceSetup) {
    // For workspace setup, use getCurrentUser which will create profile if needed
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      redirect('/login')
    }
    // If profile doesn't exist, getCurrentUser should have created it
    // But if it still doesn't exist, allow access anyway for workspace setup
    user = currentUser
    // Don't try to get workspace for setup page - we know there isn't one yet
    // Just render the setup page without navigation
    return (
      <div className="w-full h-screen overflow-hidden bg-[#ffffff]">
        {children}
      </div>
    )
  } else {
    // For other pages, require administrator role
    user = await requireAdministrator()
    workspace = await getUserWorkspace()
    
    // If no workspace, redirect to workspace setup
    if (!workspace) {
      redirect('/overview/workspace-setup')
    }
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

