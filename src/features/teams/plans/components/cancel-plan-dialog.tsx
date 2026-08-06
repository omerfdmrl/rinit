import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { handleServerError } from '@/lib/handle-server-error'
import { useCurrentTeam } from '../../hooks/use-teams'
import { useCancelSubscription } from '../../hooks/use-plans'

type CancelPlanDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelPlanDialog({ open, onOpenChange }: CancelPlanDialogProps) {
  const { currentTeam } = useCurrentTeam()
  const cancelMutation = useCancelSubscription(currentTeam?.id ?? '')

  function handleConfirm() {
    if (!currentTeam) return

    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(
          'Subscription cancellation scheduled. It will remain active until the end of the current billing period.'
        )
        onOpenChange(false)
      },
      onError: (error: Error) => {
        handleServerError(error)
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Cancel subscription'
      desc='Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period, then your account will lose access to paid features.'
      confirmText='Cancel subscription'
      destructive
      isLoading={cancelMutation.isPending}
      handleConfirm={handleConfirm}
    />
  )
}
