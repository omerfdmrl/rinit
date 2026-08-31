import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminRestrictionsQueryKey,
  createAdminRestrictionStage,
  deleteAdminRestrictionStage,
  getAdminRestrictionStages,
  updateAdminRestrictionStage,
  type AdminRestrictionStageInput,
} from '../api'

export function useAdminRestrictionStages() {
  return useQuery({
    queryKey: adminRestrictionsQueryKey,
    queryFn: getAdminRestrictionStages,
  })
}

export function useCreateAdminRestrictionStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AdminRestrictionStageInput) =>
      createAdminRestrictionStage(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRestrictionsQueryKey })
    },
  })
}

export function useUpdateAdminRestrictionStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      stageId,
      body,
    }: {
      stageId: number
      body: AdminRestrictionStageInput
    }) => updateAdminRestrictionStage(stageId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRestrictionsQueryKey })
    },
  })
}

export function useDeleteAdminRestrictionStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (stageId: number) => deleteAdminRestrictionStage(stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRestrictionsQueryKey })
    },
  })
}
