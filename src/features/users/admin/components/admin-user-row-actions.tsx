import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { KeyRound, Trash2, UserPen } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type AdminUser } from '../../api'
import { useAdminUserPermissions } from '../../hooks/use-admin-permissions'
import { useSendAdminPasswordReset } from '../../hooks/use-admin-users'
import { useAdminUsers } from './admin-users-provider'

type AdminUserRowActionsProps = {
  row: Row<AdminUser>
}

export function AdminUserRowActions({ row }: AdminUserRowActionsProps) {
  const { setOpen, setCurrentRow } = useAdminUsers()
  const { canUpdate, canDelete } = useAdminUserPermissions()
  const resetMutation = useSendAdminPasswordReset()
  const [resetPending, setResetPending] = useState(false)

  if (!canUpdate && !canDelete) {
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
        {canUpdate && (
          <DropdownMenuItem
            disabled={resetPending}
            onClick={() => {
              setResetPending(true)
              resetMutation.mutate(row.original.id, {
                onSuccess: ({ message }) => {
                  toast.success(message)
                  setResetPending(false)
                },
                onError: (error) => {
                  handleServerError(error)
                  setResetPending(false)
                },
              })
            }}
          >
            Send password reset
            <DropdownMenuShortcut>
              <KeyRound size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {canUpdate && canDelete && <DropdownMenuSeparator />}
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
