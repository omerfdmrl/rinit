import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { useTeamStore } from '@/stores/team-store'
import { getMe, meQueryKey } from '@/features/auth/api'
import {
  getTeams,
  getCurrentTeam,
  createTeam,
  switchTeam,
  updateTeam,
  getTeamMembers,
  removeTeamMember,
  assignMemberRole,
  getTeamRoles,
  createTeamRole,
  updateTeamRole,
  deleteTeamRole,
  getTeamPermissions,
  inviteTeamMember,
  teamsQueryKey,
  currentTeamQueryKey,
  teamMembersQueryKey,
  teamRolesQueryKey,
  teamPermissionsQueryKey,
} from '../api'

async function refreshUser(queryClient: QueryClient) {
  try {
    const user = await queryClient.fetchQuery({
      queryKey: meQueryKey,
      queryFn: getMe,
      staleTime: 0,
    })
    useAuthStore.getState().auth.setUser(user.user)
  } catch {
    // keep the existing user if the refresh fails
  }
}

export function useTeams() {
  return useQuery({
    queryKey: teamsQueryKey,
    queryFn: getTeams,
  })
}

export function useCurrentTeam() {
  const { team } = useTeamStore()
  const query = useQuery({
    queryKey: currentTeamQueryKey,
    queryFn: getCurrentTeam,
    retry: false,
    staleTime: 0,
  })

  if (query.data && !team.current) {
    team.setCurrent(query.data)
  }

  return {
    currentTeam: team.current,
    isLoading: query.isLoading,
    isPending: query.isPending,
    refetch: query.refetch,
  }
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  const { team } = useTeamStore()

  return useMutation({
    mutationFn: createTeam,
    onSuccess: async (newTeam) => {
      team.setCurrent(newTeam)
      queryClient.invalidateQueries({ queryKey: teamsQueryKey })
      queryClient.setQueryData(currentTeamQueryKey, newTeam)
      await refreshUser(queryClient)
    },
  })
}

export function useSwitchTeam() {
  const queryClient = useQueryClient()
  const { team } = useTeamStore()

  return useMutation({
    mutationFn: switchTeam,
    onSuccess: async (switchedTeam) => {
      team.setCurrent(switchedTeam)
      queryClient.setQueryData(currentTeamQueryKey, switchedTeam)
      await refreshUser(queryClient)
    },
  })
}

export function useUpdateTeam(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { name: string }) => updateTeam(teamId, body),
    onSuccess: (updatedTeam) => {
      queryClient.setQueryData(currentTeamQueryKey, updatedTeam)
      queryClient.invalidateQueries({ queryKey: teamsQueryKey })
    },
  })
}

export function useTeamMembers(
  teamId: string,
  params?: { page?: number; per_page?: number; role?: string }
) {
  return useQuery({
    queryKey: [...teamMembersQueryKey, teamId, params],
    queryFn: () => getTeamMembers(teamId, params),
    enabled: !!teamId,
  })
}

export function useRemoveTeamMember(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => removeTeamMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...teamMembersQueryKey, teamId],
      })
    },
  })
}

export function useAssignMemberRole(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      assignMemberRole(teamId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...teamMembersQueryKey, teamId],
      })
    },
  })
}

export function useTeamRoles(teamId: string) {
  return useQuery({
    queryKey: [...teamRolesQueryKey, teamId],
    queryFn: () => getTeamRoles(teamId),
    enabled: !!teamId,
  })
}

export function useCreateTeamRole(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: {
      name: string
      description?: string
      permission_keys?: string[]
    }) => createTeamRole(teamId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...teamRolesQueryKey, teamId],
      })
    },
  })
}

export function useUpdateTeamRole(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      roleId,
      body,
    }: {
      roleId: string
      body: { name?: string; description?: string; permission_keys?: string[] }
    }) => updateTeamRole(teamId, roleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...teamRolesQueryKey, teamId],
      })
    },
  })
}

export function useDeleteTeamRole(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roleId: string) => deleteTeamRole(teamId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...teamRolesQueryKey, teamId],
      })
    },
  })
}

export function useTeamPermissions(teamId: string) {
  return useQuery({
    queryKey: [...teamPermissionsQueryKey, teamId],
    queryFn: () => getTeamPermissions(teamId),
    enabled: !!teamId,
  })
}

export function useInviteTeamMember(teamId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { email: string; role?: string }) =>
      inviteTeamMember(teamId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...teamMembersQueryKey, teamId],
      })
    },
  })
}
