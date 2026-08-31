import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminMetricsQueryKey,
  createAdminMetric,
  deleteAdminMetric,
  getAdminMetrics,
  updateAdminMetric,
  type AdminListParams,
} from '../api'

export type AdminMetricBody = {
  key: string
  name: string
  unit: string
  aggregation_type?: string
}

export function useAdminMetrics(params?: AdminListParams) {
  return useQuery({
    queryKey: [...adminMetricsQueryKey, params],
    queryFn: () => getAdminMetrics(params),
  })
}

export function useCreateAdminMetric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AdminMetricBody) => createAdminMetric(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMetricsQueryKey })
    },
  })
}

export function useUpdateAdminMetric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      metricId,
      body,
    }: {
      metricId: number
      body: AdminMetricBody
    }) => updateAdminMetric(metricId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMetricsQueryKey })
    },
  })
}

export function useDeleteAdminMetric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (metricId: number) => deleteAdminMetric(metricId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMetricsQueryKey })
    },
  })
}
