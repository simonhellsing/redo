import { createServerSupabase } from '@/lib/supabase'

export async function getCurrentUser() {
  const supabase = await createServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Fetch profile with role
  let { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, try to create it with default 'administrator' role
  // Use upsert to handle race conditions (if trigger creates it simultaneously)
  if (!profile || fetchError?.code === 'PGRST116') {
    const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User'
    
    // Use upsert to avoid conflicts if trigger creates it at the same time
    const { data: newProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name,
        role: 'administrator',
      }, {
        onConflict: 'id',
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Error upserting profile:', {
        message: upsertError.message,
        code: upsertError.code,
        details: upsertError.details,
        hint: upsertError.hint,
        error: upsertError,
      })
      
      // If upsert fails, try to fetch again (might have been created by trigger)
      const { data: retryProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (retryProfile) {
        profile = retryProfile
      } else {
        // Return user without profile if creation fails
        // This will cause requireAdministrator to redirect to unauthorized
        return {
          ...user,
          profile: null,
        }
      }
    } else if (newProfile) {
      profile = newProfile
    }
  }

  return {
    ...user,
    profile,
  }
}

