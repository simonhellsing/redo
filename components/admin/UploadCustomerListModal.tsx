'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Text } from '@/components/ui/Text'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
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
  initialFile?: File | null
}

export function UploadCustomerListModal({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
  initialFile,
}: UploadCustomerListModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [customers, setCustomers] = useState<ParsedCustomer[]>([])
  const [loadingLogos, setLoadingLogos] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileProcess = useCallback(async (file: File) => {
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
      const parsedCustomers = data.customers || []
      setCustomers(parsedCustomers)
      
      // Fetch logos progressively after customers are loaded
      if (parsedCustomers.length > 0) {
        fetchLogosProgressively(parsedCustomers)
      }
    } catch (err: any) {
      console.error('Error parsing CSV:', err)
      setError(err.message || 'Ett fel uppstod vid läsning av CSV-filen')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchLogosProgressively = async (customersToFetch: ParsedCustomer[]) => {
    // Fetch logos one at a time with 1.5 second delay between requests to avoid rate limiting
    const delay = 1500 // 1.5 seconds between requests
    
    for (let i = 0; i < customersToFetch.length; i++) {
      const customer = customersToFetch[i]
      
      // Mark this customer as loading
      setLoadingLogos(prev => new Set(prev).add(i))
      
      try {
        const response = await fetch(`/api/brandfetch/search?query=${encodeURIComponent(customer.company_name.trim())}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.logoUrl) {
            // Update the customer with the logo
            setCustomers(prev => {
              const updated = [...prev]
              updated[i] = { ...updated[i], logo_url: data.logoUrl }
              return updated
            })
          }
        }
      } catch (error) {
        console.error(`Error fetching logo for ${customer.company_name}:`, error)
      } finally {
        // Remove loading state
        setLoadingLogos(prev => {
          const next = new Set(prev)
          next.delete(i)
          return next
        })
      }
      
      // Add delay before next request (except for the last one)
      if (i < customersToFetch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // Process initial file when modal opens
  useEffect(() => {
    if (isOpen && initialFile) {
      handleFileProcess(initialFile)
    }
  }, [isOpen, initialFile, handleFileProcess])

  if (!isOpen) return null

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleFileProcess(file)
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
          <div className="flex flex-col gap-4 w-full flex-1 min-h-0 overflow-hidden">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex-shrink-0">
                {error}
              </div>
            )}

            {!isLoading && customers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-4 flex-shrink-0">
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
              <div className="flex flex-col items-center justify-center py-12 gap-4 flex-shrink-0">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--neutral-600)]"></div>
                <Text variant="body-medium" style={{ color: 'var(--neutral-600)' }}>
                  Laddar kunder...
                </Text>
              </div>
            )}

            {!isLoading && customers.length > 0 && (
              <div className="w-full overflow-y-auto flex-1 min-h-0">
                <div className="flex flex-col gap-0 items-start shrink-0 w-full">
                  {/* Table Header */}
                  <div className="bg-[var(--neutral-0)] flex gap-[32px] items-center h-[32px] px-[12px] py-[4px] rounded-[9px] w-full sticky top-0 z-10">
                    <div className="flex-1 min-w-0">
                      <span className="text-label-small text-[var(--neutral-800)]">Logo</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-label-small text-[var(--neutral-800)]">Namn</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-label-small text-[var(--neutral-800)]">Org. nummer</span>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="flex flex-col gap-0 items-start shrink-0 w-full">
                    {customers.map((customer, index) => (
                      <React.Fragment key={index}>
                        <div className="bg-[var(--neutral-0)] flex gap-[32px] h-[48px] items-center px-[12px] py-[4px] rounded-[12px] w-full transition-colors hover:bg-[var(--neutral-100)]">
                          <div className="flex-1 min-w-0 flex items-center relative">
                            {loadingLogos.has(index) ? (
                              <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center relative">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--neutral-600)]"></div>
                              </div>
                            ) : customer.logo_url ? (
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
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text variant="label-medium" className="truncate">
                              {customer.company_name}
                            </Text>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text variant="body-small" style={{ color: 'var(--neutral-600)' }}>
                              {customer.orgnr || '-'}
                            </Text>
                          </div>
                        </div>
                        {index < customers.length - 1 && (
                          <div className="h-[1px] bg-[var(--neutral-200)] w-full" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  )
}

