import { createServerSupabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/login')
}

