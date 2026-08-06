import * as React from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { TeamRoleWithPermissions, Permission } from '../api'
import { useTeamUserPermissions } from '../hooks/use-team-user-permissions'
import {
  useCurrentTeam,
  useTeamRoles,
  useUpdateTeamRole,
} from '../hooks/use-teams'
import { DeleteRoleDialog } from './delete-role-dialog'
import { EditRoleDialog } from './edit-role-dialog'

function groupPermissions(
  permissions: Permission[]
): Map<string, Permission[]> {
  const groups = new Map<string, Permission[]>()
  for (const perm of permissions) {
    const parts = perm.permission_key.split('.')
    const group = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : parts[0]
    const existing = groups.get(group) ?? []
    existing.push(perm)
    groups.set(group, existing)
  }
  return groups
}

function formatGroupName(name: string): string {
  return name
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function TeamRoles() {
  const { currentTeam } = useCurrentTeam()
  const { canCreateRole, canUpdateRole, canDeleteRole } =
    useTeamUserPermissions()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editRole, setEditRole] =
    React.useState<TeamRoleWithPermissions | null>(null)
  const [deleteRole, setDeleteRole] =
    React.useState<TeamRoleWithPermissions | null>(null)

  const rolesQuery = useTeamRoles(currentTeam?.id ?? '')
  const updateMutation = useUpdateTeamRole(currentTeam?.id ?? '')

  const roles = React.useMemo(
    () => rolesQuery.data?.roles ?? [],
    [rolesQuery.data?.roles]
  )

  // Collect all unique permissions across roles
  const allPermissions = React.useMemo(() => {
    const permMap = new Map<string, Permission>()
    for (const { permissions } of roles) {
      for (const perm of permissions) {
        permMap.set(perm.permission_key, perm)
      }
    }
    return Array.from(permMap.values())
  }, [roles])

  const permissionGroups = React.useMemo(
    () => groupPermissions(allPermissions),
    [allPermissions]
  )

  const togglePermission = (
    roleWithPerms: TeamRoleWithPermissions,
    permissionKey: string
  ) => {
    if (!currentTeam || roleWithPerms.role.is_default) return

    const currentKeys = roleWithPerms.permissions.map((p) => p.permission_key)
    const newKeys = currentKeys.includes(permissionKey)
      ? currentKeys.filter((k) => k !== permissionKey)
      : [...currentKeys, permissionKey]

    updateMutation.mutate(
      {
        roleId: roleWithPerms.role.id,
        body: { permission_keys: newKeys },
      },
      {
        onSuccess: () => {
          toast.success('Permissions updated')
        },
      }
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
    <>
      <div className='rounded-lg border p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold'>Access Control</h3>
            <p className='text-sm text-muted-foreground'>
              Manage role permissions across resources.
            </p>
          </div>
          {canCreateRole && (
            <Button size='sm' onClick={() => setCreateOpen(true)}>
              <Plus className='size-4' />
              Add Role
            </Button>
          )}
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='min-w-[150px]'>Role</TableHead>
                {Array.from(permissionGroups.entries()).map(
                  ([group, perms]) => (
                    <TableHead
                      key={group}
                      colSpan={perms.length}
                      className='border-l text-center'
                    >
                      <div className='font-semibold'>
                        {formatGroupName(group)}
                      </div>
                      <div className='mt-1 flex justify-center gap-1'>
                        {perms.map((perm) => {
                          const suffix = perm.permission_key.split('.').pop()
                          return (
                            <span
                              key={perm.id}
                              className='px-1 text-[10px] text-muted-foreground'
                              title={perm.description}
                            >
                              {suffix}
                            </span>
                          )
                        })}
                      </div>
                    </TableHead>
                  )
                )}
                <TableHead className='w-[100px]' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={permissionGroups.size + 2}
                    className='h-24 text-center'
                  >
                    Loading roles...
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={permissionGroups.size + 2}
                    className='h-24 text-center'
                  >
                    No roles found.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((roleWithPerms) => (
                  <TableRow key={roleWithPerms.role.id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>
                          {roleWithPerms.role.role_name}
                        </span>
                        {roleWithPerms.role.is_default && (
                          <Badge variant='outline' className='text-xs'>
                            {roleWithPerms.role.is_default ? 'default' : ''}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {Array.from(permissionGroups.entries()).map(
                      ([group, perms]) => (
                        <React.Fragment key={group}>
                          {perms.map((perm) => {
                            const isChecked = roleWithPerms.permissions.some(
                              (p) => p.permission_key === perm.permission_key
                            )
                            return (
                              <TableCell
                                key={perm.id}
                                className='border-l text-center'
                              >
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className='flex justify-center'>
                                        <Checkbox
                                          checked={isChecked}
                                          disabled={
                                            roleWithPerms.role.is_default ||
                                            updateMutation.isPending ||
                                            !canUpdateRole
                                          }
                                          onCheckedChange={() =>
                                            togglePermission(
                                              roleWithPerms,
                                              perm.permission_key
                                            )
                                          }
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{perm.description}</p>
                                      <p className='font-mono text-xs text-muted-foreground'>
                                        {perm.permission_key}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            )
                          })}
                        </React.Fragment>
                      )
                    )}
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        {canUpdateRole && (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='size-8'
                            onClick={() => setEditRole(roleWithPerms)}
                          >
                            <Pencil className='size-4' />
                          </Button>
                        )}
                        {!roleWithPerms.role.is_default && canDeleteRole && (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='size-8 text-destructive'
                            onClick={() => setDeleteRole(roleWithPerms)}
                          >
                            <Trash2 className='size-4' />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditRoleDialog
        open={createOpen || !!editRole}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false)
            setEditRole(null)
          }
        }}
        teamId={currentTeam.id}
        role={editRole}
      />
      <DeleteRoleDialog
        open={!!deleteRole}
        onOpenChange={(open) => {
          if (!open) setDeleteRole(null)
        }}
        teamId={currentTeam.id}
        role={deleteRole?.role ?? null}
      />
    </>
  )
}
