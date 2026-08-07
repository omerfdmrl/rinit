import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { getMe, meQueryKey } from '../api'

export function useUser() {
  const user = useAuthStore((state) => state.auth.user)
  const query = useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: !user,
  })

  useEffect(() => {
    if (query.data && !user) {
      useAuthStore.getState().auth.setUser(query.data.user)
    }
  }, [query.data, user])

  return {
    user,
    isAuthenticated: !!user,
    isLoading: query.isLoading,
    isPending: query.isPending,
    refetch: query.refetch,
  }
}
