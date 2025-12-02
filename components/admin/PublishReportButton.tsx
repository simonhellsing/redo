'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface PublishReportButtonProps {
  reportId: string
  customerId: string
}

export function PublishReportButton({ reportId, customerId }: PublishReportButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false)

  async function handlePublish() {
    if (!confirm('Publish this report? This will allow the customer to view it.')) {
      return
    }

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
        alert(`Report published! Invitation link: ${data.invitationLink}`)
      }

      window.location.reload()
    } catch (error) {
      console.error('Error publishing report:', error)
      alert('Failed to publish report. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handlePublish}
      disabled={isPublishing}
    >
      {isPublishing ? 'Publishing...' : 'Publish & Invite Customer'}
    </Button>
  )
}

