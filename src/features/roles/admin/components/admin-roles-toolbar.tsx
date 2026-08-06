import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from '@/components/data-table/faceted-filter'
import { DataTableViewOptions } from '@/components/data-table/view-options'

type AdminRolesToolbarProps<TData> = {
  table: Table<TData>
}

export function AdminRolesToolbar<TData>({
  table,
}: AdminRolesToolbarProps<TData>) {
  const columnFilters = table.getState().columnFilters
  const searchValue =
    (columnFilters.find((filter) => filter.id === 'search')?.value as
      | string
      | undefined) ?? ''

  const setSearch = (value: string) => {
    table.setColumnFilters((prev) => [
      ...prev.filter((filter) => filter.id !== 'search'),
      { id: 'search', value },
    ])
  }

  const isFiltered = columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter roles...'
          value={searchValue}
          onChange={(event) => setSearch(event.target.value)}
          className='h-8 w-37.5 lg:w-62.5'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('scope') && (
            <DataTableFacetedFilter
              column={table.getColumn('scope')}
              title='Scope'
              options={[
                { label: 'Global', value: 'global' },
                { label: 'Team', value: 'team' },
              ]}
            />
          )}
          {table.getColumn('is_default') && (
            <DataTableFacetedFilter
              column={table.getColumn('is_default')}
              title='Default'
              options={[
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' },
              ]}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
