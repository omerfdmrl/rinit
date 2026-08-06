import { useAuthStore } from '@/stores/auth-store'

export const adminUserPermissions = {
  list: 'users.list',
  create: 'users.create',
  update: 'users.update',
  delete: 'users.delete',
} as const

export function useAdminUserPermissions() {
  const permissions =
    useAuthStore((state) => state.auth.user?.permissions) ?? []

  return {
    canList: permissions.includes(adminUserPermissions.list),
    canCreate: permissions.includes(adminUserPermissions.create),
    canUpdate: permissions.includes(adminUserPermissions.update),
    canDelete: permissions.includes(adminUserPermissions.delete),
  }
}
