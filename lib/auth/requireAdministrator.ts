import { redirect } from 'next/navigation'
import { getCurrentUser } from './getCurrentUser'

export async function requireAdministrator() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // If profile doesn't exist or role is not 'administrator', redirect to unauthorized
  if (!user.profile || user.profile.role !== 'administrator') {
    console.error('User does not have administrator role:', {
      userId: user.id,
      profile: user.profile,
      email: user.email,
    })
    redirect('/unauthorized')
  }

  return user
}

