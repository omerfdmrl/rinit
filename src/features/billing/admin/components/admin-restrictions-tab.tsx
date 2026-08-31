import { AdminRestrictionsDialogs } from './admin-restrictions-dialogs'
import { AdminRestrictionsPrimaryButtons } from './admin-restrictions-primary-buttons'
import { AdminRestrictionsProvider } from './admin-restrictions-provider'
import { AdminRestrictionsTable } from './admin-restrictions-table'

export function AdminRestrictionsTab() {
  return (
    <AdminRestrictionsProvider>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Restriction Stages
          </h2>
          <p className='text-muted-foreground'>
            Enforcement stages applied as credit balances run low.
          </p>
        </div>
        <AdminRestrictionsPrimaryButtons />
      </div>
      <AdminRestrictionsTable />
      <AdminRestrictionsDialogs />
    </AdminRestrictionsProvider>
  )
}
