import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Invoice } from '../../api'
import { useInvoices } from '../../hooks/use-plans'
import { useCurrentTeam } from '../../hooks/use-teams'
import { formatCents } from '../utils'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  finalized: 'Finalized',
  paid: 'Paid',
  voided: 'Voided',
}

const STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  paid: 'default',
  finalized: 'secondary',
  draft: 'outline',
  voided: 'destructive',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function InvoicesTable() {
  const { currentTeam } = useCurrentTeam()
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>(
    undefined
  )

  const invoicesQuery = useInvoices(currentTeam?.id ?? 0, {
    page,
    per_page: 10,
    status: statusFilter,
  })

  const invoices = invoicesQuery.data?.invoices ?? []
  const pagination = invoicesQuery.data?.pagination

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value === 'all' ? undefined : value)
    setPage(1)
  }

  if (invoicesQuery.isLoading) {
    return (
      <div className='rounded-lg border p-8 text-center text-muted-foreground'>
        Loading invoices...
      </div>
    )
  }

  return (
    <div className='rounded-lg border p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Invoices</h3>
          <p className='text-sm text-muted-foreground'>
            View and download your billing invoices.
          </p>
        </div>
        <Select
          value={statusFilter ?? 'all'}
          onValueChange={handleStatusFilterChange}
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            <SelectItem value='draft'>Draft</SelectItem>
            <SelectItem value='finalized'>Finalized</SelectItem>
            <SelectItem value='paid'>Paid</SelectItem>
            <SelectItem value='voided'>Voided</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {invoices.length === 0 ? (
        <p className='py-8 text-center text-muted-foreground'>
          No invoices found.
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className='text-right'>Total</TableHead>
                <TableHead className='text-right'>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice: Invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className='font-medium'>
                    {invoice.number}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_VARIANTS[invoice.status] ?? 'secondary'}
                    >
                      {STATUS_LABELS[invoice.status] ?? invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-sm text-muted-foreground'>
                    {formatDate(invoice.period_start)} –{' '}
                    {formatDate(invoice.period_end)}
                  </TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatCents(invoice.total, invoice.currency)}
                  </TableCell>
                  <TableCell className='text-right text-muted-foreground'>
                    {invoice.paid_at
                      ? formatDate(invoice.paid_at)
                      : invoice.due_at
                        ? `Due ${formatDate(invoice.due_at)}`
                        : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination && pagination.total_pages > 1 && (
            <div className='mt-4 flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                Page {pagination.page} of {pagination.total_pages} (
                {pagination.total} total)
              </p>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={page >= pagination.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
