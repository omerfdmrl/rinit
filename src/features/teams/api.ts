import type { Team } from '@/stores/team-store'
import { http } from '@/lib/http'

export const teamsQueryKey = ['teams'] as const
export const currentTeamQueryKey = ['teams', 'current'] as const
export const teamMembersQueryKey = ['teams', 'members'] as const
export const teamRolesQueryKey = ['teams', 'roles'] as const
export const teamPermissionsQueryKey = ['teams', 'permissions'] as const

export async function getTeams(): Promise<Team[]> {
  const { data } = await http.get<Team[]>('/teams/')
  return data
}

export async function getCurrentTeam(): Promise<Team> {
  const { data } = await http.get<Team>('/teams/current')
  return data
}

export async function createTeam(body: { name: string }): Promise<Team> {
  const { data } = await http.post<Team>('/teams/', body)
  return data
}

export async function switchTeam(body: { team_id: string }): Promise<Team> {
  const { data } = await http.post<Team>('/teams/switch', body)
  return data
}

export async function updateTeam(
  teamId: string,
  body: { name: string }
): Promise<Team> {
  const { data } = await http.put<Team>(`/teams/${teamId}`, body)
  return data
}

export type TeamMember = {
  id: string
  team_id: string
  user_id: string
  name: string
  email: string
  role: string
  created_at: string
}

export type MembersResponse = {
  members: TeamMember[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export async function getTeamMembers(
  teamId: string,
  params?: {
    page?: number
    per_page?: number
    sort_by?: string
    sort_order?: string
    role?: string
  }
): Promise<MembersResponse> {
  const { data } = await http.get<MembersResponse>(`/teams/${teamId}/members`, {
    params,
  })
  return data
}

export async function removeTeamMember(
  teamId: string,
  userId: string
): Promise<{ message: string }> {
  const { data } = await http.delete<{ message: string }>(
    `/teams/${teamId}/members/${userId}`
  )
  return data
}

export async function assignMemberRole(
  teamId: string,
  userId: string,
  role: string
): Promise<{
  id: string
  team_id: string
  user_id: string
  role: string
  created_at: string
}> {
  const { data } = await http.put<{
    id: string
    team_id: string
    user_id: string
    role: string
    created_at: string
  }>(`/teams/${teamId}/members/${userId}/role`, { role })
  return data
}

export type TeamRole = {
  id: string
  role_name: string
  team_id: string
  is_default: boolean
  description: string
  created_at: string
  updated_at: string
}

export type TeamRoleWithPermissions = {
  role: TeamRole
  permissions: Permission[]
}

export async function getTeamRoles(
  teamId: string
): Promise<{ roles: TeamRoleWithPermissions[] }> {
  const { data } = await http.get<{ roles: TeamRoleWithPermissions[] }>(
    `/teams/${teamId}/roles`
  )
  return data
}

export async function createTeamRole(
  teamId: string,
  body: {
    name: string
    description?: string
    permission_keys?: string[]
  }
): Promise<TeamRole> {
  const { data } = await http.post<TeamRole>(`/teams/${teamId}/roles`, body)
  return data
}

export async function updateTeamRole(
  teamId: string,
  roleId: string,
  body: {
    name?: string
    description?: string
    permission_keys?: string[]
  }
): Promise<TeamRole> {
  const { data } = await http.put<TeamRole>(
    `/teams/${teamId}/roles/${roleId}`,
    body
  )
  return data
}

export async function deleteTeamRole(
  teamId: string,
  roleId: string
): Promise<{ message: string }> {
  const { data } = await http.delete<{ message: string }>(
    `/teams/${teamId}/roles/${roleId}`
  )
  return data
}

export type Permission = {
  id: string
  permission_key: string
  description: string
  is_system: boolean
  is_assignable: boolean
  created_at: string
}

export async function getTeamPermissions(
  teamId: string
): Promise<{ permissions: Permission[] }> {
  const { data } = await http.get<{ permissions: Permission[] }>(
    `/teams/${teamId}/permissions`
  )
  return data
}

export async function inviteTeamMember(
  teamId: string,
  body: {
    email: string
    role?: string
  }
): Promise<{ invitation_id: string; message: string }> {
  const { data } = await http.post<{
    invitation_id: string
    message: string
  }>(`/teams/${teamId}/invite`, body)
  return data
}
