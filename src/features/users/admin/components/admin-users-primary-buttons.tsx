import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminUserPermissions } from '../../hooks/use-admin-permissions'
import { useAdminUsers } from './admin-users-provider'

export function AdminUsersPrimaryButtons() {
  const { setOpen } = useAdminUsers()
  const { canCreate } = useAdminUserPermissions()

  if (!canCreate) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add User</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
