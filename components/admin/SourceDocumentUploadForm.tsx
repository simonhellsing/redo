'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface SourceDocumentUploadFormProps {
  customerId: string
  workspaceId: string
}

export function SourceDocumentUploadForm({ customerId, workspaceId }: SourceDocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('general_ledger')
  const [isUploading, setIsUploading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('customer_id', customerId)
      formData.append('workspace_id', workspaceId)
      formData.append('document_type', documentType)

      const response = await fetch('/api/source-documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload supporting document')
      }

      // Reload page to show new report
      window.location.reload()
    } catch (error) {
      console.error('Error uploading supporting document:', error)
      alert('Failed to upload supporting document. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="document_type">Document Type</Label>
        <select
          id="document_type"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          disabled={isUploading}
        >
          <option value="general_ledger">General Ledger</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <Label htmlFor="source_document">Upload Supporting Document</Label>
        <Input
          id="source_document"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
          disabled={isUploading}
          className="cursor-pointer"
        />
      </div>
      <Button type="submit" disabled={!file || isUploading}>
        {isUploading ? 'Uploading...' : 'Upload & Generate Report'}
      </Button>
    </form>
  )
}

