import { Card } from '@/components/ui/Card'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { AddCustomerButton } from '@/components/admin/AddCustomerButton'
import { EditCustomerLink } from '@/components/admin/EditCustomerLink'
import { createServerSupabase } from '@/lib/supabase'
import { getUserWorkspace } from '@/lib/auth/getUserWorkspace'

export default async function CustomersPage() {
  const workspace = await getUserWorkspace()
  const supabase = await createServerSupabase()

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('workspace_id', workspace?.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <AddCustomerButton>Add Customer</AddCustomerButton>
      </div>

      <Card>
        {customers && customers.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Logo</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Organization Number</TableHeader>
                <TableHeader>Contact Email</TableHeader>
                <TableHeader>Created</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    {customer.logo_url ? (
                      <ImageWithFallback
                        src={customer.logo_url}
                        alt={`${customer.name} logo`}
                        className="h-10 w-10 object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                        No logo
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.org_number || '-'}</TableCell>
                  <TableCell>{customer.contact_email || '-'}</TableCell>
                  <TableCell>
                    {new Date(customer.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <ButtonLink href={`/customers/${customer.id}`} variant="ghost" size="sm">View</ButtonLink>
                      <EditCustomerLink
                        customer={{
                          id: customer.id,
                          name: customer.name,
                          org_number: customer.org_number || null,
                          contact_email: customer.contact_email || null,
                          notes: customer.notes || null,
                          logo_url: customer.logo_url || null,
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                      >
                        Edit
                      </EditCustomerLink>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No customers yet</p>
            <AddCustomerButton>Add Your First Customer</AddCustomerButton>
          </div>
        )}
      </Card>
    </div>
  )
}

