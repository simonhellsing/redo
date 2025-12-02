'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { UploadButton } from '@/components/ui/UploadButton'

interface BrandingSettingsFormProps {
  workspace: {
    id: string
    name: string
    primary_color: string | null
    accent_color: string | null
    logo_url: string | null
  }
}

export function BrandingSettingsForm({ workspace }: BrandingSettingsFormProps) {
  const [organizationName, setOrganizationName] = useState(workspace.name || '')
  const [primaryColor, setPrimaryColor] = useState(workspace.primary_color || '#3b82f6')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(workspace.logo_url)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setLogoFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(workspace.logo_url)
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('workspace_id', workspace.id)
      formData.append('name', organizationName)
      formData.append('primary_color', primaryColor)
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const response = await fetch('/api/settings/branding', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update branding')
      }

      // Reload page to apply changes
      window.location.reload()
    } catch (error: any) {
      console.error('Error updating branding:', error)
      alert(error.message || 'Failed to update branding. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full" style={{ maxWidth: '400px' }}>
      <div>
        <Label htmlFor="logo">Logo</Label>
        <div className="mt-1">
          <input
            ref={fileInputRef}
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
          <UploadButton
            label="Ladda upp logotyp"
            backgroundImage={logoPreview || null}
            onClick={handleUploadClick}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="organization_name">Organisationsnamn</Label>
        <div className="mt-1">
          <Input
            id="organization_name"
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="Mitt redovisningsföretag"
            required
            disabled={isSubmitting}
            size="large"
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="primary_color">Primär färg</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="primary_color"
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-20 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            placeholder="#3b82f6"
            disabled={isSubmitting}
            size="large"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} variant="primary" size="large">
          {isSubmitting ? 'Sparar...' : 'Spara ändringar'}
        </Button>
      </div>
    </form>
  )
}

