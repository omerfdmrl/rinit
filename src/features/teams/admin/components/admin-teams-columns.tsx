import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type AdminTeam } from '../api'
import { AdminTeamRowActions } from './admin-team-row-actions'

export const adminTeamsColumns: ColumnDef<AdminTeam>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-x-2 ps-3'>
        <Building2 size={16} className='shrink-0 text-muted-foreground' />
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
    accessorKey: 'created_by',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created By' />
    ),
    cell: ({ row }) => (
      <code className='rounded bg-muted px-1.5 py-0.5 text-xs'>
        {row.getValue('created_by')}
      </code>
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
    accessorKey: 'updated_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Updated' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>
        {format(new Date(row.getValue('updated_at')), 'MMM d, yyyy')}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: AdminTeamRowActions,
  },
]
