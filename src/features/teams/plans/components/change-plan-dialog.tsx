import * as React from 'react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Plan } from '../../api'
import {
  usePlansCatalog,
  useSubscription,
  useChangePlan,
} from '../../hooks/use-plans'
import { useCurrentTeam } from '../../hooks/use-teams'
import { formatCents } from '../utils'

type ChangePlanDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePlanDialog({
  open,
  onOpenChange,
}: ChangePlanDialogProps) {
  const { currentTeam } = useCurrentTeam()
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(
    null
  )

  const catalogQuery = usePlansCatalog(currentTeam?.id ?? '', {
    enabled: open,
  })
  const subscriptionQuery = useSubscription(currentTeam?.id ?? '', {
    enabled: open,
  })
  const changeMutation = useChangePlan(currentTeam?.id ?? '')

  const plans = catalogQuery.data?.plans ?? []
  const currentPlanId = subscriptionQuery.data?.subscription.plan_id

  const isPending = changeMutation.isPending

  const selectedPlan = plans.find((p: Plan) => p.id === selectedPlanId)

  function getChangeType(plan: Plan): 'upgrade' | 'downgrade' {
    if (!currentPlanId) return 'upgrade'
    const currentPlan = plans.find((p: Plan) => p.id === currentPlanId)
    if (!currentPlan) return 'upgrade'
    return plan.price_amount > currentPlan.price_amount
      ? 'upgrade'
      : 'downgrade'
  }

  function handleConfirm() {
    if (!selectedPlan || !currentTeam) return

    changeMutation.mutate(
      {
        plan_id: selectedPlan.id,
        change_type: getChangeType(selectedPlan),
      },
      {
        onSuccess: () => {
          toast.success(
            `Plan change scheduled — will take effect at the end of the current billing period.`
          )
          setSelectedPlanId(null)
          onOpenChange(false)
        },
        onError: (error: Error) => {
          handleServerError(error)
        },
      }
    )
  }

  function handleOpenChange(value: boolean) {
    if (!value) setSelectedPlanId(null)
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Change Plan</DialogTitle>
          <DialogDescription>
            Select a new plan. The change will take effect at the end of the
            current billing period.
          </DialogDescription>
        </DialogHeader>

        {catalogQuery.isLoading ? (
          <div className='py-8 text-center text-muted-foreground'>
            Loading plans...
          </div>
        ) : (
          <ScrollArea className='h-[400px] pr-4'>
            <div className='space-y-3'>
              {plans.map((plan: Plan) => {
                const isCurrent = plan.id === currentPlanId
                const isSelected = plan.id === selectedPlanId
                const changeType = getChangeType(plan)

                return (
                  <button
                    key={plan.id}
                    type='button'
                    onClick={() => setSelectedPlanId(plan.id)}
                    disabled={isCurrent || isPending}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      isCurrent
                        ? 'cursor-default border-primary bg-primary/5'
                        : isSelected
                          ? 'border-primary bg-primary/10'
                          : 'hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='font-semibold'>{plan.name}</span>
                          {isCurrent && <Badge>Current</Badge>}
                          {!isCurrent && (
                            <Badge variant='outline'>
                              {changeType === 'upgrade'
                                ? 'Upgrade'
                                : 'Downgrade'}
                            </Badge>
                          )}
                        </div>
                        <p className='mt-1 text-sm text-muted-foreground'>
                          {plan.description}
                        </p>
                      </div>
                      <span className='text-lg font-semibold'>
                        {formatCents(plan.price_amount, plan.currency)}
                        <span className='text-sm font-normal text-muted-foreground'>
                          /{plan.interval_type}
                        </span>
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedPlanId || isPending || !currentPlanId}
          >
            {isPending ? 'Scheduling...' : 'Schedule change'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
