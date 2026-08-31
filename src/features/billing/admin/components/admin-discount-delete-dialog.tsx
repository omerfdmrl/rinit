import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type AdminDiscount } from '../api'
import { useDeleteAdminDiscount } from '../hooks/use-admin-discounts'

type AdminDiscountDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AdminDiscount
}

export function AdminDiscountDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: AdminDiscountDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteAdminDiscount()
  const isPending = deleteMutation.isPending

  const handleDelete = () => {
    if (value.trim() !== currentRow.code) return

    deleteMutation.mutate(currentRow.id, {
      onSuccess: () => {
        toast.success('Discount deleted')
        onOpenChange(false)
      },
      onError: (error) => handleServerError(error),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='admin-discount-delete-form'
      disabled={value.trim() !== currentRow.code || isPending}
      isLoading={isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Discount
        </span>
      }
      desc={
        <form
          id='admin-discount-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete the discount{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            Subscriptions with this discount applied are unaffected. This cannot
            be undone.
          </p>

          <Label className='my-2'>
            Discount code:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter discount code to confirm deletion.'
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
