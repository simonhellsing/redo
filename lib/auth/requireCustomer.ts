import { redirect } from 'next/navigation'
import { getCurrentUser } from './getCurrentUser'

export async function requireCustomer() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.profile?.role !== 'customer') {
    redirect('/unauthorized')
  }

  return user
}

