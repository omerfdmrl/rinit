import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminBillingPermissions } from '../hooks/use-admin-billing-permissions'
import { useAdminDiscountsContext } from './admin-discounts-provider'

export function AdminDiscountsPrimaryButtons() {
  const { setOpen } = useAdminDiscountsContext()
  const { discounts } = useAdminBillingPermissions()

  if (!discounts.canCreate) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Discount</span> <Plus size={18} />
      </Button>
    </div>
  )
}
