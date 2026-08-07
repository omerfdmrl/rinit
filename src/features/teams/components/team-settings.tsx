import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCurrentTeam, useUpdateTeam } from '../hooks/use-teams'

function TeamSettingsForm({
  teamId,
  initialName,
  createdAt,
}: {
  teamId: number
  initialName: string
  createdAt: string
}) {
  const [name, setName] = React.useState(initialName)
  const updateMutation = useUpdateTeam(teamId)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || trimmedName === initialName) return

    updateMutation.mutate(
      { name: trimmedName },
      {
        onSuccess: () => {
          toast.success('Team name updated')
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className='max-w-md space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='team-name'>Team Name</Label>
        <Input
          id='team-name'
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder='Team name'
          disabled={updateMutation.isPending}
        />
      </div>
      <div className='space-y-2'>
        <Label>Team ID</Label>
        <Input value={teamId} disabled className='font-mono text-xs' />
      </div>
      <div className='space-y-2'>
        <Label>Created</Label>
        <Input
          value={new Date(createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          disabled
        />
      </div>
      <Button
        type='submit'
        disabled={
          updateMutation.isPending ||
          !name.trim() ||
          name.trim() === initialName
        }
      >
        {updateMutation.isPending ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  )
}

export function TeamSettings() {
  const { currentTeam, isLoading } = useCurrentTeam()

  if (isLoading) {
    return (
      <div className='rounded-lg border p-8 text-center text-muted-foreground'>
        Loading team settings...
      </div>
    )
  }

  if (!currentTeam) {
    return (
      <div className='rounded-lg border p-8 text-center text-muted-foreground'>
        No team selected. Please select or create a team first.
      </div>
    )
  }

  return (
    <div className='rounded-lg border p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold'>Team Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Update your team name and view team information.
        </p>
      </div>

      <Separator className='mb-6' />

      <TeamSettingsForm
        key={currentTeam.id}
        teamId={currentTeam.id}
        initialName={currentTeam.name}
        createdAt={currentTeam.created_at}
      />
    </div>
  )
}
