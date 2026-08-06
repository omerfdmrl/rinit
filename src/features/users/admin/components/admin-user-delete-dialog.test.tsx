import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type AdminUser } from '../../api'
import { AdminUserDeleteDialog } from './admin-user-delete-dialog'

const MOCK_USER: AdminUser = {
  id: 'user-delete-test',
  name: 'John Doe',
  email: 'johndoe@shadcn-admin.com',
  role: 'admin',
  two_factor_enabled: false,
  created_at: '2026-01-01T10:30:00Z',
  updated_at: '2026-02-02T10:30:00Z',
}

const deleteAdminUserMock = vi.fn()

vi.mock('../../hooks/use-admin-users', () => ({
  useDeleteAdminUser: () => ({
    mutate: (...args: unknown[]) => deleteAdminUserMock(...args),
    isPending: false,
  }),
}))

const toastSuccess = vi.fn()
vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}))

vi.mock('@/lib/handle-server-error', () => ({ handleServerError: vi.fn() }))

describe('AdminUserDeleteDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the dialog with the correct title, description, input and buttons', async () => {
    const { getByText, getByRole } = await render(
      <AdminUserDeleteDialog
        open
        onOpenChange={vi.fn()}
        currentRow={MOCK_USER}
      />
    )

    const title = getByRole('heading', {
      level: 2,
      name: /Delete User/i,
    })
    const desc = getByText(
      new RegExp(`Are you sure you want to delete ${MOCK_USER.name}?`, 'i')
    )
    const nameInput = getByRole('textbox', { name: /Name/i })
    const cancelButton = getByRole('button', { name: /Cancel/i })
    const deleteButton = getByRole('button', { name: /Delete/i })

    await expect.element(title).toBeInTheDocument()
    await expect.element(desc).toBeInTheDocument()
    await expect.element(nameInput).toBeInTheDocument()
    await expect.element(cancelButton).toBeInTheDocument()
    await expect.element(deleteButton).toBeInTheDocument()
    await expect.element(deleteButton).toBeDisabled()
  })

  it('keeps the delete button disabled until the name input is filled correctly', async () => {
    const { getByRole } = await render(
      <AdminUserDeleteDialog
        open
        onOpenChange={vi.fn()}
        currentRow={MOCK_USER}
      />
    )

    const nameInput = getByRole('textbox', { name: /Name/i })
    const deleteButton = getByRole('button', { name: /Delete/i })

    await expect.element(deleteButton).toBeDisabled()

    await userEvent.fill(nameInput, 'wrong-name')
    await expect.element(deleteButton).toBeDisabled()

    await userEvent.fill(nameInput, MOCK_USER.name)
    await expect.element(deleteButton).toBeEnabled()
  })

  it('closes the dialog when the cancel button is clicked', async () => {
    const onOpenChange = vi.fn()
    const { getByRole } = await render(
      <AdminUserDeleteDialog
        open
        onOpenChange={onOpenChange}
        currentRow={MOCK_USER}
      />
    )

    const cancelButton = getByRole('button', { name: /Cancel/i })
    await userEvent.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('deletes the user and shows a success toast when confirmed', async () => {
    deleteAdminUserMock.mockImplementation(
      (_userId, opts?: { onSuccess?: (data: { message: string }) => void }) =>
        opts?.onSuccess?.({ message: 'User deleted successfully' })
    )

    const onOpenChange = vi.fn()
    const { getByRole } = await render(
      <AdminUserDeleteDialog
        open
        onOpenChange={onOpenChange}
        currentRow={MOCK_USER}
      />
    )

    const nameInput = getByRole('textbox', { name: /Name/i })
    const deleteButton = getByRole('button', { name: /Delete/i })

    await userEvent.fill(nameInput, MOCK_USER.name)
    await userEvent.click(deleteButton)

    expect(deleteAdminUserMock).toHaveBeenCalledOnce()
    expect(deleteAdminUserMock).toHaveBeenCalledWith(
      MOCK_USER.id,
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
    expect(toastSuccess).toHaveBeenCalledWith('User deleted successfully')
    expect(onOpenChange).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
