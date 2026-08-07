import { useAuthStore } from '@/stores/auth-store'

export const adminTeamPermissions = {
  list: 'teams.list',
  view: 'teams.view',
  create: 'teams.create',
  update: 'teams.update',
  delete: 'teams.delete',
} as const

export function useAdminTeamPermissions() {
  const permissions =
    useAuthStore((state) => state.auth.user?.permissions) ?? []

  return {
    canList: permissions.includes(adminTeamPermissions.list),
    canView: permissions.includes(adminTeamPermissions.view),
    canCreate: permissions.includes(adminTeamPermissions.create),
    canUpdate: permissions.includes(adminTeamPermissions.update),
    canDelete: permissions.includes(adminTeamPermissions.delete),
  }
}
