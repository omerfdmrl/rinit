import { getRouteApi } from '@tanstack/react-router'
import { AdminPlansDialogs } from './admin-plans-dialogs'
import { AdminPlansPrimaryButtons } from './admin-plans-primary-buttons'
import { AdminPlansProvider } from './admin-plans-provider'
import { AdminPlansTable } from './admin-plans-table'

const route = getRouteApi('/app/_authenticated/admin/billing/')

export function AdminPlansTab() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <AdminPlansProvider>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Plans</h2>
          <p className='text-muted-foreground'>
            Manage billing plans, features, and metered pricing.
          </p>
        </div>
        <AdminPlansPrimaryButtons />
      </div>
      <AdminPlansTable search={search} navigate={navigate} />
      <AdminPlansDialogs />
    </AdminPlansProvider>
  )
}
