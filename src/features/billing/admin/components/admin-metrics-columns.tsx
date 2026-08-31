import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { type AdminUsageMetric } from '../api'
import { AdminMetricRowActions } from './admin-metric-row-actions'

export const adminMetricsColumns: ColumnDef<AdminUsageMetric>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-x-2 ps-3'>
        <Gauge size={16} className='shrink-0 text-muted-foreground' />
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
    accessorKey: 'key',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Key' />
    ),
    cell: ({ row }) => (
      <code className='rounded bg-muted px-1.5 py-0.5 text-xs'>
        {row.getValue('key')}
      </code>
    ),
  },
  {
    accessorKey: 'unit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Unit' />
    ),
    cell: ({ row }) => (
      <Badge variant='secondary'>{row.getValue('unit')}</Badge>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'aggregation_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Aggregation' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>{row.getValue('aggregation_type')}</div>
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
    cell: AdminMetricRowActions,
  },
]
