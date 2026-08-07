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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TeamMember } from '../api'
import { useAssignMemberRole, useTeamRoles } from '../hooks/use-teams'

type AssignRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: number
  member: TeamMember | null
}

function AssignRoleForm({
  teamId,
  member,
  onOpenChange,
}: {
  teamId: number
  member: TeamMember
  onOpenChange: (open: boolean) => void
}) {
  const [role, setRole] = React.useState(member.role)
  const assignMutation = useAssignMemberRole(teamId)
  const rolesQuery = useTeamRoles(teamId)

  const isPending = assignMutation.isPending
  const roles = rolesQuery.data?.roles ?? []

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!role) return

    assignMutation.mutate(
      { userId: member.user_id, role },
      {
        onSuccess: () => {
          toast.success('Role assigned successfully')
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
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
        <Button type='submit' disabled={isPending || !role}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function AssignRoleDialog({
  open,
  onOpenChange,
  teamId,
  member,
}: AssignRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            Assign a new role to {member?.name ?? 'this member'}.
          </DialogDescription>
        </DialogHeader>
        {member && (
          <AssignRoleForm
            key={member.id}
            teamId={teamId}
            member={member}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
