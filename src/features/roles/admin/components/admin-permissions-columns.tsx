import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type AdminPermission } from '../../api'

type AdminPermissionsColumnsProps = {
  onEdit?: (permission: AdminPermission) => void
  canEdit?: boolean
}

export function adminPermissionsColumns({
  onEdit,
  canEdit,
}: AdminPermissionsColumnsProps): ColumnDef<AdminPermission>[] {
  return [
    {
      accessorKey: 'permission_key',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Permission' />
      ),
      cell: ({ row }) => (
        <code className='rounded bg-muted px-1.5 py-0.5 ps-3 text-xs'>
          {row.getValue('permission_key')}
        </code>
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
      accessorKey: 'is_system',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='System' />
      ),
      cell: ({ row }) => {
        const isSystem = row.getValue<boolean>('is_system')
        return (
          <Badge variant={isSystem ? 'default' : 'secondary'}>
            {isSystem ? 'Yes' : 'No'}
          </Badge>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'is_assignable',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Assignable' />
      ),
      cell: ({ row }) => {
        const isAssignable = row.getValue<boolean>('is_assignable')
        return (
          <Badge variant={isAssignable ? 'default' : 'secondary'}>
            {isAssignable ? 'Yes' : 'No'}
          </Badge>
        )
      },
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
      cell: ({ row }) =>
        canEdit ? (
          <Button
            variant='ghost'
            size='icon'
            className='size-8'
            onClick={() => onEdit?.(row.original)}
          >
            <Pencil className='size-4' />
            <span className='sr-only'>Edit permission</span>
          </Button>
        ) : null,
    },
  ]
}
