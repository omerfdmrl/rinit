import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, UserPen, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type AdminTeam } from '../api'
import { useAdminTeamPermissions } from '../hooks/use-admin-team-permissions'
import { useAdminTeams } from './admin-teams-provider'

type AdminTeamRowActionsProps = {
  row: Row<AdminTeam>
}

export function AdminTeamRowActions({ row }: AdminTeamRowActionsProps) {
  const { setOpen, setCurrentRow } = useAdminTeams()
  const { canView, canUpdate, canDelete } = useAdminTeamPermissions()

  if (!canView && !canUpdate && !canDelete) {
    return null
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44'>
        {canUpdate && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <UserPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {canView && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('members')
            }}
          >
            View members
            <DropdownMenuShortcut>
              <UsersRound size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {(canUpdate || canView) && canDelete && <DropdownMenuSeparator />}
        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
            className='text-red-500!'
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
