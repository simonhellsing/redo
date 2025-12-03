'use client'

import { Button } from '@/components/ui/Button'
import { useAddCustomerModal } from './AddCustomerModalContext'
import type { Customer } from '@/lib/types/customer'

interface EditCustomerButtonProps {
  customer: Customer
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'navigation' | 'tertiary'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function EditCustomerButton({
  customer,
  children = 'Edit',
  variant = 'secondary',
  size = 'small',
  className,
}: EditCustomerButtonProps) {
  const { openEditModal } = useAddCustomerModal()

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={() => openEditModal(customer)}
      className={className}
    >
      {children}
    </Button>
  )
}

