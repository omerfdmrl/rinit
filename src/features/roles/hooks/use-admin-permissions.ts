import { useAuthStore } from '@/stores/auth-store'

export const adminRolePermissions = {
  list: 'roles.list',
  view: 'roles.view',
  create: 'roles.create',
  update: 'roles.update',
  delete: 'roles.delete',
  permissionsList: 'permissions.list',
  permissionsView: 'permissions.view',
  permissionsCreate: 'permissions.create',
  permissionsUpdate: 'permissions.update',
} as const

export function useAdminRolePermissions() {
  const permissions =
    useAuthStore((state) => state.auth.user?.permissions) ?? []

  return {
    canList: permissions.includes(adminRolePermissions.list),
    canView: permissions.includes(adminRolePermissions.view),
    canCreate: permissions.includes(adminRolePermissions.create),
    canUpdate: permissions.includes(adminRolePermissions.update),
    canDelete: permissions.includes(adminRolePermissions.delete),
    canListPermissions: permissions.includes(
      adminRolePermissions.permissionsList
    ),
    canViewPermissions: permissions.includes(
      adminRolePermissions.permissionsView
    ),
    canCreatePermissions: permissions.includes(
      adminRolePermissions.permissionsCreate
    ),
    canUpdatePermissions: permissions.includes(
      adminRolePermissions.permissionsUpdate
    ),
  }
}
