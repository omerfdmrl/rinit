import { useEffect } from 'react'
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useUser } from '@/features/auth/hooks/use-user'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/(auth)')({
  beforeLoad: () => {
    // Already authenticated users should not visit auth pages
    if (useAuthStore.getState().auth.user) {
      throw redirect({ to: '/' })
    }
  },
  component: AuthRouteGuard,
})

function AuthRouteGuard() {
  const navigate = useNavigate()
  const { user } = useUser()

  useEffect(() => {
    // /me can resolve after the route loaded (e.g. valid session on page
    // load) - redirect back to the app in that case
    if (user) {
      navigate({ to: '/', replace: true })
    }
  }, [user, navigate])

  return <Outlet />
}