import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminBillingPermissions } from '../hooks/use-admin-billing-permissions'
import { useAdminMetricsContext } from './admin-metrics-provider'

export function AdminMetricsPrimaryButtons() {
  const { setOpen } = useAdminMetricsContext()
  const { metrics } = useAdminBillingPermissions()

  if (!metrics.canCreate) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Metric</span> <Plus size={18} />
      </Button>
    </div>
  )
}
