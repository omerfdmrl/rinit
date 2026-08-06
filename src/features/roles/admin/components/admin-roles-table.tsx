import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { useAdminRoles } from '../../hooks/use-admin-roles'
import { adminRolesColumns as columns } from './admin-roles-columns'
import { AdminRolesToolbar } from './admin-roles-toolbar'

type DataTableProps = {
  search: Record<string, unknown>
  navigate: NavigateFn
}

function serializeScopeFilter(value: unknown): string | undefined {
  const values = value as string[]
  if (values.length !== 1) return undefined
  return values[0] === 'team' ? 'not_null' : 'null'
}

function deserializeScopeFilter(value: unknown): string[] {
  if (typeof value !== 'string' || value === '') return []
  return value === 'not_null' ? ['team'] : ['global']
}

export function AdminRolesTable({ search, navigate }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>(() => {
    const sortBy = search.sort_by
    const sortOrder = search.sort_order
    return typeof sortBy === 'string' && sortBy
      ? [{ id: sortBy, desc: sortOrder === 'desc' }]
      : []
  })

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 20 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'search', searchKey: 'search', type: 'string' },
      {
        columnId: 'scope',
        searchKey: 'team_id',
        type: 'array',
        serialize: serializeScopeFilter,
        deserialize: deserializeScopeFilter,
      },
      {
        columnId: 'is_default',
        searchKey: 'is_default',
        type: 'array',
        serialize: (value) => {
          const values = value as string[]
          if (values.length === 1) return values[0]
          return undefined
        },
        deserialize: (value) => {
          if (typeof value !== 'string' || value === '') return []
          return [value]
        },
      },
    ],
  })

  const onSortingChange: React.Dispatch<React.SetStateAction<SortingState>> = (
    updater
  ) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater
    setSorting(next)
    const column = next[0]
    navigate({
      search: (prev) => ({
        ...(prev as Record<string, unknown>),
        sort_by: column?.id ?? undefined,
        sort_order: column ? (column.desc ? 'desc' : 'asc') : undefined,
      }),
    })
  }

  const searchValue =
    (columnFilters.find((filter) => filter.id === 'search')?.value as
      | string
      | undefined) ?? ''
  const scopeFilter = columnFilters.find((filter) => filter.id === 'scope')
    ?.value as string[] | undefined
  const isDefaultFilter = columnFilters.find(
    (filter) => filter.id === 'is_default'
  )?.value as string[] | undefined

  const { data, isLoading } = useAdminRoles({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    search: searchValue || undefined,
    team_id:
      scopeFilter && scopeFilter.length === 1
        ? serializeScopeFilter(scopeFilter)
        : undefined,
    is_default:
      isDefaultFilter && isDefaultFilter.length === 1
        ? isDefaultFilter[0]
        : undefined,
    sort_by: sorting[0]?.id ?? undefined,
    sort_order: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
  })

  const roles = data?.roles ?? []
  const total = data?.pagination.total ?? 0

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: roles,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: total,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <AdminRolesToolbar table={table} />
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
                  Loading roles...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
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
    </div>
  )
}
