'use client'

import React, { useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { CustomerForm } from './CustomerForm'

interface Customer {
  id: string
  name: string
  org_number: string | null
  contact_email: string | null
  notes: string | null
  logo_url: string | null
}

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  customer?: Customer | null
  onSuccess?: () => void
}

export function CustomerModal({
  isOpen,
  onClose,
  workspaceId,
  customer,
  onSuccess,
}: CustomerModalProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isEditing = !!customer

  if (!isOpen) return null

  const handleConfirm = () => {
    if (formRef.current) {
      const submitButton = formRef.current.querySelector<HTMLButtonElement>('button[type="submit"]')
      if (submitButton) {
        submitButton.click()
      }
    }
  }

  const handleFormSubmitSuccess = () => {
    if (onSuccess) {
      onSuccess()
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-[8px]"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div onClick={(e) => e.stopPropagation()} className="h-full">
        <Modal
          title={isEditing ? "Redigera kund" : "Lägg till ny kund"}
          onClose={onClose}
          onCancel={onClose}
          cancelLabel="Avbryt"
          confirmLabel={isEditing ? "Uppdatera kund" : "Lägg till kund"}
          confirmDisabled={isSubmitting}
          onConfirm={handleConfirm}
        >
          <CustomerForm
            customer={customer || undefined}
            workspaceId={workspaceId}
            onSubmitSuccess={handleFormSubmitSuccess}
            hideButtons={true}
            formRef={formRef}
            onSubmittingChange={setIsSubmitting}
          />
        </Modal>
      </div>
    </div>
  )
}

// Keep AddCustomerModal for backward compatibility
export function AddCustomerModal(props: Omit<CustomerModalProps, 'customer'>) {
  return <CustomerModal {...props} customer={null} />
}

