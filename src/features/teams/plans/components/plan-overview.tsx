import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCurrentTeam } from '../../hooks/use-teams'
import { useSubscription } from '../../hooks/use-plans'
import { formatCents } from '../utils'
import type { PlanUsage } from '../../api'
import { ChangePlanDialog } from './change-plan-dialog'
import { CancelPlanDialog } from './cancel-plan-dialog'

const STATUS_LABELS: Record<string, string> = {
  trial: 'Trial',
  active: 'Active',
  grace_period: 'Grace Period',
  restricted: 'Restricted',
  suspended: 'Suspended',
  pending_cancellation: 'Pending Cancellation',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  trial: 'secondary',
  grace_period: 'destructive',
  restricted: 'destructive',
  suspended: 'destructive',
  pending_cancellation: 'outline',
  cancelled: 'destructive',
  expired: 'destructive',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function PlanOverview() {
  const { currentTeam } = useCurrentTeam()
  const [changeOpen, setChangeOpen] = React.useState(false)
  const [cancelOpen, setCancelOpen] = React.useState(false)

  const subscriptionQuery = useSubscription(currentTeam?.id ?? '')
  const data = subscriptionQuery.data

  if (subscriptionQuery.isLoading) {
    return (
      <div className='rounded-lg border p-8 text-center text-muted-foreground'>
        Loading plan...
      </div>
    )
  }

  if (!currentTeam || !data) {
    return (
      <div className='rounded-lg border p-8 text-center text-muted-foreground'>
        No subscription found.
      </div>
    )
  }

  const { subscription, usage } = data
  const plan = subscription.plan

  return (
    <>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardDescription>Current Plan</CardDescription>
            <CardTitle className='text-2xl'>
              {plan?.name ?? subscription.plan_id}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Status</span>
              <Badge variant={STATUS_VARIANTS[subscription.status] ?? 'secondary'}>
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Price</span>
              <span className='font-medium'>
                {plan
                  ? `${formatCents(plan.price_amount, plan.currency)}/${plan.interval_type}`
                  : '—'}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Billing period</span>
              <span className='text-sm'>
                {formatDate(subscription.current_period_start)} –{' '}
                {formatDate(subscription.current_period_end)}
              </span>
            </div>
            {subscription.trial_ends_at && (
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Trial ends</span>
                <span className='text-sm'>{formatDate(subscription.trial_ends_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Balance</CardDescription>
            <CardTitle className='text-2xl'>
              {formatCents(subscription.credit_balance)}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Negative limit</span>
              <span className='text-sm'>
                {formatCents(subscription.negative_balance_limit)}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Auto recharge</span>
              <Badge variant={subscription.auto_recharge_enabled ? 'default' : 'secondary'}>
                {subscription.auto_recharge_enabled ? 'On' : 'Off'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Scheduled Changes</CardDescription>
            <CardTitle className='text-2xl'>—</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            {subscription.scheduled_plan_id ? (
              <>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Plan</span>
                  <span className='text-sm font-medium'>
                    {subscription.scheduled_plan_id}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Change type</span>
                  <Badge variant='outline'>{subscription.scheduled_change_type}</Badge>
                </div>
              </>
            ) : (
              <p className='text-sm text-muted-foreground'>No pending changes.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {usage.length > 0 && (
        <Card className='mt-4'>
          <CardHeader>
            <CardTitle>Usage This Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {usage.map((u: PlanUsage) => (
                <div key={u.metric_key} className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>
                    {u.metric_key.replace(/_/g, ' ')}
                  </p>
                  <p className='text-lg font-semibold'>
                    {u.total.toLocaleString()}
                    {!u.unlimited && (
                      <span className='text-sm font-normal text-muted-foreground'>
                        {' '}
                        / {u.included.toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className='mt-6 flex gap-2'>
        <Button onClick={() => setChangeOpen(true)}>Change Plan</Button>
        <Button
          variant='outline'
          className='text-destructive'
          onClick={() => setCancelOpen(true)}
        >
          Cancel Subscription
        </Button>
      </div>

      <ChangePlanDialog open={changeOpen} onOpenChange={setChangeOpen} />
      <CancelPlanDialog open={cancelOpen} onOpenChange={setCancelOpen} />
    </>
  )
}
