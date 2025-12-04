 'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Text } from '@/components/ui/Text'
import { MdContentCopy, MdOutlineShare } from 'react-icons/md'

interface InviteCustomerUserButtonProps {
  customerId: string
  customerName: string
}

export function InviteCustomerUserButton({ customerId, customerName }: InviteCustomerUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleInvite() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError(null)
    setInvitationLink(null)
    setCopied(false)

    try {
      const response = await fetch(`/api/customers/${customerId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send invitation')
      }

      const data = await response.json()
      if (data.invitationLink) {
        setInvitationLink(data.invitationLink)
      }
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
    setInvitationLink(null)
    setCopied(false)
  }

  const handleCopyLink = async () => {
    if (!invitationLink) return

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(invitationLink)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = invitationLink
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // If copy fails, user can still select the text manually
    }
  }

  return (
    <>
      <Button
        variant="tertiary"
        size="small"
        leftIcon={<MdOutlineShare />}
        onClick={() => setIsOpen(true)}
      >
        Dela
      </Button>

      <Modal
        isOpen={isOpen}
        title="Dela med kund"
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
                    Skicka en inbjudan till en kundanvändare för {customerName}. De kommer att få ett e-postmeddelande med en länk för att skapa ett konto.
                  </Text>

                  <div className="flex flex-col gap-[8px] items-start w-full">
                    <Label htmlFor="email">E-postadress</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kund@example.com"
                      disabled={isLoading}
                      inputSize="medium"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm w-full">
                      {error}
                    </div>
                  )}
                  {invitationLink && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm w-full flex flex-col gap-[8px]">
                      <Text variant="body-small" style={{ color: 'var(--green-800, #166534)' }}>
                        Inbjudan skickad! Du kan även kopiera länken nedan om du vill dela den manuellt.
                      </Text>
                      <div className="flex flex-col gap-[4px]">
                        <Label htmlFor="customer-invite-link" className="text-xs text-green-800">
                          Inbjudningslänk
                        </Label>
                        <Input
                          id="customer-invite-link"
                          value={invitationLink}
                          readOnly
                          inputSize="medium"
                          rightIcon={
                            <button
                              type="button"
                              onClick={handleCopyLink}
                              className="flex items-center justify-center cursor-pointer"
                            >
                              <MdContentCopy size={16} />
                            </button>
                          }
                        />
                        {copied && (
                          <Text variant="body-small" style={{ color: 'var(--green-800, #166534)' }}>
                            Länken har kopierats.
                          </Text>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Modal>
    </>
  )
}

