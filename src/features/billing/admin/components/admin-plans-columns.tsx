import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { CircleDollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { formatCents } from '@/features/teams/plans/utils'
import { type AdminPlan } from '../api'
import { planStatusLabel } from '../constants'
import { AdminPlanRowActions } from './admin-plan-row-actions'

const statusVariant: Record<
  string,
  'secondary' | 'default' | 'outline' | 'destructive'
> = {
  draft: 'secondary',
  active: 'default',
  archived: 'outline',
}

export const adminPlansColumns: ColumnDef<AdminPlan>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-x-2 ps-3'>
        <CircleDollarSign
          size={16}
          className='shrink-0 text-muted-foreground'
        />
        <LongText className='max-w-52'>{row.getValue('name')}</LongText>
      </div>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'inset-s-6 ps-0.5 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Code' />
    ),
    cell: ({ row }) => (
      <code className='rounded bg-muted px-1.5 py-0.5 text-xs'>
        {row.getValue('code')}
      </code>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue<string>('status')
      return (
        <Badge variant={statusVariant[status] ?? 'secondary'}>
          {planStatusLabel[status] ?? status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'interval_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Interval' />
    ),
    cell: ({ row }) => {
      const interval = row.getValue<string>('interval_type')
      const days = row.original.interval_days
      return (
        <div className='text-nowrap'>
          {interval === 'custom' && days > 0 ? `Every ${days} days` : interval}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'price_amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>
        {formatCents(row.getValue('price_amount'), row.original.currency)}
        {row.original.is_addon ? ' / addon' : ''}
      </div>
    ),
  },
  {
    accessorKey: 'trial_days',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trial' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>
        {row.getValue<number>('trial_days') > 0
          ? `${row.getValue('trial_days')} days`
          : '—'}
      </div>
    ),
  },
  {
    accessorKey: 'is_default',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Default' />
    ),
    cell: ({ row }) =>
      row.getValue('is_default') ? <Badge>Default</Badge> : null,
    enableSorting: false,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>
        {format(new Date(row.getValue('created_at')), 'MMM d, yyyy')}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: AdminPlanRowActions,
  },
]
