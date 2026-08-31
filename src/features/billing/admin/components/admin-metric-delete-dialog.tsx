import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type AdminUsageMetric } from '../api'
import { useDeleteAdminMetric } from '../hooks/use-admin-metrics'

type AdminMetricDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AdminUsageMetric
}

export function AdminMetricDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: AdminMetricDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteAdminMetric()
  const isPending = deleteMutation.isPending

  const handleDelete = () => {
    if (value.trim() !== currentRow.key) return

    deleteMutation.mutate(currentRow.id, {
      onSuccess: () => {
        toast.success('Metric deleted')
        onOpenChange(false)
      },
      onError: (error) => handleServerError(error),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='admin-metric-delete-form'
      disabled={value.trim() !== currentRow.key || isPending}
      isLoading={isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Metric
        </span>
      }
      desc={
        <form
          id='admin-metric-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete the metric{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            Plans using this metric may become invalid. This cannot be undone.
          </p>

          <Label className='my-2'>
            Metric key:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter metric key to confirm deletion.'
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
