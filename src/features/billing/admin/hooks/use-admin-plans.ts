import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateAdminPlan,
  adminPlansQueryKey,
  archiveAdminPlan,
  createAdminPlan,
  deleteAdminPlan,
  duplicateAdminPlan,
  getAdminPlans,
  updateAdminPlan,
  type AdminListParams,
  type AdminPlanInput,
} from '../api'

export function useAdminPlans(params?: AdminListParams) {
  return useQuery({
    queryKey: [...adminPlansQueryKey, params],
    queryFn: () => getAdminPlans(params),
  })
}

export function useCreateAdminPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AdminPlanInput) => createAdminPlan(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlansQueryKey })
    },
  })
}

export function useUpdateAdminPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, body }: { planId: number; body: AdminPlanInput }) =>
      updateAdminPlan(planId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlansQueryKey })
    },
  })
}

export function useDeleteAdminPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: number) => deleteAdminPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlansQueryKey })
    },
  })
}

export function useDuplicateAdminPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, code }: { planId: number; code?: string }) =>
      duplicateAdminPlan(planId, { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlansQueryKey })
    },
  })
}

export function useArchiveAdminPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: number) => archiveAdminPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlansQueryKey })
    },
  })
}

export function useActivateAdminPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: number) => activateAdminPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlansQueryKey })
    },
  })
}
