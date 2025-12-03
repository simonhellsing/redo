'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { ModalFormField } from '@/components/ui/Modal'
import { Text } from '@/components/ui/Text'

interface InviteAdministratorButtonProps {
  onClose?: () => void
}

export function InviteAdministratorButton({ onClose }: InviteAdministratorButtonProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleInvite() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/administrators/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send invitation')
      }

      const data = await response.json()
      setSuccess(`Invitation sent! Link: ${data.invitationLink}`)
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Modal
            title="Bjud in administratör"
            onClose={() => {
              setIsOpen(false)
              setEmail('')
              setError(null)
              setSuccess(null)
              onClose?.()
            }}
            onCancel={() => {
              setIsOpen(false)
              setEmail('')
              setError(null)
              setSuccess(null)
              onClose?.()
            }}
            onConfirm={handleInvite}
            confirmLabel="Skicka inbjudan"
            confirmDisabled={isLoading || !email}
            cancelLabel="Avbryt"
          >
            <div className="flex flex-col gap-[16px] w-full">
              <Text variant="body-medium" className="text-[var(--neutral-700)]">
                Skicka en inbjudan till en ny administratör. De kommer att få ett e-postmeddelande med en länk för att skapa ett konto och få tillgång till administrationsgränssnittet.
              </Text>

              <ModalFormField label="E-postadress">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={isLoading}
                />
              </ModalFormField>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}
            </div>
          </Modal>
        </div>
  )
}

