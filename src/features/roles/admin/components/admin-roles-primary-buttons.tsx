import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminRolePermissions } from '../../hooks/use-admin-permissions'
import { useAdminRoles } from './admin-roles-provider'

export function AdminRolesPrimaryButtons() {
  const { setOpen } = useAdminRoles()
  const { canCreate } = useAdminRolePermissions()

  if (!canCreate) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Role</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
