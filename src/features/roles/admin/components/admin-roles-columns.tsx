import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Globe, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type AdminRole } from '../../api'
import { AdminRoleRowActions } from './admin-role-row-actions'

export const adminRolesColumns: ColumnDef<AdminRole>[] = [
  {
    accessorKey: 'role_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-44 ps-3'>{row.getValue('role_name')}</LongText>
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
    id: 'scope',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Scope' />
    ),
    cell: ({ row }) => {
      const teamId = row.original.team_id
      return (
        <div className='flex items-center gap-x-2'>
          {teamId ? (
            <Users size={16} className='text-muted-foreground' />
          ) : (
            <Globe size={16} className='text-muted-foreground' />
          )}
          <Badge variant='outline'>{teamId ? 'Team' : 'Global'}</Badge>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'is_default',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Default' />
    ),
    cell: ({ row }) => {
      const isDefault = row.getValue<boolean>('is_default')
      return (
        <Badge variant={isDefault ? 'default' : 'secondary'}>
          {isDefault ? 'Yes' : 'No'}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description = row.getValue<string>('description')
      return description ? (
        <LongText className='max-w-72'>{description}</LongText>
      ) : (
        <span className='text-muted-foreground'>—</span>
      )
    },
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
    cell: AdminRoleRowActions,
  },
]
