'use client'

import { useState, useRef, useEffect } from 'react'
import React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { UploadButton } from '@/components/ui/UploadButton'
import { IconButton } from '@/components/ui/IconButton'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { MdOutlineDelete } from 'react-icons/md'

interface CustomerFormProps {
  customer?: {
    id: string
    name: string
    org_number: string | null
    contact_email: string | null
    notes: string | null
    logo_url: string | null
  }
  workspaceId: string
  onSubmitSuccess?: () => void
  hideButtons?: boolean
  formRef?: React.RefObject<HTMLFormElement>
  onSubmittingChange?: (isSubmitting: boolean) => void
}

export function CustomerForm({ 
  customer, 
  workspaceId, 
  onSubmitSuccess,
  hideButtons = false,
  formRef,
  onSubmittingChange,
}: CustomerFormProps) {
  const [name, setName] = useState(customer?.name || '')
  const [orgNumber, setOrgNumber] = useState(customer?.org_number || '')
  const [contactEmail, setContactEmail] = useState(customer?.contact_email || '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedLogoUrl, setFetchedLogoUrl] = useState<string | null>(null)
  const [isFetchingLogo, setIsFetchingLogo] = useState(false)
  const [useFetchedLogo, setUseFetchedLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isEditing = !!customer

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setLogoFile(file)
    setRemoveLogo(false)
    setUseFetchedLogo(false)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
  }

  // Debounced logo fetching when company name changes
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Don't fetch if editing existing customer or name is empty
    if (isEditing || !name.trim()) {
      setFetchedLogoUrl(null)
      setIsFetchingLogo(false)
      setUseFetchedLogo(false)
      return
    }

    // Don't fetch if user has manually uploaded a logo
    if (logoFile) {
      return
    }

    // Debounce the API call
    setIsFetchingLogo(true)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/brandfetch/search?query=${encodeURIComponent(name.trim())}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.logoUrl) {
            setFetchedLogoUrl(data.logoUrl)
            // Automatically use the fetched logo
            setUseFetchedLogo(true)
          } else {
            setFetchedLogoUrl(null)
            setUseFetchedLogo(false)
          }
        } else {
          setFetchedLogoUrl(null)
          setUseFetchedLogo(false)
        }
      } catch (error) {
        console.error('Error fetching logo:', error)
        setFetchedLogoUrl(null)
        setUseFetchedLogo(false)
      } finally {
        setIsFetchingLogo(false)
      }
    }, 800) // 800ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [name, isEditing, logoFile])

  const handleDeleteLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setFetchedLogoUrl(null)
    setUseFetchedLogo(false)
    // If editing and customer has a logo, mark it for removal
    if (isEditing && customer?.logo_url) {
      setRemoveLogo(true)
    } else {
      setRemoveLogo(false)
    }
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    onSubmittingChange?.(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('workspace_id', workspaceId)
      formData.append('name', name)
      if (orgNumber) formData.append('org_number', orgNumber)
      if (contactEmail) formData.append('contact_email', contactEmail)
      if (logoFile) formData.append('logo', logoFile)
      if (useFetchedLogo && fetchedLogoUrl) {
        formData.append('logo_url', fetchedLogoUrl)
      }
      if (removeLogo) formData.append('remove_logo', 'true')

      const url = isEditing 
        ? `/api/customers/${customer.id}`
        : '/api/customers/create'
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} customer`)
      }

      const data = await response.json()
      if (onSubmitSuccess) {
        onSubmitSuccess()
      } else {
        window.location.href = `/customers/${data.customer?.id || customer?.id}`
      }
    } catch (err: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} customer:`, err)
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} customer. Please try again.`)
    } finally {
      setIsSubmitting(false)
      onSubmittingChange?.(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Logo Upload Section */}
      <div className="flex flex-col gap-[8px] items-center">
        <div className="relative group">
          <UploadButton
            onClick={handleUploadClick}
            disabled={isSubmitting}
            backgroundImage={
              logoPreview || 
              (useFetchedLogo && fetchedLogoUrl ? fetchedLogoUrl : null) ||
              (customer?.logo_url && !removeLogo ? customer.logo_url : null)
            }
          />
          {/* Delete button overlay - shows on hover when logo exists */}
          {(logoPreview || (useFetchedLogo && fetchedLogoUrl) || (customer?.logo_url && !removeLogo)) && (
            <div className="absolute top-[8px] right-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <IconButton
                icon={<MdOutlineDelete />}
                variant="secondary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteLogo()
                }}
                disabled={isSubmitting}
                aria-label="Delete logo"
              />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="logo"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isSubmitting}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        
        {isFetchingLogo && !logoFile && (
          <p className="text-xs text-gray-500">Searching for logo...</p>
        )}
      </div>

      <div>
        <Label htmlFor="name">Customer Name *</Label>
        <Input 
          id="name" 
          name="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="org_number">Organization Number</Label>
        <Input 
          id="org_number" 
          name="org_number" 
          value={orgNumber}
          onChange={(e) => setOrgNumber(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="contact_email">Contact Email</Label>
        <Input 
          id="contact_email" 
          name="contact_email" 
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {!hideButtons ? (
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Customer' : 'Create Customer')}
          </Button>
          <a href={isEditing ? `/customers/${customer.id}` : '/customers'}>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </a>
        </div>
      ) : (
        <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
      )}
    </form>
  )
}

