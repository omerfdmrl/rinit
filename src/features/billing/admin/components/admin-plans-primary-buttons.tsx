import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminBillingPermissions } from '../hooks/use-admin-billing-permissions'
import { useAdminPlansContext } from './admin-plans-provider'

export function AdminPlansPrimaryButtons() {
  const { setOpen } = useAdminPlansContext()
  const { plans } = useAdminBillingPermissions()

  if (!plans.canCreate) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Plan</span> <Plus size={18} />
      </Button>
    </div>
  )
}
