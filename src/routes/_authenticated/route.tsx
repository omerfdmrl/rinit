import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { getMe, meQueryKey } from '@/features/auth/api'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    // If the store already has a user (e.g. just logged in/registered),
    // skip the /me request
    if (useAuthStore.getState().auth.user) {
      return
    }

    try {
      const result = await context.queryClient.fetchQuery({
        queryKey: meQueryKey,
        queryFn: getMe,
        retry: false,
        staleTime: 5 * 60 * 1000,
      })
      useAuthStore.getState().auth.setUser(result.user)
    } catch {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})
