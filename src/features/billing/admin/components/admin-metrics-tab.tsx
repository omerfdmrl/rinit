import { getRouteApi } from '@tanstack/react-router'
import { AdminMetricsDialogs } from './admin-metrics-dialogs'
import { AdminMetricsPrimaryButtons } from './admin-metrics-primary-buttons'
import { AdminMetricsProvider } from './admin-metrics-provider'
import { AdminMetricsTable } from './admin-metrics-table'

const route = getRouteApi('/_authenticated/admin/billing/')

export function AdminMetricsTab() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <AdminMetricsProvider>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Usage Metrics</h2>
          <p className='text-muted-foreground'>
            Define the usage metrics that plans can meter and bill.
          </p>
        </div>
        <AdminMetricsPrimaryButtons />
      </div>
      <AdminMetricsTable search={search} navigate={navigate} />
      <AdminMetricsDialogs />
    </AdminMetricsProvider>
  )
}
