'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Text } from '@/components/ui/Text'
import { UploadButton } from '@/components/ui/UploadButton'
import { useRouter } from 'next/navigation'

export function CreateWorkspaceForm() {
  const [name, setName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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
      setLogoPreview(null)
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsCreating(true)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('primary_color', primaryColor)
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const response = await fetch('/api/workspace/create', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create workspace')
      }

      const data = await response.json()
      
      window.location.href = '/overview'
    } catch (error: any) {
      console.error('Error creating workspace:', error)
      setError(error.message || 'Failed to create workspace. Please try again.')
      setIsCreating(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1 items-center relative shrink-0">
        <Text variant="title-large" className="text-center w-[360px]" style={{ color: 'var(--neutral-800)' }}>
          Skapa organisation
        </Text>
        <div className="flex flex-wrap gap-1.5 items-start justify-center relative shrink-0 w-full">
          <Text
            variant="body-small"
            className="text-center w-[360px]"
            style={{ color: 'var(--neutral-500)', letterSpacing: '0.25px' }}
          >
            Ladda upp logotyp, fyll i organisationsnamn och välj primär varumärkes färg.
          </Text>
        </div>
      </div>

      {error && (
        <div className="bg-[var(--negative-50)] border border-[var(--negative-500)] text-[var(--negative-900)] px-4 py-3 rounded-lg text-body-small w-full">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div>
          <div className="mt-1 flex justify-center">
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

        <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
          <Label htmlFor="name">Organisationsnamn</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mitt redovisningsföretag"
            required
            disabled={isCreating}
            inputSize="large"
            className="w-full"
          />
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
              disabled={isCreating}
              inputSize="large"
              className="w-full"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isCreating} 
          className="w-full"
          variant="primary"
          size="large"
        >
          {isCreating ? 'Skapar...' : 'Skapa organisation'}
        </Button>
      </form>
    </>
  )
}

