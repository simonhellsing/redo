'use client'

import { Button } from '@/components/ui/Button'
import { useAddCustomerModal } from './AddCustomerModalContext'

interface AddCustomerButtonProps {
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'navigation' | 'tertiary'
  size?: 'small' | 'medium' | 'large'
}

export function AddCustomerButton({
  children = 'Add Customer',
  variant = 'primary',
  size = 'medium',
}: AddCustomerButtonProps) {
  const { openModal } = useAddCustomerModal()

  return (
    <Button variant={variant} size={size} onClick={openModal}>
      {children}
    </Button>
  )
}


