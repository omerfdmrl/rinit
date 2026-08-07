import { http } from '@/lib/http'

export const adminTeamsQueryKey = ['admin', 'teams'] as const
export const adminTeamUsersQueryKey = (teamId: string) =>
  ['admin', 'teams', teamId, 'users'] as const

export type AdminTeam = {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
}

export type AdminTeamUser = {
  id: string
  team_id: string
  user_id: string
  role: string
  created_at: string
}

export type AdminPagination = {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export type AdminTeamsResponse = {
  teams: AdminTeam[]
  pagination: AdminPagination
}

export type AdminTeamUsersResponse = {
  users: AdminTeamUser[]
  pagination: AdminPagination
}

export type AdminTeamsListParams = {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  created_by?: string
}

export type AdminTeamUsersListParams = {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  role?: string
  user_id?: string
}

export async function getAdminTeams(
  params?: AdminTeamsListParams
): Promise<AdminTeamsResponse> {
  const { data } = await http.get<AdminTeamsResponse>('/admin/teams', {
    params,
  })
  return data
}

export async function createAdminTeam(body: {
  name: string
}): Promise<{ team: AdminTeam; message: string }> {
  const { data } = await http.post<{ team: AdminTeam; message: string }>(
    '/admin/teams',
    body
  )
  return data
}

export async function updateAdminTeam(
  teamId: string,
  body: { name: string }
): Promise<{ team: AdminTeam; message: string }> {
  const { data } = await http.put<{ team: AdminTeam; message: string }>(
    `/admin/teams/${teamId}`,
    body
  )
  return data
}

export async function deleteAdminTeam(
  teamId: string
): Promise<{ message: string }> {
  const { data } = await http.delete<{ message: string }>(
    `/admin/teams/${teamId}`
  )
  return data
}

export async function getAdminTeamUsers(
  teamId: string,
  params?: AdminTeamUsersListParams
): Promise<AdminTeamUsersResponse> {
  const { data } = await http.get<AdminTeamUsersResponse>(
    `/admin/teams/${teamId}/users`,
    { params }
  )
  return data
}
