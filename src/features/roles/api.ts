import { http } from '@/lib/http'

export const adminRolesQueryKey = ['admin', 'roles'] as const
export const adminPermissionsQueryKey = ['admin', 'permissions'] as const
export const adminRolePermissionsQueryKey = (roleId: number) =>
  ['admin', 'roles', roleId, 'permissions'] as const

export type AdminRole = {
  id: number
  role_name: string
  team_id: number | null
  is_default: boolean
  description: string
  created_at: string
  updated_at: string
}

export type AdminPermission = {
  id: number
  permission_key: string
  description: string
  is_system: boolean
  is_assignable: boolean
  created_at: string
}

export type AdminPagination = {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export type AdminRolesResponse = {
  roles: AdminRole[]
  pagination: AdminPagination
}

export type AdminPermissionsResponse = {
  permissions: AdminPermission[]
  pagination: AdminPagination
}

export type AdminRolesListParams = {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  is_default?: string
  team_id?: string
}

export type AdminPermissionsListParams = {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  is_assignable?: string
  is_system?: string
}

export async function getAdminRoles(
  params?: AdminRolesListParams
): Promise<AdminRolesResponse> {
  const { data } = await http.get<AdminRolesResponse>('/admin/roles', {
    params,
  })
  return data
}

export type AdminRoleCreateBody = {
  name: string
  description?: string
  team_id?: number
  is_default?: boolean
}

export async function createAdminRole(
  body: AdminRoleCreateBody
): Promise<{ role: AdminRole; message: string }> {
  const { data } = await http.post<{ role: AdminRole; message: string }>(
    '/admin/roles',
    body
  )
  return data
}

export type AdminRoleUpdateBody = {
  name?: string
  description?: string
}

export async function updateAdminRole(
  roleId: number,
  body: AdminRoleUpdateBody
): Promise<{ role: AdminRole; message: string }> {
  const { data } = await http.put<{ role: AdminRole; message: string }>(
    `/admin/roles/${roleId}`,
    body
  )
  return data
}

export async function deleteAdminRole(
  roleId: number
): Promise<{ message: string }> {
  const { data } = await http.delete<{ message: string }>(
    `/admin/roles/${roleId}`
  )
  return data
}

export async function getRolePermissions(
  roleId: number
): Promise<{ role: AdminRole; permissions: AdminPermission[] }> {
  const { data } = await http.get<{
    role: AdminRole
    permissions: AdminPermission[]
  }>(`/admin/roles/${roleId}/permissions`)
  return data
}

export async function assignRolePermission(
  roleId: number,
  permissionId: number
): Promise<{ message: string }> {
  const { data } = await http.post<{ message: string }>(
    `/admin/roles/${roleId}/permissions`,
    { permission_id: permissionId }
  )
  return data
}

export async function removeRolePermission(
  roleId: number,
  permissionId: number
): Promise<{ message: string }> {
  const { data } = await http.delete<{ message: string }>(
    `/admin/roles/${roleId}/permissions/${permissionId}`
  )
  return data
}

export async function getAdminPermissions(
  params?: AdminPermissionsListParams
): Promise<AdminPermissionsResponse> {
  const { data } = await http.get<AdminPermissionsResponse>(
    '/admin/permissions',
    { params }
  )
  return data
}

export type AdminPermissionCreateBody = {
  key: string
  description?: string
  is_assignable?: boolean
}

export async function createAdminPermission(
  body: AdminPermissionCreateBody
): Promise<{ permission: AdminPermission; message: string }> {
  const { data } = await http.post<{
    permission: AdminPermission
    message: string
  }>('/admin/permissions', body)
  return data
}

export async function updateAdminPermission(
  permissionId: number,
  body: { description?: string }
): Promise<{ permission: AdminPermission; message: string }> {
  const { data } = await http.put<{
    permission: AdminPermission
    message: string
  }>(`/admin/permissions/${permissionId}`, body)
  return data
}
