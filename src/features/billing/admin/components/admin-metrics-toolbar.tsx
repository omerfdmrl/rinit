import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '@/components/data-table/view-options'

type AdminMetricsToolbarProps<TData> = {
  table: Table<TData>
}

export function AdminMetricsToolbar<TData>({
  table,
}: AdminMetricsToolbarProps<TData>) {
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
      <div className='flex flex-1 items-center gap-2'>
        <Input
          placeholder='Filter metrics...'
          value={searchValue}
          onChange={(event) => setSearch(event.target.value)}
          className='h-8 w-37.5 lg:w-62.5'
        />
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
