import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type AdminTeam } from '../api'
import { AdminTeamDeleteDialog } from './admin-team-delete-dialog'

const MOCK_TEAM: AdminTeam = {
  id: 1,
  name: 'My Team',
  created_by: 1,
  created_at: '2026-01-01T10:30:00Z',
  updated_at: '2026-02-02T10:30:00Z',
}

const deleteAdminTeamMock = vi.fn()

vi.mock('../hooks/use-admin-teams', () => ({
  useDeleteAdminTeam: () => ({
    mutate: (...args: unknown[]) => deleteAdminTeamMock(...args),
    isPending: false,
  }),
}))

const toastSuccess = vi.fn()
vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}))

vi.mock('@/lib/handle-server-error', () => ({ handleServerError: vi.fn() }))

describe('AdminTeamDeleteDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the dialog with the correct title, description, input and buttons', async () => {
    const { getByText, getByRole } = await render(
      <AdminTeamDeleteDialog open onOpenChange={vi.fn()} currentRow={MOCK_TEAM} />
    )

    const title = getByRole('heading', {
      level: 2,
      name: /Delete Team/i,
    })
    const desc = getByText(
      new RegExp(`Are you sure you want to delete the team ${MOCK_TEAM.name}?`, 'i')
    )
    const nameInput = getByRole('textbox', { name: /Team name/i })
    const deleteButton = getByRole('button', { name: /Delete/i })

    await expect.element(title).toBeInTheDocument()
    await expect.element(desc).toBeInTheDocument()
    await expect.element(nameInput).toBeInTheDocument()
    await expect.element(deleteButton).toBeDisabled()
  })

  it('keeps the delete button disabled until the team name is typed correctly', async () => {
    const { getByRole } = await render(
      <AdminTeamDeleteDialog open onOpenChange={vi.fn()} currentRow={MOCK_TEAM} />
    )

    const nameInput = getByRole('textbox', { name: /Team name/i })
    const deleteButton = getByRole('button', { name: /Delete/i })

    await userEvent.fill(nameInput, 'wrong-name')
    await expect.element(deleteButton).toBeDisabled()

    await userEvent.fill(nameInput, MOCK_TEAM.name)
    await expect.element(deleteButton).toBeEnabled()
  })

  it('deletes the team and shows a success toast when confirmed', async () => {
    deleteAdminTeamMock.mockImplementation(
      (_teamId, opts?: { onSuccess?: (data: { message: string }) => void }) =>
        opts?.onSuccess?.({ message: 'Team deleted successfully' })
    )

    const onOpenChange = vi.fn()
    const { getByRole } = await render(
      <AdminTeamDeleteDialog
        open
        onOpenChange={onOpenChange}
        currentRow={MOCK_TEAM}
      />
    )

    const nameInput = getByRole('textbox', { name: /Team name/i })
    const deleteButton = getByRole('button', { name: /Delete/i })

    await userEvent.fill(nameInput, MOCK_TEAM.name)
    await userEvent.click(deleteButton)

    expect(deleteAdminTeamMock).toHaveBeenCalledOnce()
    expect(deleteAdminTeamMock).toHaveBeenCalledWith(
      MOCK_TEAM.id,
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
    expect(toastSuccess).toHaveBeenCalledWith('Team deleted successfully')
    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
