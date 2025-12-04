import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { NextRequest } from 'next/server'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolve the base URL for generating absolute links.
 *
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL (explicit, works in all environments)
 * 2. VERCEL_URL (set automatically on Vercel)
 * 3. request.nextUrl.origin (falls back to the incoming request)
 * 4. http://localhost:3000 (final fallback for local dev)
 */
export function getBaseUrl(request?: NextRequest) {
  const clean = (url: string) => url.replace(/\/$/, '')

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return clean(process.env.NEXT_PUBLIC_APP_URL)
  }

  if (process.env.VERCEL_URL) {
    return clean(`https://${process.env.VERCEL_URL}`)
  }

  if (request) {
    const origin = request.nextUrl.origin
    if (origin) {
      return clean(origin)
    }
  }

  // Local dev default
  return 'http://localhost:3000'
}

