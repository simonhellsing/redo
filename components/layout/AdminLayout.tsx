import React from 'react'
import { getUserWorkspace } from '@/lib/auth/getUserWorkspace'
import { AdminNav } from './AdminNav'

export async function AdminLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getUserWorkspace()

  // Apply branding colors to CSS variables
  const brandingStyle = workspace
    ? {
        '--brand-primary': workspace.primary_color || '#3b82f6',
        '--brand-accent': workspace.accent_color || '#8b5cf6',
      } as React.CSSProperties
    : undefined

  return (
    <div className="min-h-screen bg-gray-50" style={brandingStyle}>
      <AdminNav 
        logoUrl={workspace?.logo_url}
        workspaceName={workspace?.name}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

