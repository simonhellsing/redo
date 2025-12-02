import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/my-reports" className="text-xl font-bold text-[var(--brand-primary)]">
                Redo
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/my-reports">
                <Button variant="ghost" size="sm">
                  My Reports
                </Button>
              </Link>
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="ghost" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

