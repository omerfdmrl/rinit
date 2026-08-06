import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type AdminRole } from '../../api'
import { AdminRoleActionDialog } from './admin-role-action-dialog'

const MOCK_ROLE: AdminRole = {
  id: 'editor_uuid',
  role_name: 'editor',
  team_id: null,
  is_default: false,
  description: 'Can edit content',
  created_at: '2026-01-01T10:30:00Z',
  updated_at: '2026-02-02T10:30:00Z',
}

const createAdminRoleMock = vi.fn()
const updateAdminRoleMock = vi.fn()

vi.mock('../../hooks/use-admin-roles', () => ({
  useCreateAdminRole: () => ({
    mutate: (...args: unknown[]) => createAdminRoleMock(...args),
    isPending: false,
  }),
  useUpdateAdminRole: () => ({
    mutate: (...args: unknown[]) => updateAdminRoleMock(...args),
    isPending: false,
  }),
}))

const toastSuccess = vi.fn()
vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}))

vi.mock('@/lib/handle-server-error', () => ({ handleServerError: vi.fn() }))

describe('AdminRoleActionDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('add role', () => {
    it('renders title and description', async () => {
      const { getByRole, getByText } = await render(
        <AdminRoleActionDialog open onOpenChange={vi.fn()} />
      )

      const title = getByRole('heading', {
        level: 2,
        name: /Add New Role/i,
      })
      const description = getByText(
        /Create new role here. Click save when you're done./i
      )

      await expect.element(title).toBeInTheDocument()
      await expect.element(description).toBeInTheDocument()
    })

    it('shows a validation message when the name is empty', async () => {
      const { getByRole, getByText } = await render(
        <AdminRoleActionDialog open onOpenChange={vi.fn()} />
      )

      const submitButton = getByRole('button', { name: /Save Changes/i })
      await userEvent.click(submitButton)

      await expect
        .element(getByText('Role name is required.'))
        .toBeInTheDocument()
    })

    it('creates the role and shows a success toast on submit', async () => {
      createAdminRoleMock.mockImplementation(
        (_body, opts?: { onSuccess?: (data: { message: string }) => void }) =>
          opts?.onSuccess?.({ message: 'Role created successfully' })
      )

      const onOpenChange = vi.fn()
      const screen = await render(
        <AdminRoleActionDialog open onOpenChange={onOpenChange} />
      )

      await userEvent.fill(
        screen.getByLabelText(/Role Name/i),
        MOCK_ROLE.role_name
      )
      await userEvent.fill(
        screen.getByLabelText(/Description/i),
        MOCK_ROLE.description
      )

      const submitButton = screen.getByRole('button', {
        name: /Save Changes/i,
      })
      await userEvent.click(submitButton)

      expect(createAdminRoleMock).toHaveBeenCalledOnce()
      expect(createAdminRoleMock).toHaveBeenCalledWith(
        { name: MOCK_ROLE.role_name, description: MOCK_ROLE.description },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
      expect(toastSuccess).toHaveBeenCalledWith('Role created successfully')
      expect(onOpenChange).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('edit role', () => {
    it('renders title with pre-filled values', async () => {
      const { getByRole, getByLabelText } = await render(
        <AdminRoleActionDialog
          open
          onOpenChange={vi.fn()}
          currentRow={MOCK_ROLE}
        />
      )

      const title = getByRole('heading', {
        level: 2,
        name: /Edit Role/i,
      })
      await expect.element(title).toBeInTheDocument()
      await expect.element(getByLabelText(/Role Name/i)).toHaveValue(
        MOCK_ROLE.role_name
      )
      await expect.element(getByLabelText(/Description/i)).toHaveValue(
        MOCK_ROLE.description
      )
    })

    it('updates the role with the new values on submit', async () => {
      updateAdminRoleMock.mockImplementation(
        (_args, opts?: { onSuccess?: (data: { message: string }) => void }) =>
          opts?.onSuccess?.({ message: 'Role updated successfully' })
      )

      const onOpenChange = vi.fn()
      const screen = await render(
        <AdminRoleActionDialog
          open
          onOpenChange={onOpenChange}
          currentRow={MOCK_ROLE}
        />
      )

      await userEvent.fill(screen.getByLabelText(/Role Name/i), 'super_admin')

      const submitButton = screen.getByRole('button', {
        name: /Save Changes/i,
      })
      await userEvent.click(submitButton)

      expect(updateAdminRoleMock).toHaveBeenCalledOnce()
      expect(updateAdminRoleMock).toHaveBeenCalledWith(
        {
          roleId: MOCK_ROLE.id,
          body: { name: 'super_admin', description: MOCK_ROLE.description },
        },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
      expect(toastSuccess).toHaveBeenCalledWith('Role updated successfully')
      expect(onOpenChange).toHaveBeenCalledOnce()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
