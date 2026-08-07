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
  type Subscription,
  type SubscriptionResponse,
  type SubscriptionAddon,
} from '../api'

const PLANS_STALE_TIME = 5 * 60 * 1000

export function usePlansCatalog(
  teamId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...plansCatalogQueryKey, teamId],
    queryFn: () => getPlansCatalog(teamId),
    enabled: options?.enabled ?? !!teamId,
    staleTime: PLANS_STALE_TIME,
  })
}

export function useSubscription(
  teamId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...subscriptionQueryKey, teamId],
    queryFn: () => getSubscription(teamId),
    enabled: options?.enabled ?? !!teamId,
    staleTime: PLANS_STALE_TIME,
  })
}

function subscriptionKey(teamId: string) {
  return [...subscriptionQueryKey, teamId] as const
}

function setSubscriptionInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  teamId: string,
  subscription: Subscription
) {
  queryClient.setQueryData<SubscriptionResponse | undefined>(
    subscriptionKey(teamId),
    (old) => (old ? { ...old, subscription } : old)
  )
}

function patchSubscriptionInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  teamId: string,
  updater: (subscription: Subscription) => Subscription
) {
  queryClient.setQueryData<SubscriptionResponse | undefined>(
    subscriptionKey(teamId),
    (old) => (old ? { ...old, subscription: updater(old.subscription) } : old)
  )
}

async function snapshotSubscription(
  queryClient: ReturnType<typeof useQueryClient>,
  teamId: string
) {
  const queryKey = subscriptionKey(teamId)
  await queryClient.cancelQueries({ queryKey })
  const previous = queryClient.getQueryData<SubscriptionResponse>(queryKey)
  return { previous }
}

function rollbackSubscription(
  queryClient: ReturnType<typeof useQueryClient>,
  teamId: string,
  previous?: SubscriptionResponse
) {
  if (previous) {
    queryClient.setQueryData(subscriptionKey(teamId), previous)
  }
}

export function useChangePlan(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: {
      plan_id: string
      change_type: 'upgrade' | 'downgrade'
    }) => changePlan(teamId, body),
    onMutate: async (body) => {
      const context = await snapshotSubscription(queryClient, teamId)
      patchSubscriptionInCache(queryClient, teamId, (sub) => ({
        ...sub,
        scheduled_plan_id: body.plan_id,
        scheduled_change_type: body.change_type,
      }))
      return context
    },
    onError: (_error, _body, context) => {
      rollbackSubscription(queryClient, teamId, context?.previous)
    },
    onSuccess: ({ subscription }) => {
      setSubscriptionInCache(queryClient, teamId, subscription)
    },
  })
}

export function useCancelSubscription(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cancelSubscription(teamId),
    onMutate: async () => {
      const context = await snapshotSubscription(queryClient, teamId)
      patchSubscriptionInCache(queryClient, teamId, (sub) => ({
        ...sub,
        status: 'pending_cancellation',
      }))
      return context
    },
    onError: (_error, _vars, context) => {
      rollbackSubscription(queryClient, teamId, context?.previous)
    },
    onSuccess: ({ subscription }) => {
      setSubscriptionInCache(queryClient, teamId, subscription)
    },
  })
}

export function usePlanUsage(teamId: string) {
  return useQuery({
    queryKey: [...planUsageQueryKey, teamId],
    queryFn: () => getPlanUsage(teamId),
    enabled: !!teamId,
    staleTime: PLANS_STALE_TIME,
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
    staleTime: PLANS_STALE_TIME,
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
    staleTime: PLANS_STALE_TIME,
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
    onMutate: async (body) => {
      const context = await snapshotSubscription(queryClient, teamId)
      patchSubscriptionInCache(queryClient, teamId, (sub) => ({
        ...sub,
        ...(body.enabled !== undefined
          ? { auto_recharge_enabled: body.enabled }
          : {}),
        ...(body.min_balance !== undefined
          ? { auto_recharge_min_balance: body.min_balance }
          : {}),
        ...(body.amount !== undefined
          ? { auto_recharge_amount: body.amount }
          : {}),
        ...(body.max_count !== undefined
          ? { auto_recharge_max_count: body.max_count }
          : {}),
        ...(body.cooldown_seconds !== undefined
          ? { auto_recharge_cooldown_seconds: body.cooldown_seconds }
          : {}),
      }))
      return context
    },
    onError: (_error, _body, context) => {
      rollbackSubscription(queryClient, teamId, context?.previous)
    },
    onSuccess: ({ subscription }) => {
      setSubscriptionInCache(queryClient, teamId, subscription)
    },
  })
}

export function useSetNegativeLimit(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { limit: number | null }) =>
      setNegativeLimit(teamId, body),
    onMutate: async (body) => {
      const context = await snapshotSubscription(queryClient, teamId)
      patchSubscriptionInCache(queryClient, teamId, (sub) => ({
        ...sub,
        negative_balance_limit: body.limit,
      }))
      return context
    },
    onError: (_error, _body, context) => {
      rollbackSubscription(queryClient, teamId, context?.previous)
    },
    onSuccess: ({ subscription }) => {
      setSubscriptionInCache(queryClient, teamId, subscription)
    },
  })
}

function patchAddonsInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  teamId: string,
  updater: (addons: SubscriptionAddon[]) => SubscriptionAddon[]
) {
  queryClient.setQueryData<SubscriptionResponse | undefined>(
    subscriptionKey(teamId),
    (old) => (old ? { ...old, addons: updater(old.addons ?? []) } : old)
  )
}

export function useAttachAddon(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      addonId,
      quantity,
    }: {
      addonId: string
      quantity: number
    }) => attachAddon(teamId, addonId, { quantity }),
    onMutate: async ({ addonId, quantity }) => {
      const context = await snapshotSubscription(queryClient, teamId)
      const pendingId = `pending-${Date.now()}`
      const base = context.previous?.subscription
      patchAddonsInCache(queryClient, teamId, (addons) => [
        ...addons,
        {
          id: pendingId,
          subscription_id: base?.id ?? '',
          addon_id: addonId,
          quantity,
          added_at: new Date().toISOString(),
          current_period_start: base?.current_period_start ?? '',
          current_period_end: base?.current_period_end ?? '',
        },
      ])
      return { ...context, pendingId }
    },
    onError: (_error, _vars, context) => {
      rollbackSubscription(queryClient, teamId, context?.previous)
    },
    onSuccess: ({ addon }, _vars, context) => {
      queryClient.setQueryData<SubscriptionResponse | undefined>(
        subscriptionKey(teamId),
        (old) =>
          old
            ? {
                ...old,
                addons: [
                  ...(old.addons ?? []).filter(
                    (a) => a.id !== context?.pendingId
                  ),
                  addon,
                ],
              }
            : old
      )
    },
  })
}

export function useUpdateAddon(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      addonId,
      quantity,
    }: {
      addonId: string
      quantity: number
    }) => updateAddonQuantity(teamId, addonId, { quantity }),
    onMutate: async ({ addonId, quantity }) => {
      const context = await snapshotSubscription(queryClient, teamId)
      patchAddonsInCache(queryClient, teamId, (addons) =>
        addons.map((a) => (a.addon_id === addonId ? { ...a, quantity } : a))
      )
      return context
    },
    onError: (_error, _vars, context) => {
      rollbackSubscription(queryClient, teamId, context?.previous)
    },
  })
}

export function useDetachAddon(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addonId: string) => detachAddon(teamId, addonId),
    onMutate: async (addonId) => {
      const context = await snapshotSubscription(queryClient, teamId)
      patchAddonsInCache(queryClient, teamId, (addons) =>
        addons.filter((a) => a.addon_id !== addonId)
      )
      return context
    },
    onError: (_error, _vars, context) => {
      rollbackSubscription(queryClient, teamId, context?.previous)
    },
  })
}
