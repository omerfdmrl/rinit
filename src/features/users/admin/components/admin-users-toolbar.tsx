import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from '@/components/data-table/faceted-filter'
import { DataTableViewOptions } from '@/components/data-table/view-options'

type AdminUsersToolbarProps<TData> = {
  table: Table<TData>
}

export function AdminUsersToolbar<TData>({
  table,
}: AdminUsersToolbarProps<TData>) {
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
          placeholder='Filter users...'
          value={searchValue}
          onChange={(event) => setSearch(event.target.value)}
          className='h-8 w-37.5 lg:w-62.5'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('two_factor') && (
            <DataTableFacetedFilter
              column={table.getColumn('two_factor')}
              title='2FA'
              options={[
                { label: 'Enabled', value: 'true' },
                { label: 'Disabled', value: 'false' },
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
