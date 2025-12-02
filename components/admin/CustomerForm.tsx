'use client'

import { useState, useRef } from 'react'
import React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { UploadButton } from '@/components/ui/UploadButton'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!customer

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setLogoFile(file)
    setRemoveLogo(false)
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
        <UploadButton
          onClick={handleUploadClick}
          disabled={isSubmitting}
          backgroundImage={logoPreview || (customer?.logo_url && !removeLogo ? customer.logo_url : null)}
        />
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

