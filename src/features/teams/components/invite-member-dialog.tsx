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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInviteTeamMember, useTeamRoles } from '../hooks/use-teams'

type InviteMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: number
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  teamId,
}: InviteMemberDialogProps) {
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState('member')
  const inviteMutation = useInviteTeamMember(teamId)
  const rolesQuery = useTeamRoles(teamId)
  const isPending = inviteMutation.isPending

  const roles = rolesQuery.data?.roles ?? []

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return

    inviteMutation.mutate(
      { email: trimmedEmail, role },
      {
        onSuccess: () => {
          toast.success('Invitation sent successfully')
          setEmail('')
          setRole('member')
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Send an invitation to join this team. They will receive an email
            with a link to accept.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            type='email'
            autoFocus
            placeholder='Email address'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
          />
          <Select value={role} onValueChange={setRole} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder='Select role' />
            </SelectTrigger>
            <SelectContent>
              {roles.map(({ role: r }) => (
                <SelectItem key={r.id} value={r.role_name}>
                  {r.role_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending || !email.trim()}>
              {isPending ? 'Sending...' : 'Send invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
