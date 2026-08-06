import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type AdminRole } from '../../api'
import { useDeleteAdminRole } from '../../hooks/use-admin-roles'

type AdminRoleDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AdminRole
}

export function AdminRoleDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: AdminRoleDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteAdminRole()
  const isPending = deleteMutation.isPending

  const handleDelete = () => {
    if (value.trim() !== currentRow.role_name) return

    deleteMutation.mutate(currentRow.id, {
      onSuccess: ({ message }) => {
        toast.success(message)
        onOpenChange(false)
      },
      onError: (error) => handleServerError(error),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='admin-role-delete-form'
      disabled={value.trim() !== currentRow.role_name || isPending}
      isLoading={isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Role
        </span>
      }
      desc={
        <form
          id='admin-role-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete the role{' '}
            <span className='font-bold'>{currentRow.role_name}</span>?
            <br />
            This will remove the role and revoke it from all assigned users.
            This cannot be undone.
          </p>

          <Label className='my-2'>
            Role name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter role name to confirm deletion.'
              autoFocus
              disabled={isPending}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText={
        <>
          {isPending && <Loader2 className='animate-spin' />}
          Delete
        </>
      }
      destructive
    />
  )
}
