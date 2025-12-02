import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { requireCustomer } from '@/lib/auth/requireCustomer'

export default async function CustomerRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireCustomer()
  
  return <CustomerLayout>{children}</CustomerLayout>
}

