'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

interface AdminNavProps {
  logoUrl?: string | null
  workspaceName?: string | null
}

export function AdminNav({ logoUrl, workspaceName }: AdminNavProps) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {logoUrl ? (
                <Link href="/overview">
                  <ImageWithFallback
                    src={logoUrl}
                    alt={workspaceName || 'Redo'}
                    className="h-8"
                  />
                </Link>
              ) : (
                <Link href="/overview" className="text-xl font-bold text-[var(--brand-primary)]">
                  Redo
                </Link>
              )}
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/overview"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Översikt
              </Link>
              <Link
                href="/customers"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Customers
              </Link>
              <Link
                href="/settings/branding"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Inställningar
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="tertiary" size="small">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}

