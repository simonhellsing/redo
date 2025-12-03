'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PublishReportModal } from './PublishReportModal'

interface PublishReportButtonProps {
  reportId: string
  customerId: string
  customerName?: string
}

export function PublishReportButton({ reportId, customerId, customerName = 'kunden' }: PublishReportButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [showModal, setShowModal] = useState(false)

  async function handlePublish() {
    setIsPublishing(true)

    try {
      const response = await fetch('/api/reports/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, customerId }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish report')
      }

      const data = await response.json()
      
      // Show invitation link (for dev)
      if (data.invitationLink) {
        console.log('Invitation link:', data.invitationLink)
      }

      setShowModal(false)
      window.location.reload()
    } catch (error) {
      console.error('Error publishing report:', error)
      alert('Kunde inte publicera rapporten. Försök igen.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setShowModal(true)}
        disabled={isPublishing}
      >
        Publicera
      </Button>

      <PublishReportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handlePublish}
        customerName={customerName}
        isLoading={isPublishing}
      />
    </>
  )
}

