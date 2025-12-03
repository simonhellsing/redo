import { Badge } from '@/components/ui/Badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/DataTable'

interface SourceDocument {
  id: string
  type: 'general_ledger' | 'other'
  storage_path: string
  uploaded_at: string
  metadata: any
}

interface SupportingDocumentsListProps {
  sourceDocuments: SourceDocument[]
  customerId: string
}

export function SupportingDocumentsList({ sourceDocuments }: SupportingDocumentsListProps) {
  if (sourceDocuments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No supporting documents uploaded yet.
      </div>
    )
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'general_ledger':
        return 'General Ledger'
      case 'other':
        return 'Other'
      default:
        return type
    }
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Type</TableHeader>
          <TableHeader>Uploaded</TableHeader>
          <TableHeader>File</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {sourceDocuments.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>
              <Badge variant="info">{getTypeLabel(doc.type)}</Badge>
            </TableCell>
            <TableCell>
              {new Date(doc.uploaded_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <span className="text-sm text-gray-600">
                {doc.metadata?.file_name || doc.storage_path.split('/').pop()}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

