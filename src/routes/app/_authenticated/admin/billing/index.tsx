import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { type AuthUser } from '@/stores/auth-store'
import { getMe, meQueryKey } from '@/features/auth/api'
import { AdminBilling } from '@/features/billing/admin'
import { adminBillingPermissions } from '@/features/billing/admin/hooks/use-admin-billing-permissions'

const adminBillingSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  search: z.string().optional().catch(''),
  sort_by: z.string().optional().catch(''),
  sort_order: z.enum(['asc', 'desc']).optional().catch('asc'),
})

export const Route = createFileRoute('/app/_authenticated/admin/billing/')({
  validateSearch: adminBillingSearchSchema,
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient
    const cached = queryClient.getQueryData<{ user: AuthUser }>(meQueryKey)
    const me =
      cached ??
      (await queryClient.fetchQuery<{ user: AuthUser }>({
        queryKey: meQueryKey,
        queryFn: getMe,
        retry: false,
        staleTime: 0,
      }))

    if (!me.user.permissions.includes(adminBillingPermissions.plans.list)) {
      throw redirect({ to: '/403' })
    }
  },
  component: AdminBilling,
})
