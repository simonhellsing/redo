'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Text } from '@/components/ui/Text'
import { TableRow } from '@/components/ui/TableRow'
import { TableHeaderControl } from '@/components/ui/TableHeaderControl'
import { Divider } from '@/components/ui/Divider'
import { Spinner } from '@/components/ui/Spinner'
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
  const isFetchingLogosRef = useRef(false)

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
      
      // Set customers and start logo fetching
      setCustomers(parsedCustomers)
      
      // Fetch logos progressively after customers are loaded
      // Use setTimeout to ensure state is set before starting logo fetch
      if (parsedCustomers.length > 0) {
        // Start logo fetching in next tick to ensure state is updated
        Promise.resolve().then(() => {
          fetchLogosProgressively(parsedCustomers)
        })
      }
    } catch (err: any) {
      console.error('Error parsing CSV:', err)
      setError(err.message || 'Ett fel uppstod vid läsning av CSV-filen')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchLogosProgressively = useCallback(async (customersToFetch: ParsedCustomer[]) => {
    // Prevent multiple simultaneous logo fetching processes
    if (isFetchingLogosRef.current) {
      console.warn('Logo fetching already in progress, skipping')
      return
    }
    
    isFetchingLogosRef.current = true
    
    try {
      // Fetch logos one at a time
      console.log(`Starting to fetch logos for ${customersToFetch.length} customers`)
      
      for (let i = 0; i < customersToFetch.length; i++) {
        const customer = customersToFetch[i]
        const companyName = customer.company_name.trim()
        
        if (!companyName) {
          console.warn(`Skipping customer ${i + 1} - empty company name`)
          continue
        }
        
        console.log(`[${i + 1}/${customersToFetch.length}] Fetching logo for: "${companyName}"`)
        
        // Mark this customer as loading
        setLoadingLogos(prev => new Set(prev).add(i))
        
        let logoUrl: string | null = null
        let wasRateLimited = false
        
        // Single attempt with better rate limit handling
        try {
          const response = await fetch(
            `/api/brandfetch/search?query=${encodeURIComponent(companyName)}`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            }
          )
          
          if (response.ok) {
            const data = await response.json()
            if (data.logoUrl) {
              logoUrl = data.logoUrl
              console.log(`✓ Logo found for "${companyName}": ${logoUrl}`)
            } else {
              console.log(`✗ No logo found for "${companyName}"`)
            }
          } else if (response.status === 429) {
            // Rate limited - wait much longer before continuing
            wasRateLimited = true
            const waitTime = 30000 // Wait 30 seconds if rate limited
            console.warn(`Rate limited for "${companyName}", waiting ${waitTime}ms before continuing...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
            // Don't retry this one, just move on after waiting
          } else {
            const errorText = await response.text().catch(() => 'Unknown error')
            console.warn(`API error for "${companyName}": ${response.status} - ${errorText}`)
          }
        } catch (error: any) {
          console.error(`Error fetching logo for "${companyName}":`, error.message || error)
        }
      
      // Update the customer with the logo (or null if not found)
      if (logoUrl) {
        setCustomers(prev => {
          const updated = [...prev]
          // Find customer by company name to avoid index issues
          const customerIndex = updated.findIndex(c => c.company_name === customer.company_name)
          if (customerIndex !== -1) {
            updated[customerIndex] = { ...updated[customerIndex], logo_url: logoUrl }
          }
          return updated
        })
      }
      
      // Remove loading state
      setLoadingLogos(prev => {
        const next = new Set(prev)
        next.delete(i)
        return next
      })
      
        // No delay between requests - fetch immediately
      }
      
      console.log(`Finished fetching logos for all ${customersToFetch.length} customers`)
    } catch (error: any) {
      console.error('Fatal error in fetchLogosProgressively:', error)
    } finally {
      isFetchingLogosRef.current = false
    }
  }, [])

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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex-shrink-0 mx-[20px] mt-[40px]">
                {error}
              </div>
            )}

            {!isLoading && customers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-4 flex-shrink-0 px-[20px] py-[40px]">
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
              <div className="flex flex-col items-center justify-center py-12 gap-4 flex-shrink-0 px-[20px] py-[40px]">
                <Spinner size="xl" style={{ color: 'var(--neutral-600)' }} />
                <Text variant="body-medium" style={{ color: 'var(--neutral-600)' }}>
                  Laddar kunder...
                </Text>
              </div>
            )}

            {!isLoading && customers.length > 0 && (
              <div className="w-full overflow-y-auto flex-1 min-h-0">
                <div className="flex flex-col gap-0 items-start shrink-0 w-full">
                  {/* Table Body - No Header */}
                  <div className="flex flex-col gap-0 items-start shrink-0 w-full">
                    {customers.map((customer, index) => {
                      // Determine logo URL - use loading placeholder if loading, otherwise use actual logo or null
                      const logoUrl = loadingLogos.has(index) 
                        ? undefined // Will show placeholder in DataTableCell
                        : customer.logo_url || undefined
                      
                      return (
                        <React.Fragment key={index}>
                          <div className="relative w-full">
                            <div className="bg-[var(--neutral-0)] flex gap-[32px] h-[48px] items-center px-[12px] py-[4px] rounded-[12px] w-full">
                              {/* Logo + Name Column */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-[8px] rounded-[8px] p-[8px] w-full">
                                  {loadingLogos.has(index) ? (
                                    <div className="rounded-[8px] shrink-0 bg-[var(--neutral-200)] flex items-center justify-center" style={{ width: '24px', height: '24px' }}>
                                      <Spinner size="sm" style={{ color: 'var(--neutral-600)' }} />
                                    </div>
                                  ) : logoUrl ? (
                                    <img
                                      src={logoUrl}
                                      alt=""
                                      className="rounded-[8px] shrink-0"
                                      style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded-[8px] shrink-0 bg-[var(--neutral-200)]"
                                      style={{ width: '24px', height: '24px' }}
                                    />
                                  )}
                                  <Text
                                    variant="label-small"
                                    as="span"
                                    className="whitespace-pre text-[var(--neutral-700)] flex-1 min-w-0"
                                  >
                                    {customer.company_name}
                                  </Text>
                                </div>
                              </div>
                              {/* Org Number Column */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-[8px] rounded-[8px] px-[8px] py-[12px] w-full">
                                  <Text
                                    variant="label-small"
                                    as="span"
                                    className="whitespace-pre text-[var(--neutral-500)] flex-1 min-w-0"
                                  >
                                    {customer.orgnr || '-'}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </div>
                          {index < customers.length - 1 && (
                            <Divider variant="narrow" className="w-full" />
                          )}
                        </React.Fragment>
                      )
                    })}
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

