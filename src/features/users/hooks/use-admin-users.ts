import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminUsersQueryKey,
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  sendAdminPasswordReset,
  updateAdminUser,
  type AdminUserCreateBody,
  type AdminUsersListParams,
  type AdminUserUpdateBody,
} from '../api'

export function useAdminUsers(params?: AdminUsersListParams) {
  return useQuery({
    queryKey: [...adminUsersQueryKey, params],
    queryFn: () => getAdminUsers(params),
  })
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AdminUserCreateBody) => createAdminUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey })
    },
  })
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: string
      body: AdminUserUpdateBody
    }) => updateAdminUser(userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey })
    },
  })
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey })
    },
  })
}

export function useSendAdminPasswordReset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => sendAdminPasswordReset(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey })
    },
  })
}
