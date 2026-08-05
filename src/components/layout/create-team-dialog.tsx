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
import { useCreateTeam } from '@/features/teams/hooks/use-teams'

type CreateTeamDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTeamDialog({
  open,
  onOpenChange,
}: CreateTeamDialogProps) {
  const [name, setName] = React.useState('')
  const createTeamMutation = useCreateTeam()
  const isPending = createTeamMutation.isPending

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || trimmedName.length > 255) return

    createTeamMutation.mutate(
      { name: trimmedName },
      {
        onSuccess: (team) => {
          toast.success(`Team "${team.name}" created`)
          setName('')
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>
            Enter a name for your new team. You will be switched to it
            automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            autoFocus
            placeholder='Team name'
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={255}
            disabled={isPending}
          />
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending || !name.trim()}>
              {isPending ? 'Creating...' : 'Create team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
