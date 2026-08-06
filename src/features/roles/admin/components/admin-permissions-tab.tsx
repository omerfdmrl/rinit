import { useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { DataTableFacetedFilter } from '@/components/data-table/faceted-filter'
import { type AdminPermission } from '../../api'
import { useAdminRolePermissions } from '../../hooks/use-admin-permissions'
import { useAdminPermissions } from '../../hooks/use-admin-roles'
import { AdminPermissionActionDialog } from './admin-permission-action-dialog'
import { adminPermissionsColumns } from './admin-permissions-columns'

export function AdminPermissionsTab() {
  const { canCreatePermissions, canUpdatePermissions } =
    useAdminRolePermissions()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [current, setCurrent] = useState<AdminPermission | null>(null)
  const [search, setSearch] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  const assignableFilter = columnFilters.find(
    (filter) => filter.id === 'is_assignable'
  )?.value as string[] | undefined
  const systemFilter = columnFilters.find((filter) => filter.id === 'is_system')
    ?.value as string[] | undefined

  const { data, isLoading } = useAdminPermissions({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    search: search || undefined,
    is_assignable:
      assignableFilter && assignableFilter.length === 1
        ? assignableFilter[0]
        : undefined,
    is_system:
      systemFilter && systemFilter.length === 1 ? systemFilter[0] : undefined,
    sort_by: sorting[0]?.id ?? undefined,
    sort_order: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
  })

  const permissions = data?.permissions ?? []
  const total = data?.pagination.total ?? 0

  const columns = adminPermissionsColumns({
    canEdit: canUpdatePermissions,
    onEdit: (permission) => {
      setCurrent(permission)
      setDialogOpen(true)
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: permissions,
    columns,
    state: { sorting, pagination, columnFilters },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: total,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const isFiltered = columnFilters.length > 0

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h3 className='text-lg font-semibold'>Permissions</h3>
          <p className='text-sm text-muted-foreground'>
            Manage permission keys that can be assigned to roles.
          </p>
        </div>
        {canCreatePermissions && (
          <Button
            size='sm'
            onClick={() => {
              setCurrent(null)
              setDialogOpen(true)
            }}
          >
            <Plus className='size-4' />
            Add Permission
          </Button>
        )}
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Input
            placeholder='Filter permissions...'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className='h-8 w-37.5 lg:w-62.5'
          />
          <div className='flex gap-x-2'>
            {table.getColumn('is_assignable') && (
              <DataTableFacetedFilter
                column={table.getColumn('is_assignable')}
                title='Assignable'
                options={[
                  { label: 'Yes', value: 'true' },
                  { label: 'No', value: 'false' },
                ]}
              />
            )}
            {table.getColumn('is_system') && (
              <DataTableFacetedFilter
                column={table.getColumn('is_system')}
                title='System'
                options={[
                  { label: 'Yes', value: 'true' },
                  { label: 'No', value: 'false' },
                ]}
              />
            )}
          </div>
          {(isFiltered || search) && (
            <Button
              variant='ghost'
              onClick={() => {
                table.resetColumnFilters()
                setSearch('')
              }}
              className='h-8 px-2 lg:px-3'
            >
              Reset
              <Cross2Icon className='ms-2 h-4 w-4' />
            </Button>
          )}
        </div>
        <Badge variant='secondary' className='hidden shrink-0 sm:inline-flex'>
          {total} total
        </Badge>
      </div>

      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Loading permissions...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className='group/row'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <AdminPermissionActionDialog
        key={current ? `edit-${current.id}` : 'create'}
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCurrent(null)
          }
          setDialogOpen(open)
        }}
        current={current ?? undefined}
      />
    </div>
  )
}
