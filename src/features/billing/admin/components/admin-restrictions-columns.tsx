import { type ColumnDef } from '@tanstack/react-table'
import { ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { formatCents } from '@/features/teams/plans/utils'
import { type AdminRestrictionStage } from '../api'
import { AdminRestrictionRowActions } from './admin-restriction-row-actions'

export const adminRestrictionsColumns: ColumnDef<AdminRestrictionStage>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-x-2 ps-3'>
        <ShieldAlert size={16} className='shrink-0 text-muted-foreground' />
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
    accessorKey: 'sort_order',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order' />
    ),
    cell: ({ row }) => (
      <Badge variant='secondary'>{row.getValue('sort_order')}</Badge>
    ),
  },
  {
    accessorKey: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Action' />
    ),
    cell: ({ row }) => <span>{row.getValue('action')}</span>,
    enableSorting: false,
  },
  {
    accessorKey: 'trigger_balance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trigger balance' />
    ),
    cell: ({ row }) => {
      const balance = row.getValue<number | null>('trigger_balance')
      return (
        <div className='text-nowrap'>
          {balance != null ? formatCents(balance) : '—'}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'enabled',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) =>
      row.getValue('enabled') ? (
        <Badge>Enabled</Badge>
      ) : (
        <Badge variant='outline'>Disabled</Badge>
      ),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: AdminRestrictionRowActions,
  },
]
