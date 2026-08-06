import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type AdminRole } from '../../api'
import { AdminRoleDeleteDialog } from './admin-role-delete-dialog'

const MOCK_ROLE: AdminRole = {
  id: 'role-delete-test',
  role_name: 'editor',
  team_id: null,
  is_default: false,
  description: 'Can edit content',
  created_at: '2026-01-01T10:30:00Z',
  updated_at: '2026-02-02T10:30:00Z',
}

const deleteAdminRoleMock = vi.fn()

vi.mock('../../hooks/use-admin-roles', () => ({
  useDeleteAdminRole: () => ({
    mutate: (...args: unknown[]) => deleteAdminRoleMock(...args),
    isPending: false,
  }),
}))

const toastSuccess = vi.fn()
vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}))

vi.mock('@/lib/handle-server-error', () => ({ handleServerError: vi.fn() }))

describe('AdminRoleDeleteDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the dialog with the correct title, description, input and buttons', async () => {
    const { getByText, getByRole } = await render(
      <AdminRoleDeleteDialog open onOpenChange={vi.fn()} currentRow={MOCK_ROLE} />
    )

    const title = getByRole('heading', {
      level: 2,
      name: /Delete Role/i,
    })
    const desc = getByText(
      new RegExp(
        `Are you sure you want to delete the role ${MOCK_ROLE.role_name}?`,
        'i'
      )
    )
    const nameInput = getByRole('textbox', { name: /Role name/i })
    const deleteButton = getByRole('button', { name: /Delete/i })

    await expect.element(title).toBeInTheDocument()
    await expect.element(desc).toBeInTheDocument()
    await expect.element(nameInput).toBeInTheDocument()
    await expect.element(deleteButton).toBeDisabled()
  })

  it('keeps the delete button disabled until the role name is typed correctly', async () => {
    const { getByRole } = await render(
      <AdminRoleDeleteDialog open onOpenChange={vi.fn()} currentRow={MOCK_ROLE} />
    )

    const nameInput = getByRole('textbox', { name: /Role name/i })
    const deleteButton = getByRole('button', { name: /Delete/i })

    await userEvent.fill(nameInput, 'wrong-name')
    await expect.element(deleteButton).toBeDisabled()

    await userEvent.fill(nameInput, MOCK_ROLE.role_name)
    await expect.element(deleteButton).toBeEnabled()
  })

  it('deletes the role and shows a success toast when confirmed', async () => {
    deleteAdminRoleMock.mockImplementation(
      (_roleId, opts?: { onSuccess?: (data: { message: string }) => void }) =>
        opts?.onSuccess?.({ message: 'Role deleted successfully' })
    )

    const onOpenChange = vi.fn()
    const { getByRole } = await render(
      <AdminRoleDeleteDialog
        open
        onOpenChange={onOpenChange}
        currentRow={MOCK_ROLE}
      />
    )

    const nameInput = getByRole('textbox', { name: /Role name/i })
    const deleteButton = getByRole('button', { name: /Delete/i })

    await userEvent.fill(nameInput, MOCK_ROLE.role_name)
    await userEvent.click(deleteButton)

    expect(deleteAdminRoleMock).toHaveBeenCalledOnce()
    expect(deleteAdminRoleMock).toHaveBeenCalledWith(
      MOCK_ROLE.id,
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
    expect(toastSuccess).toHaveBeenCalledWith('Role deleted successfully')
    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
