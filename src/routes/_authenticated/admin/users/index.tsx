import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { type AuthUser } from '@/stores/auth-store'
import { getMe, meQueryKey } from '@/features/auth/api'
import { AdminUsers } from '@/features/users/admin'
import { adminUserPermissions } from '@/features/users/hooks/use-admin-permissions'

const adminUsersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  search: z.string().optional().catch(''),
  two_factor: z
    .union([z.enum(['true', 'false']), z.string().regex(/^in:.*/)])
    .optional()
    .catch(''),
  sort_by: z.string().optional().catch(''),
  sort_order: z.enum(['asc', 'desc']).optional().catch('asc'),
})

export const Route = createFileRoute('/_authenticated/admin/users/')({
  validateSearch: adminUsersSearchSchema,
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

    if (!me.user.permissions.includes(adminUserPermissions.list)) {
      throw redirect({ to: '/403' })
    }
  },
  component: AdminUsers,
})
