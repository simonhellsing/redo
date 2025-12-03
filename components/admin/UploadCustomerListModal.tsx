'use client'

import React, { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Text } from '@/components/ui/Text'
import { MdOutlineCloudUpload } from 'react-icons/md'

interface ParsedCustomer {
  company_name: string
  orgnr: string | null
  logo_url: string | null
  bolagsform: string | null
  ansvarig_konsult: string | null
  kontaktperson: string | null
  epost: string | null
  telefon: string | null
  räkenskapsår_start: string | null
  räkenskapsår_slut: string | null
  tjänster: string | null
  fortnox_id: string | null
  status: 'Aktiv' | 'Passiv'
}

interface UploadCustomerListModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  onSuccess?: () => void
}

export function UploadCustomerListModal({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: UploadCustomerListModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [customers, setCustomers] = useState<ParsedCustomer[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setError('Endast CSV-filer är tillåtna')
      return
    }

    setIsLoading(true)
    setError(null)
    setCustomers([])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/customers/parse-csv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Kunde inte läsa CSV-filen')
      }

      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (err: any) {
      console.error('Error parsing CSV:', err)
      setError(err.message || 'Ett fel uppstod vid läsning av CSV-filen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleAddCustomers = async () => {
    if (customers.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      const response = await fetch('/api/customers/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace_id: workspaceId,
          customers,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Kunde inte lägga till kunder')
      }

      if (onSuccess) {
        onSuccess()
      }
      onClose()
      // Reset state
      setCustomers([])
      setError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      console.error('Error adding customers:', err)
      setError(err.message || 'Ett fel uppstod vid tillägg av kunder')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setCustomers([])
    setError(null)
    setIsLoading(false)
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
          handleClose()
        }
      }}
    >
      <div onClick={(e) => e.stopPropagation()} className="h-full">
        <Modal
          title="Ladda upp kundlista"
          onClose={handleClose}
          onCancel={handleClose}
          onConfirm={customers.length > 0 ? handleAddCustomers : undefined}
          cancelLabel="Avbryt"
          confirmLabel={isUploading ? 'Lägger till...' : 'Lägg till kunder'}
          confirmDisabled={customers.length === 0 || isUploading}
          footerLeftContent={
            customers.length > 0 ? (
              <Text variant="body-small" style={{ color: 'var(--neutral-600)' }}>
                {customers.length} kunder
              </Text>
            ) : undefined
          }
        >
          <div className="flex flex-col gap-4 w-full">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {!isLoading && customers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--neutral-100)] cursor-pointer hover:bg-[var(--neutral-200)] transition-colors"
                  onClick={handleUploadClick}
                >
                  <MdOutlineCloudUpload style={{ width: '32px', height: '32px', color: 'var(--neutral-600)' }} />
                </div>
                <Text variant="body-medium" style={{ color: 'var(--neutral-600)' }}>
                  Klicka för att välja CSV-fil
                </Text>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                />
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--neutral-600)]"></div>
                <Text variant="body-medium" style={{ color: 'var(--neutral-600)' }}>
                  Laddar kunder...
                </Text>
              </div>
            )}

            {!isLoading && customers.length > 0 && (
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                {customers.map((customer, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border border-[var(--neutral-200)] rounded-lg"
                  >
                    {customer.logo_url ? (
                      <ImageWithFallback
                        src={customer.logo_url}
                        alt={`${customer.company_name} logo`}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                        No logo
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Text variant="label-medium" className="truncate">
                        {customer.company_name}
                      </Text>
                      {customer.orgnr && (
                        <Text variant="body-small" style={{ color: 'var(--neutral-500)' }}>
                          {customer.orgnr}
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  )
}

