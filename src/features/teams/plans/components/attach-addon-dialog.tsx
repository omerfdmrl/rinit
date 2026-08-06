import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { handleServerError } from '@/lib/handle-server-error'
import { useCurrentTeam } from '../../hooks/use-teams'
import { usePlansCatalog, useAttachAddon } from '../../hooks/use-plans'
import { formatCents } from '../utils'
import type { Plan } from '../../api'

type AttachAddonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AttachAddonDialog({
  open,
  onOpenChange,
}: AttachAddonDialogProps) {
  const { currentTeam } = useCurrentTeam()
  const [selectedAddonId, setSelectedAddonId] = React.useState<string>('')
  const [quantity, setQuantity] = React.useState(1)

  const catalogQuery = usePlansCatalog(currentTeam?.id ?? '')
  const attachMutation = useAttachAddon(currentTeam?.id ?? '')
  const isPending = attachMutation.isPending

  const addons = catalogQuery.data?.addons ?? []

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedAddonId || !currentTeam) return

    attachMutation.mutate(
      { addonId: selectedAddonId, quantity },
      {
        onSuccess: () => {
          toast.success('Addon attached successfully')
          setSelectedAddonId('')
          setQuantity(1)
          onOpenChange(false)
        },
        onError: (error: Error) => {
          handleServerError(error)
        },
      }
    )
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setSelectedAddonId('')
      setQuantity(1)
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Attach addon</DialogTitle>
          <DialogDescription>
            Select an addon and quantity to attach to your subscription.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label>Addon</Label>
            <Select
              value={selectedAddonId}
              onValueChange={setSelectedAddonId}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select an addon' />
              </SelectTrigger>
              <SelectContent>
                {addons.map((addon: Plan) => (
                  <SelectItem key={addon.id} value={addon.id}>
                    {addon.name} — {formatCents(addon.price_amount, addon.currency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='addon-quantity'>Quantity</Label>
            <Input
              id='addon-quantity'
              type='number'
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              disabled={isPending}
            />
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending || !selectedAddonId}>
              {isPending ? 'Attaching...' : 'Attach'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
