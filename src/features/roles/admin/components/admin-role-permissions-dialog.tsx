import { useMemo, useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type AdminPermission, type AdminRole } from '../../api'
import { useAdminRolePermissions } from '../../hooks/use-admin-permissions'
import {
  useAdminPermissions,
  useAssignRolePermission,
  useRemoveRolePermission,
  useRolePermissions,
} from '../../hooks/use-admin-roles'

type AdminRolePermissionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: AdminRole
}

export function AdminRolePermissionsDialog({
  open,
  onOpenChange,
  role,
}: AdminRolePermissionsDialogProps) {
  const { canUpdate } = useAdminRolePermissions()
  const [search, setSearch] = useState('')
  const [pendingKeys, setPendingKeys] = useState<Set<number>>(new Set())

  const rolePermissionsQuery = useRolePermissions(role.id)
  const catalogQuery = useAdminPermissions({ per_page: 100 })

  const assignMutation = useAssignRolePermission(role.id)
  const removeMutation = useRemoveRolePermission(role.id)

  const assigned = useMemo(() => {
    const perms = rolePermissionsQuery.data?.permissions ?? []
    return new Map<number, AdminPermission>(
      perms.map((perm) => [perm.id, perm])
    )
  }, [rolePermissionsQuery.data?.permissions])

  const catalog = useMemo(() => {
    const perms = catalogQuery.data?.permissions ?? []
    const query = search.trim().toLowerCase()
    if (!query) return perms
    return perms.filter(
      (perm) =>
        perm.permission_key.toLowerCase().includes(query) ||
        perm.description.toLowerCase().includes(query)
    )
  }, [catalogQuery.data?.permissions, search])

  const setPending = (permissionId: number, isPending: boolean) => {
    setPendingKeys((prev) => {
      const next = new Set(prev)
      if (isPending) {
        next.add(permissionId)
      } else {
        next.delete(permissionId)
      }
      return next
    })
  }

  const togglePermission = (permission: AdminPermission) => {
    if (!canUpdate) return

    setPending(permission.id, true)
    if (assigned.has(permission.id)) {
      removeMutation.mutate(permission.id, {
        onSuccess: ({ message }) => {
          toast.success(message)
          setPending(permission.id, false)
        },
        onError: (error) => {
          handleServerError(error)
          setPending(permission.id, false)
        },
      })
      return
    }

    assignMutation.mutate(permission.id, {
      onSuccess: ({ message }) => {
        toast.success(message)
        setPending(permission.id, false)
      },
      onError: (error) => {
        handleServerError(error)
        setPending(permission.id, false)
      },
    })
  }

  const isLoading = rolePermissionsQuery.isLoading || catalogQuery.isLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <ShieldCheck size={18} />
            Manage Permissions
          </DialogTitle>
          <DialogDescription>
            Assign permissions to the{' '}
            <span className='font-medium text-foreground'>
              {role.role_name}
            </span>{' '}
            role.
            {!canUpdate && ' You can view but not modify these permissions.'}
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder='Filter permissions...'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className='h-8'
        />

        {isLoading ? (
          <div className='flex h-60 items-center justify-center text-sm text-muted-foreground'>
            <Loader2 className='me-2 animate-spin' />
            Loading permissions...
          </div>
        ) : (
          <ScrollArea className='h-72 rounded-md border'>
            <div className='divide-y'>
              {catalog.length === 0 ? (
                <div className='p-8 text-center text-sm text-muted-foreground'>
                  No permissions found.
                </div>
              ) : (
                catalog.map((permission) => {
                  const isAssigned = assigned.has(permission.id)
                  const isPending = pendingKeys.has(permission.id)
                  return (
                    <div
                      key={permission.id}
                      className={cn(
                        'flex items-start gap-3 p-3',
                        isAssigned && 'bg-muted/40'
                      )}
                    >
                      <Checkbox
                        checked={isAssigned}
                        disabled={!canUpdate || isPending}
                        onCheckedChange={() => togglePermission(permission)}
                        aria-label={permission.permission_key}
                        className='mt-0.5'
                      />
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <code className='truncate text-sm font-medium'>
                            {permission.permission_key}
                          </code>
                          {permission.is_system && (
                            <Badge
                              variant='outline'
                              className='shrink-0 px-1.5 text-[10px]'
                            >
                              system
                            </Badge>
                          )}
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {permission.description}
                        </p>
                      </div>
                      {isPending && (
                        <Loader2 className='mt-0.5 size-4 animate-spin' />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        )}

        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>
            {assigned.size} of {catalogQuery.data?.pagination.total ?? 0}{' '}
            permissions assigned
          </span>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
