import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Percent } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { formatCents } from '@/features/teams/plans/utils'
import { type AdminDiscount } from '../api'
import { AdminDiscountRowActions } from './admin-discount-row-actions'

export const adminDiscountsColumns: ColumnDef<AdminDiscount>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-x-2 ps-3'>
        <Percent size={16} className='shrink-0 text-muted-foreground' />
        <span>{row.getValue('name')}</span>
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
    accessorKey: 'discount_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => (
      <Badge variant='secondary'>{row.getValue('discount_type')}</Badge>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) =>
      row.original.discount_type === 'percentage'
        ? `${row.getValue<number>('amount') / 100}%`
        : formatCents(row.getValue<number>('amount')),
    enableSorting: false,
  },
  {
    accessorKey: 'duration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Duration' />
    ),
    cell: ({ row }) => <span>{row.getValue('duration')}</span>,
    enableSorting: false,
  },
  {
    accessorKey: 'used_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Uses' />
    ),
    cell: ({ row }) => (
      <span>
        {row.getValue<number>('used_count')}
        {row.original.max_uses != null ? ` / ${row.original.max_uses}` : ''}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) =>
      row.getValue('active') ? (
        <Badge>Active</Badge>
      ) : (
        <Badge variant='outline'>Inactive</Badge>
      ),
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
    cell: AdminDiscountRowActions,
  },
]
