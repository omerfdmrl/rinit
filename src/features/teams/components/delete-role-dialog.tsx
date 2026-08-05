import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { TeamRole } from '../api'
import { useDeleteTeamRole } from '../hooks/use-teams'

type DeleteRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  role: TeamRole | null
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  teamId,
  role,
}: DeleteRoleDialogProps) {
  const deleteMutation = useDeleteTeamRole(teamId)

  const handleConfirm = () => {
    if (!role) return

    deleteMutation.mutate(role.id, {
      onSuccess: () => {
        toast.success('Role deleted successfully')
        onOpenChange(false)
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Delete role'
      desc={`Are you sure you want to delete the "${role?.role_name}" role? This action cannot be undone.`}
      confirmText='Delete'
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={handleConfirm}
    />
  )
}
