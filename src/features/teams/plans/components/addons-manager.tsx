import * as React from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { Plan, SubscriptionAddon } from '../../api'
import { usePlanPermissions } from '../../hooks/use-plan-permissions'
import {
  useSubscription,
  usePlansCatalog,
  useUpdateAddon,
  useDetachAddon,
} from '../../hooks/use-plans'
import { useCurrentTeam } from '../../hooks/use-teams'
import { formatCents } from '../utils'
import { AttachAddonDialog } from './attach-addon-dialog'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function AddonsManager() {
  const { currentTeam } = useCurrentTeam()
  const { canManageAddons } = usePlanPermissions()
  const [attachOpen, setAttachOpen] = React.useState(false)
  const [detachAddon, setDetachAddon] = React.useState<{
    addonId: number
    name: string
  } | null>(null)

  const subscriptionQuery = useSubscription(currentTeam?.id ?? 0)
  const catalogQuery = usePlansCatalog(currentTeam?.id ?? 0)
  const updateMutation = useUpdateAddon(currentTeam?.id ?? 0)
  const detachMutation = useDetachAddon(currentTeam?.id ?? 0)

  const addons = subscriptionQuery.data?.addons ?? []
  const catalogAddons = catalogQuery.data?.addons ?? []

  function getAddonName(addonId: number): string {
    const found = catalogAddons.find((a: Plan) => a.id === addonId)
    return found?.name ?? String(addonId)
  }

  function getAddonPrice(addonId: number): {
    amount: number
    currency: string
  } {
    const found = catalogAddons.find((a: Plan) => a.id === addonId)
    return {
      amount: found?.price_amount ?? 0,
      currency: found?.currency ?? 'USD',
    }
  }

  function handleQuantityChange(addonId: number, newQuantity: number) {
    if (!currentTeam || newQuantity < 1) return
    updateMutation.mutate(
      { addonId, quantity: newQuantity },
      {
        onSuccess: () => {
          toast.success('Addon quantity updated')
        },
        onError: (error: Error) => {
          handleServerError(error)
        },
      }
    )
  }

  function handleDetachConfirm() {
    if (!detachAddon || !currentTeam) return

    detachMutation.mutate(detachAddon.addonId, {
      onSuccess: () => {
        toast.success('Addon detached successfully')
        setDetachAddon(null)
      },
      onError: (error: Error) => {
        handleServerError(error)
      },
    })
  }

  if (subscriptionQuery.isLoading) {
    return (
      <div className='rounded-lg border p-8 text-center text-muted-foreground'>
        Loading addons...
      </div>
    )
  }

  return (
    <>
      <div className='rounded-lg border p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold'>Addons</h3>
            <p className='text-sm text-muted-foreground'>
              Manage additional plan addons for your team.
            </p>
          </div>
          {canManageAddons && (
            <Button size='sm' onClick={() => setAttachOpen(true)}>
              Attach addon
            </Button>
          )}
        </div>

        {addons.length === 0 ? (
          <p className='py-8 text-center text-muted-foreground'>
            No addons attached.{' '}
            {canManageAddons ? 'Click "Attach addon" to add one.' : ''}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Addon</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className='w-[50px]' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {addons.map((addon: SubscriptionAddon) => {
                const price = getAddonPrice(addon.addon_id)
                return (
                  <TableRow key={addon.id}>
                    <TableCell className='font-medium'>
                      {getAddonName(addon.addon_id)}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='icon'
                          className='size-7'
                          disabled={
                            addon.quantity <= 1 ||
                            updateMutation.isPending ||
                            !canManageAddons
                          }
                          onClick={() =>
                            handleQuantityChange(
                              addon.addon_id,
                              addon.quantity - 1
                            )
                          }
                        >
                          <Minus className='size-3' />
                        </Button>
                        <span className='w-8 text-center text-sm font-medium'>
                          {addon.quantity}
                        </span>
                        <Button
                          variant='outline'
                          size='icon'
                          className='size-7'
                          disabled={
                            updateMutation.isPending || !canManageAddons
                          }
                          onClick={() =>
                            handleQuantityChange(
                              addon.addon_id,
                              addon.quantity + 1
                            )
                          }
                        >
                          <Plus className='size-3' />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCents(price.amount, price.currency)}/unit
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {formatDate(addon.current_period_start)} –{' '}
                      {formatDate(addon.current_period_end)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-7 text-destructive'
                        disabled={detachMutation.isPending || !canManageAddons}
                        onClick={() => {
                          const name = getAddonName(addon.addon_id)
                          setDetachAddon({ addonId: addon.addon_id, name })
                        }}
                      >
                        <Trash2 className='size-3' />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <AttachAddonDialog open={attachOpen} onOpenChange={setAttachOpen} />
      <ConfirmDialog
        open={!!detachAddon}
        onOpenChange={(open) => {
          if (!open) setDetachAddon(null)
        }}
        title='Detach addon'
        desc={`Are you sure you want to detach "${detachAddon?.name ?? ''}"?`}
        confirmText='Detach'
        destructive
        isLoading={detachMutation.isPending}
        handleConfirm={handleDetachConfirm}
      />
    </>
  )
}
