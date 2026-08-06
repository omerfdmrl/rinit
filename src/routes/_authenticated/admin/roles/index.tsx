import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { type AuthUser } from '@/stores/auth-store'
import { getMe, meQueryKey } from '@/features/auth/api'
import { AdminRoles } from '@/features/roles/admin'
import { adminRolePermissions } from '@/features/roles/hooks/use-admin-permissions'

const adminRolesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  search: z.string().optional().catch(''),
  team_id: z
    .union([z.enum(['null', 'not_null']), z.string()])
    .optional()
    .catch(''),
  is_default: z
    .union([z.enum(['true', 'false']), z.string()])
    .optional()
    .catch(''),
  sort_by: z.string().optional().catch(''),
  sort_order: z.enum(['asc', 'desc']).optional().catch('asc'),
})

export const Route = createFileRoute('/_authenticated/admin/roles/')({
  validateSearch: adminRolesSearchSchema,
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

    if (!me.user.permissions.includes(adminRolePermissions.list)) {
      throw redirect({ to: '/503' })
    }
  },
  component: AdminRoles,
})
