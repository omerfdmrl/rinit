import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type AdminUser } from '../../api'
import { AdminUserActionDialog } from './admin-user-action-dialog'

const MOCK_USER: AdminUser = {
  id: 1,
  name: 'Alex Smith',
  email: 'alex@smith.com',
  two_factor_enabled: false,
  created_at: '2026-01-01T10:30:00Z',
  updated_at: '2026-02-02T10:30:00Z',
}

const createAdminUserMock = vi.fn()
const updateAdminUserMock = vi.fn()

vi.mock('../../hooks/use-admin-users', () => ({
  useCreateAdminUser: () => ({
    mutate: (...args: unknown[]) => createAdminUserMock(...args),
    isPending: false,
  }),
  useUpdateAdminUser: () => ({
    mutate: (...args: unknown[]) => updateAdminUserMock(...args),
    isPending: false,
  }),
}))

const toastSuccess = vi.fn()
vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}))

vi.mock('@/lib/handle-server-error', () => ({ handleServerError: vi.fn() }))

describe('AdminUserActionDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('add user', () => {
    it('renders title and description', async () => {
      const { getByRole, getByText } = await render(
        <AdminUserActionDialog open onOpenChange={vi.fn()} />
      )

      const title = getByRole('heading', {
        level: 2,
        name: /Add New User/i,
      })
      const description = getByText(
        /Create new user here. Click save when you're done./i
      )

      await expect.element(title).toBeInTheDocument()
      await expect.element(description).toBeInTheDocument()
    })

    it('shows validation messages when the form is submitted with empty fields', async () => {
      const { getByRole, getByText } = await render(
        <AdminUserActionDialog open onOpenChange={vi.fn()} />
      )

      const submitButton = getByRole('button', { name: /Save Changes/i })
      await userEvent.click(submitButton)

      await expect.element(getByText('Name is required.')).toBeInTheDocument()
      await expect.element(getByText('Email is required.')).toBeInTheDocument()
    })

    it('creates the user and shows a success toast on submit', async () => {
      createAdminUserMock.mockImplementation(
        (_body, opts?: { onSuccess?: (data: { message: string }) => void }) =>
          opts?.onSuccess?.({
            message:
              'User created successfully. A password reset email has been sent.',
          })
      )

      const onOpenChange = vi.fn()
      const screen = await render(
        <AdminUserActionDialog open onOpenChange={onOpenChange} />
      )

      await userEvent.fill(screen.getByLabelText(/^Name$/i), MOCK_USER.name)
      await userEvent.fill(screen.getByLabelText(/^Email$/i), MOCK_USER.email)

      const submitButton = screen.getByRole('button', { name: /Save Changes/i })
      await userEvent.click(submitButton)

      expect(createAdminUserMock).toHaveBeenCalledOnce()
      expect(createAdminUserMock).toHaveBeenCalledWith(
        { name: MOCK_USER.name, email: MOCK_USER.email },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
      expect(toastSuccess).toHaveBeenCalledWith(
        'User created successfully. A password reset email has been sent.'
      )
      expect(onOpenChange).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('edit user', () => {
    it('renders title and description with pre-filled values', async () => {
      const { getByRole, getByText, getByLabelText } = await render(
        <AdminUserActionDialog
          open
          onOpenChange={vi.fn()}
          currentRow={MOCK_USER}
        />
      )

      const title = getByRole('heading', {
        level: 2,
        name: /Edit User/i,
      })
      const description = getByText(
        /Update the user here. Click save when you're done./i
      )

      await expect.element(title).toBeInTheDocument()
      await expect.element(description).toBeInTheDocument()
      await expect
        .element(getByLabelText(/^Name$/i))
        .toHaveValue(MOCK_USER.name)
      await expect
        .element(getByLabelText(/^Email$/i))
        .toHaveValue(MOCK_USER.email)
    })

    it('updates the user with the new values on submit', async () => {
      updateAdminUserMock.mockImplementation(
        (_args, opts?: { onSuccess?: (data: { message: string }) => void }) =>
          opts?.onSuccess?.({ message: 'User updated successfully' })
      )

      const onOpenChange = vi.fn()
      const screen = await render(
        <AdminUserActionDialog
          open
          onOpenChange={onOpenChange}
          currentRow={MOCK_USER}
        />
      )

      await userEvent.fill(screen.getByLabelText(/^Name$/i), 'John Smith')

      const submitButton = screen.getByRole('button', { name: /Save Changes/i })
      await userEvent.click(submitButton)

      expect(updateAdminUserMock).toHaveBeenCalledOnce()
      expect(updateAdminUserMock).toHaveBeenCalledWith(
        {
          userId: MOCK_USER.id,
          body: { name: 'John Smith', email: MOCK_USER.email },
        },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
      expect(toastSuccess).toHaveBeenCalledWith('User updated successfully')
      expect(onOpenChange).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
