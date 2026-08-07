import * as React from 'react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import type { Subscription } from '../../api'
import { usePlanPermissions } from '../../hooks/use-plan-permissions'
import {
  useSubscription,
  useUpdateRecharge,
  useSetNegativeLimit,
} from '../../hooks/use-plans'
import { useCurrentTeam } from '../../hooks/use-teams'

function RechargeForm({
  subscription,
  isPending,
  disabled,
  onSubmit,
}: {
  subscription: Subscription
  isPending: boolean
  disabled?: boolean
  onSubmit: (body: {
    enabled: boolean
    min_balance: number
    amount: number
    max_count: number
    cooldown_seconds: number
  }) => void
}) {
  const [enabled, setEnabled] = React.useState(
    subscription.auto_recharge_enabled
  )
  const [minBalance, setMinBalance] = React.useState(
    subscription.auto_recharge_min_balance
  )
  const [amount, setAmount] = React.useState(subscription.auto_recharge_amount)
  const [maxCount, setMaxCount] = React.useState(
    subscription.auto_recharge_max_count
  )
  const [cooldown, setCooldown] = React.useState(
    subscription.auto_recharge_cooldown_seconds
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      enabled,
      min_balance: minBalance,
      amount,
      max_count: maxCount,
      cooldown_seconds: cooldown,
    })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Label htmlFor='recharge-enabled'>Enabled</Label>
        <Switch
          id='recharge-enabled'
          checked={enabled}
          onCheckedChange={setEnabled}
          disabled={isPending || disabled}
        />
      </div>
      <Separator />
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='min-balance'>Trigger at balance (cents)</Label>
          <Input
            id='min-balance'
            type='number'
            value={minBalance}
            onChange={(e) => setMinBalance(Number(e.target.value))}
            disabled={isPending || disabled}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='recharge-amount'>Top-up amount (cents)</Label>
          <Input
            id='recharge-amount'
            type='number'
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={isPending || disabled}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='max-count'>Max auto-recharges</Label>
          <Input
            id='max-count'
            type='number'
            value={maxCount}
            onChange={(e) => setMaxCount(Number(e.target.value))}
            disabled={isPending || disabled}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='cooldown'>Cooldown (seconds)</Label>
          <Input
            id='cooldown'
            type='number'
            value={cooldown}
            onChange={(e) => setCooldown(Number(e.target.value))}
            disabled={isPending || disabled}
          />
        </div>
      </div>
      {!disabled && (
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Saving...' : 'Save recharge settings'}
        </Button>
      )}
    </form>
  )
}

function LimitForm({
  subscription,
  isPending,
  disabled,
  onSubmit,
}: {
  subscription: Subscription
  isPending: boolean
  disabled?: boolean
  onSubmit: (limit: number | null) => void
}) {
  const initialLimit =
    subscription.negative_balance_limit == null
      ? ''
      : String(subscription.negative_balance_limit)
  const [limitValue, setLimitValue] = React.useState(initialLimit)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const limit = limitValue.trim() === '' ? null : Number(limitValue)
    if (limitValue.trim() !== '' && (limit === null || isNaN(limit))) {
      toast.error('Please enter a valid number')
      return
    }
    onSubmit(limit)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='max-w-sm space-y-2'>
        <Label htmlFor='neg-limit'>
          Limit (cents, negative = debt allowed)
        </Label>
        <Input
          id='neg-limit'
          type='number'
          placeholder='Leave empty for plan default'
          value={limitValue}
          onChange={(e) => setLimitValue(e.target.value)}
          disabled={isPending || disabled}
        />
      </div>
      {!disabled && (
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Saving...' : 'Save limit'}
        </Button>
      )}
    </form>
  )
}

export function BillingSettings() {
  const { currentTeam } = useCurrentTeam()
  const { canSettings } = usePlanPermissions()
  const subscriptionQuery = useSubscription(currentTeam?.id ?? '')
  const rechargeMutation = useUpdateRecharge(currentTeam?.id ?? '')
  const negativeLimitMutation = useSetNegativeLimit(currentTeam?.id ?? '')

  const subscription = subscriptionQuery.data?.subscription

  function handleRechargeSubmit(body: {
    enabled: boolean
    min_balance: number
    amount: number
    max_count: number
    cooldown_seconds: number
  }) {
    if (!currentTeam) return
    rechargeMutation.mutate(body, {
      onSuccess: () => toast.success('Auto-recharge settings updated'),
      onError: (error: Error) => handleServerError(error),
    })
  }

  function handleLimitSubmit(limit: number | null) {
    if (!currentTeam) return
    negativeLimitMutation.mutate(
      { limit },
      {
        onSuccess: () =>
          toast.success(
            limit === null
              ? 'Negative balance limit removed (using plan default)'
              : 'Negative balance limit updated'
          ),
        onError: (error: Error) => handleServerError(error),
      }
    )
  }

  if (subscriptionQuery.isLoading) {
    return (
      <div className='rounded-lg border p-8 text-center text-muted-foreground'>
        Loading settings...
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className='rounded-lg border p-8 text-center text-muted-foreground'>
        No subscription found.
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Auto Recharge</CardTitle>
          <CardDescription>
            Automatically top up your credit balance when it falls below a
            threshold.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RechargeForm
            key={subscription.id}
            subscription={subscription}
            isPending={rechargeMutation.isPending}
            disabled={!canSettings}
            onSubmit={handleRechargeSubmit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Negative Balance Limit</CardTitle>
          <CardDescription>
            Set how far into negative balance your subscription can go. Leave
            empty to use the plan default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LimitForm
            key={subscription.id}
            subscription={subscription}
            isPending={negativeLimitMutation.isPending}
            disabled={!canSettings}
            onSubmit={handleLimitSubmit}
          />
        </CardContent>
      </Card>
    </div>
  )
}
