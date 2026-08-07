import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminTeamPermissions } from '../hooks/use-admin-team-permissions'
import { useAdminTeams } from './admin-teams-provider'

export function AdminTeamsPrimaryButtons() {
  const { setOpen } = useAdminTeams()
  const { canCreate } = useAdminTeamPermissions()

  if (!canCreate) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Team</span> <Plus size={18} />
      </Button>
    </div>
  )
}
