'use client'

import { useAddCustomerModal } from './AddCustomerModalContext'
import type { Customer } from '@/lib/types/customer'

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

