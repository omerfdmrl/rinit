import { useAuthStore } from '@/stores/auth-store'

export const teamPermissions = {
  membersList: 'teams.members.list',
  membersRemove: 'teams.members.remove',
  membersRoleAssign: 'teams.members.role.assign',
  membersInvite: 'teams.members.invite',
  rolesList: 'teams.roles.list',
  rolesView: 'teams.roles.view',
  rolesCreate: 'teams.roles.create',
  rolesUpdate: 'teams.roles.update',
  rolesDelete: 'teams.roles.delete',
} as const

export function useTeamUserPermissions() {
  const permissions =
    useAuthStore((state) => state.auth.user?.permissions) ?? []

  return {
    canListMembers: permissions.includes(teamPermissions.membersList),
    canRemoveMember: permissions.includes(teamPermissions.membersRemove),
    canAssignRole: permissions.includes(teamPermissions.membersRoleAssign),
    canInviteMember: permissions.includes(teamPermissions.membersInvite),
    canListRoles: permissions.includes(teamPermissions.rolesList),
    canViewRoles: permissions.includes(teamPermissions.rolesView),
    canCreateRole: permissions.includes(teamPermissions.rolesCreate),
    canUpdateRole: permissions.includes(teamPermissions.rolesUpdate),
    canDeleteRole: permissions.includes(teamPermissions.rolesDelete),
  }
}
