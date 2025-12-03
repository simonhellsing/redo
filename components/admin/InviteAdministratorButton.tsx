'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
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

  const handleClose = () => {
    setIsOpen(false)
    setEmail('')
    setError(null)
    setSuccess(null)
    onClose?.()
  }

  if (!isOpen) return null

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
          title="Bjud in administratör"
          onClose={handleClose}
          onCancel={handleClose}
          onConfirm={handleInvite}
          confirmLabel="Skicka inbjudan"
          confirmDisabled={isLoading || !email}
          cancelLabel="Avbryt"
        >
          <div className="flex flex-col gap-[32px] items-center w-full">
            <div className="flex flex-col gap-[20px] items-start w-full max-w-[360px]">
              <Text variant="body-small" style={{ color: 'var(--neutral-600)' }}>
                Skicka en inbjudan till en ny administratör. De kommer att få ett e-postmeddelande med en länk för att skapa ett konto och få tillgång till administrationsgränssnittet.
              </Text>

              <div className="flex flex-col gap-[8px] items-start w-full">
                <Label htmlFor="email">E-postadress</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={isLoading}
                  inputSize="medium"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm w-full">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm w-full">
                  {success}
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

