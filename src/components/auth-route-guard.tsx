import { useEffect } from 'react'
import { Outlet, useNavigate } from '@tanstack/react-router'
import { useUser } from '@/features/auth/hooks/use-user'

export function AuthRouteGuard() {
  const navigate = useNavigate()
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      navigate({ to: '/', replace: true })
    }
  }, [user, navigate])

  return <Outlet />
}
