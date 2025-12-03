import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { requireCustomer } from '@/lib/auth/requireCustomer'
import { getCustomerUserInfo } from '@/lib/auth/getCustomerUserInfo'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

export default async function CustomerRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireCustomer()
  const customerInfo = await getCustomerUserInfo()
  
  const workspaceLogo = customerInfo?.workspace?.logo_url ? (
    <ImageWithFallback
      src={customerInfo.workspace.logo_url}
      alt={`${customerInfo.workspace.name} logo`}
      className="w-full h-full object-cover rounded-[6px]"
    />
  ) : undefined

  return (
    <CustomerLayout
      userName={user.profile?.name || undefined}
      userEmail={user.email || undefined}
      workspaceName={customerInfo?.workspace?.name || 'Redo'}
      workspaceLogo={customerInfo?.workspace?.logo_url || undefined}
    >
      {children}
    </CustomerLayout>
  )
}

