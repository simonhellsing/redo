'use client'

import { useAddCustomerModal } from './AddCustomerModalContext'

interface Customer {
  id: string
  name: string
  org_number: string | null
  contact_email: string | null
  notes: string | null
  logo_url: string | null
}

interface EditCustomerLinkProps {
  customer: Customer
  className?: string
  children?: React.ReactNode
}

export function EditCustomerLink({
  customer,
  className,
  children = 'Edit',
}: EditCustomerLinkProps) {
  const { openEditModal } = useAddCustomerModal()

  return (
    <button
      onClick={() => openEditModal(customer)}
      className={className}
    >
      {children}
    </button>
  )
}

