import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type AdminTeam, type AdminTeamUser } from '../api'
import { AdminTeamMembersDialog } from './admin-team-members-dialog'

const MOCK_TEAM: AdminTeam = {
  id: 1,
  name: 'My Team',
  created_by: 1,
  created_at: '2026-01-01T10:30:00Z',
  updated_at: '2026-02-02T10:30:00Z',
}

const OWNER: AdminTeamUser = {
  id: 2,
  team_id: MOCK_TEAM.id,
  user_id: 3,
  role: 'owner',
  created_at: '2026-01-01T10:30:00Z',
}

const MEMBER: AdminTeamUser = {
  id: 4,
  team_id: MOCK_TEAM.id,
  user_id: 5,
  role: 'member',
  created_at: '2026-01-15T10:30:00Z',
}

const getTeamUsersMock = vi.fn()

vi.mock('../hooks/use-admin-teams', () => ({
  useAdminTeamUsers: (teamId: number, params?: { role?: string }) =>
    getTeamUsersMock(teamId, params),
}))

describe('AdminTeamMembersDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the team name and lists its members', async () => {
    getTeamUsersMock.mockReturnValue({
      data: {
        users: [OWNER, MEMBER],
        pagination: { page: 1, per_page: 20, total: 2, total_pages: 1 },
      },
      isLoading: false,
    })

    const { getByRole, getByText } = await render(
      <AdminTeamMembersDialog open onOpenChange={vi.fn()} team={MOCK_TEAM} />
    )

    const title = getByRole('heading', {
      level: 2,
      name: /Team Members/i,
    })
    await expect.element(title).toBeInTheDocument()
    await expect
      .element(getByText(new RegExp(MOCK_TEAM.name, 'i')))
      .toBeInTheDocument()
    await expect
      .element(getByText('3', { exact: true }))
      .toBeInTheDocument()
    await expect
      .element(getByText('5', { exact: true }))
      .toBeInTheDocument()
    await expect.element(getByText('owner', { exact: true })).toBeInTheDocument()
  })

  it('filters members by role', async () => {
    getTeamUsersMock.mockReturnValue({
      data: {
        users: [OWNER],
        pagination: { page: 1, per_page: 20, total: 1, total_pages: 1 },
      },
      isLoading: false,
    })

    const { getByRole } = await render(
      <AdminTeamMembersDialog open onOpenChange={vi.fn()} team={MOCK_TEAM} />
    )

    const roleSelect = getByRole('combobox', { name: /Filter by role/i })
    await userEvent.click(roleSelect)
    await userEvent.click(getByRole('option', { name: 'Owner' }))

    expect(getTeamUsersMock).toHaveBeenCalledWith(MOCK_TEAM.id, {
      page: 1,
      per_page: 20,
      role: 'owner',
    })
  })

  it('shows an empty state when the team has no members', async () => {
    getTeamUsersMock.mockReturnValue({
      data: {
        users: [],
        pagination: { page: 1, per_page: 20, total: 0, total_pages: 1 },
      },
      isLoading: false,
    })

    const { getByText } = await render(
      <AdminTeamMembersDialog open onOpenChange={vi.fn()} team={MOCK_TEAM} />
    )

    await expect.element(getByText('No members found.')).toBeInTheDocument()
  })
})
