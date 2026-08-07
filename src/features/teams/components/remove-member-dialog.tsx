import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { TeamMember } from '../api'
import { useRemoveTeamMember } from '../hooks/use-teams'

type RemoveMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: number
  member: TeamMember | null
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  teamId,
  member,
}: RemoveMemberDialogProps) {
  const removeMutation = useRemoveTeamMember(teamId)

  const handleConfirm = () => {
    if (!member) return

    removeMutation.mutate(member.user_id, {
      onSuccess: () => {
        toast.success('Member removed successfully')
        onOpenChange(false)
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Remove member'
      desc={`Are you sure you want to remove ${member?.name ?? 'this member'} from the team? They will lose access to all team resources.`}
      confirmText='Remove'
      destructive
      isLoading={removeMutation.isPending}
      handleConfirm={handleConfirm}
    />
  )
}
