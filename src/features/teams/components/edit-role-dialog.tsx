import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { TeamRoleWithPermissions } from '../api'
import {
  useCreateTeamRole,
  useUpdateTeamRole,
  useTeamPermissions,
} from '../hooks/use-teams'

type EditRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  role?: TeamRoleWithPermissions | null
}

function EditRoleForm({
  teamId,
  role,
  onOpenChange,
}: {
  teamId: string
  role: TeamRoleWithPermissions | null
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = React.useState(role?.role.role_name ?? '')
  const [description, setDescription] = React.useState(
    role?.role.description ?? ''
  )
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    string[]
  >(role?.permissions.map((p) => p.permission_key) ?? [])

  const createMutation = useCreateTeamRole(teamId)
  const updateMutation = useUpdateTeamRole(teamId)
  const permissionsQuery = useTeamPermissions(teamId)

  const isPending = createMutation.isPending || updateMutation.isPending
  const permissions = permissionsQuery.data?.permissions ?? []
  const isEditing = !!role

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    )
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    if (isEditing) {
      updateMutation.mutate(
        {
          roleId: role.role.id,
          body: {
            name: trimmedName,
            description: description.trim() || undefined,
            permission_keys: selectedPermissions,
          },
        },
        {
          onSuccess: () => {
            toast.success('Role updated successfully')
            onOpenChange(false)
          },
        }
      )
    } else {
      createMutation.mutate(
        {
          name: trimmedName,
          description: description.trim() || undefined,
          permission_keys: selectedPermissions,
        },
        {
          onSuccess: () => {
            toast.success('Role created successfully')
            onOpenChange(false)
          },
        }
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='role-name'>Name</Label>
        <Input
          id='role-name'
          autoFocus
          placeholder='Role name'
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isPending}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='role-description'>Description</Label>
        <Input
          id='role-description'
          placeholder='Optional description'
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isPending}
        />
      </div>
      <div className='space-y-2'>
        <Label>Permissions</Label>
        <div className='grid gap-2 rounded-lg border p-3'>
          {permissions.map((permission) => (
            <label
              key={permission.id}
              className='flex items-center gap-2 text-sm'
            >
              <Checkbox
                checked={selectedPermissions.includes(
                  permission.permission_key
                )}
                onCheckedChange={() =>
                  togglePermission(permission.permission_key)
                }
                disabled={isPending}
              />
              <span className='flex-1'>{permission.description}</span>
              <span className='font-mono text-xs text-muted-foreground'>
                {permission.permission_key}
              </span>
            </label>
          ))}
        </div>
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
        <Button type='submit' disabled={isPending || !name.trim()}>
          {isPending ? 'Saving...' : isEditing ? 'Save changes' : 'Create role'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function EditRoleDialog({
  open,
  onOpenChange,
  teamId,
  role,
}: EditRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{role ? 'Edit role' : 'Create role'}</DialogTitle>
          <DialogDescription>
            {role
              ? 'Update the role name, description, and permissions.'
              : 'Create a new role and assign permissions.'}
          </DialogDescription>
        </DialogHeader>
        <EditRoleForm
          key={role?.role.id ?? 'create'}
          teamId={teamId}
          role={role ?? null}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  )
}
