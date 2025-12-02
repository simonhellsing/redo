import { createServerSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerSupabase()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Check if trigger exists (this is a read-only check)
    let triggerExists = false
    try {
      await supabase.rpc('pg_get_functiondef', { funcid: 'public.handle_new_user()' })
      triggerExists = true
    } catch {
      triggerExists = false
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile,
      profileError: profileError ? {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      } : null,
      triggerExists,
      recommendations: !profile ? [
        'Profile does not exist. Run the SQL fix: CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);',
        'Or ensure the database trigger is set up correctly.',
      ] : [],
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}

