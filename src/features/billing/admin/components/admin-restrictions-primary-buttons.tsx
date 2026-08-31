import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminBillingPermissions } from '../hooks/use-admin-billing-permissions'
import { useAdminRestrictionsContext } from './admin-restrictions-provider'

export function AdminRestrictionsPrimaryButtons() {
  const { setOpen } = useAdminRestrictionsContext()
  const { restrictions } = useAdminBillingPermissions()

  if (!restrictions.canCreate) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Stage</span> <Plus size={18} />
      </Button>
    </div>
  )
}
