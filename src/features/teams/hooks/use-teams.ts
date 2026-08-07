import { useEffect } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { useTeamStore, type Team } from '@/stores/team-store'
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
  type MembersResponse,
  type TeamRoleWithPermissions,
} from '../api'

const TEAMS_STALE_TIME = 5 * 60 * 1000

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

export function useTeams(enabled: boolean) {
  return useQuery({
    queryKey: teamsQueryKey,
    queryFn: getTeams,
    enabled,
    staleTime: TEAMS_STALE_TIME,
  })
}

export function useCurrentTeam() {
  const currentTeam = useTeamStore((state) => state.team.current)
  const query = useQuery({
    queryKey: currentTeamQueryKey,
    queryFn: getCurrentTeam,
    retry: false,
    staleTime: TEAMS_STALE_TIME,
  })

  useEffect(() => {
    if (query.data && query.data.id !== currentTeam?.id) {
      useTeamStore.getState().team.setCurrent(query.data)
    }
  }, [query.data, currentTeam?.id])

  return {
    currentTeam,
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
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: teamsQueryKey })
      await queryClient.cancelQueries({ queryKey: currentTeamQueryKey })

      const previousTeams = queryClient.getQueryData<Team[]>(teamsQueryKey)
      const previousCurrent =
        queryClient.getQueryData<Team>(currentTeamQueryKey)
      const previousStore = useTeamStore.getState().team.current

      queryClient.setQueryData<Team[]>(teamsQueryKey, (old) =>
        old?.map((t) => (t.id === teamId ? { ...t, name: body.name } : t))
      )
      queryClient.setQueryData<Team>(currentTeamQueryKey, (old) =>
        old && old.id === teamId ? { ...old, name: body.name } : old
      )
      if (previousStore?.id === teamId) {
        useTeamStore.getState().team.setCurrent({
          ...previousStore,
          name: body.name,
        })
      }

      return { previousTeams, previousCurrent, previousStore }
    },
    onError: (_error, _body, context) => {
      if (context?.previousTeams) {
        queryClient.setQueryData(teamsQueryKey, context.previousTeams)
      }
      if (context?.previousCurrent) {
        queryClient.setQueryData(currentTeamQueryKey, context.previousCurrent)
      }
      if (context?.previousStore) {
        useTeamStore.getState().team.setCurrent(context.previousStore)
      }
    },
    onSuccess: (updatedTeam) => {
      queryClient.setQueryData(currentTeamQueryKey, updatedTeam)
      queryClient.setQueryData<Team[]>(teamsQueryKey, (old) =>
        old?.map((t) => (t.id === updatedTeam.id ? updatedTeam : t))
      )
      if (useTeamStore.getState().team.current?.id === updatedTeam.id) {
        useTeamStore.getState().team.setCurrent(updatedTeam)
      }
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
    onMutate: async (userId) => {
      const queryKey = [...teamMembersQueryKey, teamId]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<MembersResponse>(queryKey)

      queryClient.setQueryData<MembersResponse | undefined>(queryKey, (old) =>
        old
          ? {
              ...old,
              members: old.members.filter((m) => m.user_id !== userId),
            }
          : old
      )

      return { previous }
    },
    onError: (_error, _userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          [...teamMembersQueryKey, teamId],
          context.previous
        )
      }
    },
    onSettled: () => {
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
    onMutate: async ({ userId, role }) => {
      const queryKey = [...teamMembersQueryKey, teamId]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<MembersResponse>(queryKey)

      queryClient.setQueryData<MembersResponse | undefined>(queryKey, (old) =>
        old
          ? {
              ...old,
              members: old.members.map((m) =>
                m.user_id === userId ? { ...m, role } : m
              ),
            }
          : old
      )

      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          [...teamMembersQueryKey, teamId],
          context.previous
        )
      }
    },
    onSettled: () => {
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
    onMutate: async (body) => {
      const queryKey = [...teamRolesQueryKey, teamId]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<{
        roles: TeamRoleWithPermissions[]
      }>(queryKey)

      queryClient.setQueryData<
        { roles: TeamRoleWithPermissions[] } | undefined
      >(queryKey, (old) =>
        old
          ? {
              roles: [
                ...old.roles,
                {
                  role: {
                    id: `pending-${Date.now()}`,
                    role_name: body.name,
                    team_id: teamId,
                    is_default: false,
                    description: body.description ?? '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  permissions: [],
                },
              ],
            }
          : old
      )

      return { previous }
    },
    onError: (_error, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          [...teamRolesQueryKey, teamId],
          context.previous
        )
      }
    },
    onSettled: () => {
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
    onMutate: async ({ roleId, body }) => {
      const queryKey = [...teamRolesQueryKey, teamId]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<{
        roles: TeamRoleWithPermissions[]
      }>(queryKey)

      queryClient.setQueryData<
        { roles: TeamRoleWithPermissions[] } | undefined
      >(queryKey, (old) =>
        old
          ? {
              roles: old.roles.map((r) =>
                r.role.id === roleId
                  ? {
                      ...r,
                      role: {
                        ...r.role,
                        ...(body.name !== undefined
                          ? { role_name: body.name }
                          : {}),
                        ...(body.description !== undefined
                          ? { description: body.description }
                          : {}),
                      },
                    }
                  : r
              ),
            }
          : old
      )

      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          [...teamRolesQueryKey, teamId],
          context.previous
        )
      }
    },
    onSettled: () => {
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
    onMutate: async (roleId) => {
      const queryKey = [...teamRolesQueryKey, teamId]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<{
        roles: TeamRoleWithPermissions[]
      }>(queryKey)

      queryClient.setQueryData<
        { roles: TeamRoleWithPermissions[] } | undefined
      >(queryKey, (old) =>
        old
          ? {
              roles: old.roles.filter((r) => r.role.id !== roleId),
            }
          : old
      )

      return { previous }
    },
    onError: (_error, _roleId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          [...teamRolesQueryKey, teamId],
          context.previous
        )
      }
    },
    onSettled: () => {
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
