import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type AdminTeam } from '../api'
import { AdminTeamActionDialog } from './admin-team-action-dialog'

const MOCK_TEAM: AdminTeam = {
  id: 'team_uuid',
  name: 'My Team',
  created_by: 'user_uuid',
  created_at: '2026-01-01T10:30:00Z',
  updated_at: '2026-02-02T10:30:00Z',
}

const createAdminTeamMock = vi.fn()
const updateAdminTeamMock = vi.fn()

vi.mock('../hooks/use-admin-teams', () => ({
  useCreateAdminTeam: () => ({
    mutate: (...args: unknown[]) => createAdminTeamMock(...args),
    isPending: false,
  }),
  useUpdateAdminTeam: () => ({
    mutate: (...args: unknown[]) => updateAdminTeamMock(...args),
    isPending: false,
  }),
}))

const toastSuccess = vi.fn()
vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}))

vi.mock('@/lib/handle-server-error', () => ({ handleServerError: vi.fn() }))

describe('AdminTeamActionDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('add team', () => {
    it('renders title and description', async () => {
      const { getByRole, getByText } = await render(
        <AdminTeamActionDialog open onOpenChange={vi.fn()} />
      )

      const title = getByRole('heading', {
        level: 2,
        name: /Add New Team/i,
      })
      const description = getByText(
        /Create new team here. Click save when you're done./i
      )

      await expect.element(title).toBeInTheDocument()
      await expect.element(description).toBeInTheDocument()
    })

    it('shows a validation message when the name is empty', async () => {
      const { getByRole, getByText } = await render(
        <AdminTeamActionDialog open onOpenChange={vi.fn()} />
      )

      const submitButton = getByRole('button', { name: /Save Changes/i })
      await userEvent.click(submitButton)

      await expect
        .element(getByText('Team name is required.'))
        .toBeInTheDocument()
    })

    it('creates the team and shows a success toast on submit', async () => {
      createAdminTeamMock.mockImplementation(
        (_body, opts?: { onSuccess?: (data: { message: string }) => void }) =>
          opts?.onSuccess?.({ message: 'Team created successfully' })
      )

      const onOpenChange = vi.fn()
      const screen = await render(
        <AdminTeamActionDialog open onOpenChange={onOpenChange} />
      )

      await userEvent.fill(screen.getByLabelText(/^Name$/i), MOCK_TEAM.name)

      const submitButton = screen.getByRole('button', {
        name: /Save Changes/i,
      })
      await userEvent.click(submitButton)

      expect(createAdminTeamMock).toHaveBeenCalledOnce()
      expect(createAdminTeamMock).toHaveBeenCalledWith(
        { name: MOCK_TEAM.name },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
      expect(toastSuccess).toHaveBeenCalledWith('Team created successfully')
      expect(onOpenChange).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('edit team', () => {
    it('renders title with pre-filled name', async () => {
      const { getByRole, getByLabelText } = await render(
        <AdminTeamActionDialog
          open
          onOpenChange={vi.fn()}
          currentRow={MOCK_TEAM}
        />
      )

      const title = getByRole('heading', {
        level: 2,
        name: /Edit Team/i,
      })
      await expect.element(title).toBeInTheDocument()
      await expect.element(getByLabelText(/^Name$/i)).toHaveValue(
        MOCK_TEAM.name
      )
    })

    it('updates the team with the new name on submit', async () => {
      updateAdminTeamMock.mockImplementation(
        (_args, opts?: { onSuccess?: (data: { message: string }) => void }) =>
          opts?.onSuccess?.({ message: 'Team updated successfully' })
      )

      const onOpenChange = vi.fn()
      const screen = await render(
        <AdminTeamActionDialog
          open
          onOpenChange={onOpenChange}
          currentRow={MOCK_TEAM}
        />
      )

      await userEvent.fill(screen.getByLabelText(/^Name$/i), 'Updated Team')

      const submitButton = screen.getByRole('button', {
        name: /Save Changes/i,
      })
      await userEvent.click(submitButton)

      expect(updateAdminTeamMock).toHaveBeenCalledOnce()
      expect(updateAdminTeamMock).toHaveBeenCalledWith(
        { teamId: MOCK_TEAM.id, body: { name: 'Updated Team' } },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
      expect(toastSuccess).toHaveBeenCalledWith('Team updated successfully')
      expect(onOpenChange).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
