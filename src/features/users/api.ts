import { http } from '@/lib/http'

export const adminUsersQueryKey = ['admin', 'users'] as const

export type AdminUserRole = 'user' | 'admin'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  two_factor_enabled: boolean
  created_at: string
  updated_at: string
}

export type AdminUsersPagination = {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export type AdminUsersResponse = {
  users: AdminUser[]
  pagination: AdminUsersPagination
}

export type AdminUsersListParams = {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  role?: string
  two_factor?: string
}

export async function getAdminUsers(
  params?: AdminUsersListParams
): Promise<AdminUsersResponse> {
  const { data } = await http.get<AdminUsersResponse>('/admin/users', {
    params,
  })
  return data
}

export type AdminUserCreateBody = {
  name: string
  email: string
  role: AdminUserRole
}

export async function createAdminUser(
  body: AdminUserCreateBody
): Promise<{ user: AdminUser; message: string }> {
  const { data } = await http.post<{ user: AdminUser; message: string }>(
    '/admin/users',
    body
  )
  return data
}

export type AdminUserUpdateBody = Partial<AdminUserCreateBody>

export async function updateAdminUser(
  userId: string,
  body: AdminUserUpdateBody
): Promise<{ user: AdminUser; message: string }> {
  const { data } = await http.put<{ user: AdminUser; message: string }>(
    `/admin/users/${userId}`,
    body
  )
  return data
}

export async function deleteAdminUser(
  userId: string
): Promise<{ message: string }> {
  const { data } = await http.delete<{ message: string }>(
    `/admin/users/${userId}`
  )
  return data
}

export async function sendAdminPasswordReset(
  userId: string
): Promise<{ message: string }> {
  const { data } = await http.post<{ message: string }>(
    `/admin/users/${userId}/send-password-reset`
  )
  return data
}
