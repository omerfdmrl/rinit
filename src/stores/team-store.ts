import { create } from 'zustand'

export interface Team {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
}

interface TeamState {
  team: {
    current: Team | null
    setCurrent: (team: Team | null) => void
    reset: () => void
  }
}

export const useTeamStore = create<TeamState>()((set) => ({
  team: {
    current: null,
    setCurrent: (team) =>
      set((state) => ({ ...state, team: { ...state.team, current: team } })),
    reset: () =>
      set((state) => ({ ...state, team: { ...state.team, current: null } })),
  },
}))
