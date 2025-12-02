'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { CustomerModal } from './AddCustomerModal'

interface Customer {
  id: string
  name: string
  org_number: string | null
  contact_email: string | null
  notes: string | null
  logo_url: string | null
}

interface AddCustomerModalContextType {
  openModal: () => void
  openEditModal: (customer: Customer) => void
  closeModal: () => void
  isOpen: boolean
}

const AddCustomerModalContext = createContext<AddCustomerModalContextType | undefined>(undefined)

export function AddCustomerModalProvider({
  children,
  workspaceId,
  onSuccess,
}: {
  children: ReactNode
  workspaceId: string
  onSuccess?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  return (
    <AddCustomerModalContext.Provider
      value={{
        openModal: () => {
          setEditingCustomer(null)
          setIsOpen(true)
        },
        openEditModal: (customer: Customer) => {
          setEditingCustomer(customer)
          setIsOpen(true)
        },
        closeModal: () => {
          setIsOpen(false)
          setEditingCustomer(null)
        },
        isOpen,
      }}
    >
      {children}
      <CustomerModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          setEditingCustomer(null)
        }}
        workspaceId={workspaceId}
        customer={editingCustomer}
        onSuccess={() => {
          setIsOpen(false)
          setEditingCustomer(null)
          onSuccess?.()
        }}
      />
    </AddCustomerModalContext.Provider>
  )
}

export function useAddCustomerModal() {
  const context = useContext(AddCustomerModalContext)
  if (context === undefined) {
    throw new Error('useAddCustomerModal must be used within AddCustomerModalProvider')
  }
  return context
}

