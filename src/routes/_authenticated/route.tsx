import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { getMe, meQueryKey } from '@/features/auth/api'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    // If the store already has a user (e.g. just logged in/registered),
    // skip the /me request
    if (useAuthStore.getState().auth.user) {
      return
    }

    try {
      await context.queryClient.fetchQuery({
        queryKey: meQueryKey,
        queryFn: getMe,
        retry: false,
        staleTime: 0,
      })
    } catch {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})
