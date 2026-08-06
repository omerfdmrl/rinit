import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminPermissionsQueryKey,
  adminRolePermissionsQueryKey,
  adminRolesQueryKey,
  assignRolePermission,
  createAdminPermission,
  createAdminRole,
  deleteAdminRole,
  getAdminPermissions,
  getAdminRoles,
  getRolePermissions,
  removeRolePermission,
  updateAdminPermission,
  updateAdminRole,
  type AdminPermissionCreateBody,
  type AdminPermissionsListParams,
  type AdminRoleCreateBody,
  type AdminRolesListParams,
  type AdminRoleUpdateBody,
} from '../api'

export function useAdminRoles(params?: AdminRolesListParams) {
  return useQuery({
    queryKey: [...adminRolesQueryKey, params],
    queryFn: () => getAdminRoles(params),
  })
}

export function useCreateAdminRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AdminRoleCreateBody) => createAdminRole(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRolesQueryKey })
    },
  })
}

export function useUpdateAdminRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      roleId,
      body,
    }: {
      roleId: string
      body: AdminRoleUpdateBody
    }) => updateAdminRole(roleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRolesQueryKey })
    },
  })
}

export function useDeleteAdminRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roleId: string) => deleteAdminRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRolesQueryKey })
    },
  })
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: adminRolePermissionsQueryKey(roleId),
    queryFn: () => getRolePermissions(roleId),
    enabled: !!roleId,
  })
}

export function useAssignRolePermission(roleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (permissionId: string) =>
      assignRolePermission(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminRolePermissionsQueryKey(roleId),
      })
    },
  })
}

export function useRemoveRolePermission(roleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (permissionId: string) =>
      removeRolePermission(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminRolePermissionsQueryKey(roleId),
      })
    },
  })
}

export function useAdminPermissions(params?: AdminPermissionsListParams) {
  return useQuery({
    queryKey: [...adminPermissionsQueryKey, params],
    queryFn: () => getAdminPermissions(params),
  })
}

export function useCreateAdminPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AdminPermissionCreateBody) =>
      createAdminPermission(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPermissionsQueryKey })
    },
  })
}

export function useUpdateAdminPermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      permissionId,
      body,
    }: {
      permissionId: string
      body: { description?: string }
    }) => updateAdminPermission(permissionId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPermissionsQueryKey })
    },
  })
}
