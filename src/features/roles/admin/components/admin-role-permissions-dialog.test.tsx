import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type AdminPermission, type AdminRole } from '../../api'
import { AdminRolePermissionsDialog } from './admin-role-permissions-dialog'

const MOCK_ROLE: AdminRole = {
  id: 'admin_uuid',
  role_name: 'admin',
  team_id: null,
  is_default: false,
  description: 'Administrator',
  created_at: '2026-01-01T10:30:00Z',
  updated_at: '2026-02-02T10:30:00Z',
}

const USER_LIST_PERMISSION: AdminPermission = {
  id: 'perm-users-list',
  permission_key: 'users.list',
  description: 'List users',
  is_system: true,
  is_assignable: true,
  created_at: '2026-01-01T10:30:00Z',
}

const TEAM_LIST_PERMISSION: AdminPermission = {
  id: 'perm-teams-list',
  permission_key: 'teams.members.list',
  description: 'List team members',
  is_system: false,
  is_assignable: true,
  created_at: '2026-01-01T10:30:00Z',
}

const assignRolePermissionMock = vi.fn()
const removeRolePermissionMock = vi.fn()

vi.mock('../../hooks/use-admin-roles', () => ({
  useRolePermissions: () => ({
    data: { role: MOCK_ROLE, permissions: [USER_LIST_PERMISSION] },
    isLoading: false,
  }),
  useAdminPermissions: () => ({
    data: {
      permissions: [USER_LIST_PERMISSION, TEAM_LIST_PERMISSION],
      pagination: { page: 1, per_page: 100, total: 2, total_pages: 1 },
    },
    isLoading: false,
  }),
  useAssignRolePermission: () => ({
    mutate: (...args: unknown[]) => assignRolePermissionMock(...args),
    isPending: false,
  }),
  useRemoveRolePermission: () => ({
    mutate: (...args: unknown[]) => removeRolePermissionMock(...args),
    isPending: false,
  }),
}))

vi.mock('../../hooks/use-admin-permissions', () => ({
  useAdminRolePermissions: () => ({
    canList: true,
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canListPermissions: true,
    canViewPermissions: true,
    canCreatePermissions: true,
    canUpdatePermissions: true,
  }),
}))

const toastSuccess = vi.fn()
vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}))

vi.mock('@/lib/handle-server-error', () => ({ handleServerError: vi.fn() }))

describe('AdminRolePermissionsDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the role name and lists all permissions with the assigned one checked', async () => {
    const { getByRole, getByText } = await render(
      <AdminRolePermissionsDialog
        open
        onOpenChange={vi.fn()}
        role={MOCK_ROLE}
      />
    )

    const title = getByRole('heading', {
      level: 2,
      name: /Manage Permissions/i,
    })
    await expect.element(title).toBeInTheDocument()
    await expect
      .element(getByText(new RegExp(MOCK_ROLE.role_name, 'i')))
      .toBeInTheDocument()

    const usersCheckbox = getByRole('checkbox', {
      name: USER_LIST_PERMISSION.permission_key,
    })
    const teamsCheckbox = getByRole('checkbox', {
      name: TEAM_LIST_PERMISSION.permission_key,
    })
    await expect.element(usersCheckbox).toBeChecked()
    await expect.element(teamsCheckbox).not.toBeChecked()
  })

  it('assigns a permission when an unchecked permission is toggled', async () => {
    assignRolePermissionMock.mockImplementation(
      (_permissionId, opts?: { onSuccess?: (data: { message: string }) => void }) =>
        opts?.onSuccess?.({ message: 'Permission assigned successfully' })
    )

    const { getByRole } = await render(
      <AdminRolePermissionsDialog
        open
        onOpenChange={vi.fn()}
        role={MOCK_ROLE}
      />
    )

    const teamsCheckbox = getByRole('checkbox', {
      name: TEAM_LIST_PERMISSION.permission_key,
    })
    await userEvent.click(teamsCheckbox)

    expect(assignRolePermissionMock).toHaveBeenCalledOnce()
    expect(assignRolePermissionMock).toHaveBeenCalledWith(
      TEAM_LIST_PERMISSION.id,
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
    expect(toastSuccess).toHaveBeenCalledWith(
      'Permission assigned successfully'
    )
  })

  it('removes a permission when an assigned permission is toggled off', async () => {
    removeRolePermissionMock.mockImplementation(
      (_permissionId, opts?: { onSuccess?: (data: { message: string }) => void }) =>
        opts?.onSuccess?.({ message: 'Permission removed successfully' })
    )

    const { getByRole } = await render(
      <AdminRolePermissionsDialog
        open
        onOpenChange={vi.fn()}
        role={MOCK_ROLE}
      />
    )

    const usersCheckbox = getByRole('checkbox', {
      name: USER_LIST_PERMISSION.permission_key,
    })
    await userEvent.click(usersCheckbox)

    expect(removeRolePermissionMock).toHaveBeenCalledOnce()
    expect(removeRolePermissionMock).toHaveBeenCalledWith(
      USER_LIST_PERMISSION.id,
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
    expect(toastSuccess).toHaveBeenCalledWith('Permission removed successfully')
  })

  it('filters the permission list when searching', async () => {
    const { getByRole, getByText } = await render(
      <AdminRolePermissionsDialog
        open
        onOpenChange={vi.fn()}
        role={MOCK_ROLE}
      />
    )

    const searchInput = getByRole('textbox', {
      name: /Filter permissions/i,
    })
    await userEvent.fill(searchInput, 'teams')

    await expect
      .element(getByText(TEAM_LIST_PERMISSION.permission_key))
      .toBeInTheDocument()
    await expect
      .element(getByText(USER_LIST_PERMISSION.permission_key))
      .not.toBeInTheDocument()
  })
})
