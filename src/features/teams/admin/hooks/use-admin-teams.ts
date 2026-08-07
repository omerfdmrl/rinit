import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminTeamUsersQueryKey,
  adminTeamsQueryKey,
  createAdminTeam,
  deleteAdminTeam,
  getAdminTeams,
  getAdminTeamUsers,
  updateAdminTeam,
  type AdminTeamsListParams,
  type AdminTeamUsersListParams,
} from '../api'

export function useAdminTeams(params?: AdminTeamsListParams) {
  return useQuery({
    queryKey: [...adminTeamsQueryKey, params],
    queryFn: () => getAdminTeams(params),
  })
}

export function useCreateAdminTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { name: string }) => createAdminTeam(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTeamsQueryKey })
    },
  })
}

export function useUpdateAdminTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      body,
    }: {
      teamId: number
      body: { name: string }
    }) => updateAdminTeam(teamId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTeamsQueryKey })
    },
  })
}

export function useDeleteAdminTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (teamId: number) => deleteAdminTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTeamsQueryKey })
    },
  })
}

export function useAdminTeamUsers(
  teamId: number,
  params?: AdminTeamUsersListParams
) {
  return useQuery({
    queryKey: [...adminTeamUsersQueryKey(teamId), params],
    queryFn: () => getAdminTeamUsers(teamId, params),
    enabled: !!teamId,
  })
}
