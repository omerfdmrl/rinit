import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { getMe, meQueryKey } from '../api'

export function useUser() {
  const { auth } = useAuthStore()
  const query = useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
    retry: false,
    staleTime: 0,
    enabled: !auth.user,
  })

  if (query.data && !auth.user) {
    auth.setUser(query.data.user)
  }

  return {
    user: auth.user,
    isAuthenticated: !!auth.user,
    isLoading: query.isLoading,
    isPending: query.isPending,
    refetch: query.refetch,
  }
}
