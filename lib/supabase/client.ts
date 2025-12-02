import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client (for use in Client Components)
// Uses createBrowserClient from @supabase/ssr for proper cookie handling
export const createClientSupabase = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

