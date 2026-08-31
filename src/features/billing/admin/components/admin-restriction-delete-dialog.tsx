import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type AdminRestrictionStage } from '../api'
import { useDeleteAdminRestrictionStage } from '../hooks/use-admin-restrictions'

type AdminRestrictionDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AdminRestrictionStage
}

export function AdminRestrictionDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: AdminRestrictionDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteAdminRestrictionStage()
  const isPending = deleteMutation.isPending

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return

    deleteMutation.mutate(currentRow.id, {
      onSuccess: () => {
        toast.success('Restriction stage deleted')
        onOpenChange(false)
      },
      onError: (error) => handleServerError(error),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='admin-restriction-delete-form'
      disabled={value.trim() !== currentRow.name || isPending}
      isLoading={isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Restriction Stage
        </span>
      }
      desc={
        <form
          id='admin-restriction-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete the stage{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            Subscriptions will no longer be restricted at this stage. This
            cannot be undone.
          </p>

          <Label className='my-2'>
            Stage name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter stage name to confirm deletion.'
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
