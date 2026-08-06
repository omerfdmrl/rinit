import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPlansCatalog,
  getSubscription,
  changePlan,
  cancelSubscription,
  getPlanUsage,
  getInvoices,
  getLedger,
  updateRecharge,
  setNegativeLimit,
  attachAddon,
  updateAddonQuantity,
  detachAddon,
  plansCatalogQueryKey,
  subscriptionQueryKey,
  planUsageQueryKey,
  invoicesQueryKey,
  ledgerQueryKey,
} from '../api'

export function usePlansCatalog(teamId: string) {
  return useQuery({
    queryKey: [...plansCatalogQueryKey, teamId],
    queryFn: () => getPlansCatalog(teamId),
    enabled: !!teamId,
  })
}

export function useSubscription(teamId: string) {
  return useQuery({
    queryKey: [...subscriptionQueryKey, teamId],
    queryFn: () => getSubscription(teamId),
    enabled: !!teamId,
  })
}

export function useChangePlan(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { plan_id: string; change_type: 'upgrade' | 'downgrade' }) =>
      changePlan(teamId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...subscriptionQueryKey, teamId] })
    },
  })
}

export function useCancelSubscription(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cancelSubscription(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...subscriptionQueryKey, teamId] })
    },
  })
}

export function usePlanUsage(teamId: string) {
  return useQuery({
    queryKey: [...planUsageQueryKey, teamId],
    queryFn: () => getPlanUsage(teamId),
    enabled: !!teamId,
  })
}

export function useInvoices(
  teamId: string,
  params?: { page?: number; per_page?: number; status?: string }
) {
  return useQuery({
    queryKey: [...invoicesQueryKey, teamId, params],
    queryFn: () => getInvoices(teamId, params),
    enabled: !!teamId,
  })
}

export function useLedger(
  teamId: string,
  params?: { page?: number; per_page?: number; entry_type?: string }
) {
  return useQuery({
    queryKey: [...ledgerQueryKey, teamId, params],
    queryFn: () => getLedger(teamId, params),
    enabled: !!teamId,
  })
}

export function useUpdateRecharge(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: {
      enabled?: boolean
      min_balance?: number
      amount?: number
      max_count?: number
      cooldown_seconds?: number
    }) => updateRecharge(teamId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...subscriptionQueryKey, teamId] })
    },
  })
}

export function useSetNegativeLimit(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { limit: number | null }) => setNegativeLimit(teamId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...subscriptionQueryKey, teamId] })
    },
  })
}

export function useAttachAddon(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ addonId, quantity }: { addonId: string; quantity: number }) =>
      attachAddon(teamId, addonId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...subscriptionQueryKey, teamId] })
    },
  })
}

export function useUpdateAddon(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ addonId, quantity }: { addonId: string; quantity: number }) =>
      updateAddonQuantity(teamId, addonId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...subscriptionQueryKey, teamId] })
    },
  })
}

export function useDetachAddon(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addonId: string) => detachAddon(teamId, addonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...subscriptionQueryKey, teamId] })
    },
  })
}
