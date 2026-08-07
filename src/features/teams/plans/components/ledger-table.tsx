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
import type { LedgerEntry } from '../../api'
import { useLedger } from '../../hooks/use-plans'
import { useCurrentTeam } from '../../hooks/use-teams'
import { formatCents } from '../utils'

const ENTRY_TYPE_LABELS: Record<string, string> = {
  subscription_charge: 'Subscription',
  usage_charge: 'Usage',
  manual_credit: 'Manual Credit',
  refund: 'Refund',
  adjustment: 'Adjustment',
  recharge: 'Recharge',
  invoice_payment: 'Invoice',
}

const ENTRY_TYPE_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  manual_credit: 'default',
  recharge: 'default',
  refund: 'default',
  subscription_charge: 'destructive',
  usage_charge: 'destructive',
  adjustment: 'secondary',
  invoice_payment: 'secondary',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LedgerTable() {
  const { currentTeam } = useCurrentTeam()
  const [page, setPage] = React.useState(1)
  const [entryTypeFilter, setEntryTypeFilter] = React.useState<
    string | undefined
  >(undefined)

  const ledgerQuery = useLedger(currentTeam?.id ?? '', {
    page,
    per_page: 10,
    entry_type: entryTypeFilter,
  })

  const entries = ledgerQuery.data?.ledger ?? []
  const pagination = ledgerQuery.data?.pagination

  function handleEntryTypeFilterChange(value: string) {
    setEntryTypeFilter(value === 'all' ? undefined : value)
    setPage(1)
  }

  if (ledgerQuery.isLoading) {
    return (
      <div className='rounded-lg border p-8 text-center text-muted-foreground'>
        Loading ledger...
      </div>
    )
  }

  return (
    <div className='rounded-lg border p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Ledger</h3>
          <p className='text-sm text-muted-foreground'>
            Credit ledger entries for your subscription.
          </p>
        </div>
        <Select
          value={entryTypeFilter ?? 'all'}
          onValueChange={handleEntryTypeFilterChange}
        >
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='All types' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All types</SelectItem>
            <SelectItem value='subscription_charge'>Subscription</SelectItem>
            <SelectItem value='usage_charge'>Usage</SelectItem>
            <SelectItem value='manual_credit'>Manual Credit</SelectItem>
            <SelectItem value='refund'>Refund</SelectItem>
            <SelectItem value='adjustment'>Adjustment</SelectItem>
            <SelectItem value='recharge'>Recharge</SelectItem>
            <SelectItem value='invoice_payment'>Invoice Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {entries.length === 0 ? (
        <p className='py-8 text-center text-muted-foreground'>
          No ledger entries found.
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className='text-right'>Amount</TableHead>
                <TableHead className='text-right'>Balance</TableHead>
                <TableHead className='text-right'>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry: LedgerEntry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Badge
                      variant={
                        ENTRY_TYPE_VARIANTS[entry.entry_type] ?? 'secondary'
                      }
                    >
                      {ENTRY_TYPE_LABELS[entry.entry_type] ?? entry.entry_type}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {entry.description || '—'}
                  </TableCell>
                  <TableCell className='text-right font-medium'>
                    <span
                      className={
                        entry.amount < 0 ? 'text-destructive' : 'text-green-600'
                      }
                    >
                      {entry.amount < 0 ? '' : '+'}
                      {formatCents(entry.amount, entry.currency)}
                    </span>
                  </TableCell>
                  <TableCell className='text-right text-muted-foreground'>
                    {formatCents(entry.balance_after, entry.currency)}
                  </TableCell>
                  <TableCell className='text-right text-muted-foreground'>
                    {formatDate(entry.created_at)}
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
