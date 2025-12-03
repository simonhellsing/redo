'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Text } from '@/components/ui/Text'
import { useRouter } from 'next/navigation'

export function CreateWorkspaceForm() {
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch('/api/workspace/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
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
          Skapa workspace
        </Text>
        <div className="flex flex-wrap gap-1.5 items-start justify-center relative shrink-0 w-full">
          <Text variant="body-small" style={{ color: 'var(--neutral-500)', letterSpacing: '0.25px' }}>
            Börja med att skapa din workspace
          </Text>
        </div>
      </div>

      {error && (
        <div className="bg-[var(--negative-50)] border border-[var(--negative-500)] text-[var(--negative-900)] px-4 py-3 rounded-lg text-body-small w-full">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1 items-start relative shrink-0 w-full">
        <Label htmlFor="name">Workspace-namn</Label>
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
        <Text variant="body-small" style={{ color: 'var(--neutral-500)', marginTop: '4px' }}>
          Detta är namnet på din organisation eller firma.
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Button 
          type="submit" 
          disabled={isCreating} 
          className="w-full"
          variant="primary"
          size="large"
        >
          {isCreating ? 'Skapar...' : 'Skapa workspace'}
        </Button>
      </form>
    </>
  )
}

