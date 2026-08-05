import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { AccountEmailForm } from './account-email-form'

const setUserMock = vi.fn()
const setQueryDataMock = vi.fn()
const updateEmailInitMock = vi.fn()
const updateEmailVerifyMock = vi.fn()
const handleServerErrorMock = vi.fn()

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    auth: {
      user: {
        id: 'uuid',
        name: 'John Doe',
        email: 'old@example.com',
        two_factor_enabled: false,
        permissions: ['post:read'],
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      setUser: setUserMock,
    },
  }),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ setQueryData: setQueryDataMock }),
}))

vi.mock('../api', () => ({
  updateEmailInit: (...args: unknown[]) => updateEmailInitMock(...args),
  updateEmailVerify: (...args: unknown[]) => updateEmailVerifyMock(...args),
}))

vi.mock('@/lib/handle-server-error', () => ({
  handleServerError: (...args: unknown[]) => handleServerErrorMock(...args),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/features/auth/api', () => ({ meQueryKey: ['me'] }))

describe('AccountEmailForm', () => {
  let screen: RenderResult
  let emailInput: Locator
  let sendButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()
    updateEmailInitMock.mockResolvedValue({ message: 'Code sent' })
    updateEmailVerifyMock.mockResolvedValue({
      message: 'Email updated successfully',
    })
    screen = await render(<AccountEmailForm />)
    emailInput = screen.getByLabelText(/^New email/i)
    sendButton = screen.getByRole('button', { name: /Send verification code/i })
  })

  it('updates the store and query cache with the new email on verify', async () => {
    await userEvent.fill(emailInput, 'new@example.com')
    await userEvent.fill(
      screen.getByLabelText(/^Password/i),
      'current-password'
    )
    await userEvent.click(sendButton)

    await vi.waitFor(() =>
      expect(updateEmailInitMock).toHaveBeenCalledWith({
        new_email: 'new@example.com',
        password: 'current-password',
      })
    )

    await userEvent.fill(
      screen.getByLabelText(/^Verification token/i),
      'a'.repeat(32)
    )
    await userEvent.click(screen.getByRole('button', { name: /Verify email/i }))

    await vi.waitFor(() =>
      expect(updateEmailVerifyMock).toHaveBeenCalledWith({
        token: 'a'.repeat(32),
      })
    )
    expect(setUserMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@example.com' })
    )
    expect(setQueryDataMock).toHaveBeenCalledWith(['me'], {
      user: expect.objectContaining({ email: 'new@example.com' }),
    })
  })

  it('rolls the store back to the previous email when verification fails', async () => {
    await userEvent.fill(emailInput, 'new@example.com')
    await userEvent.fill(
      screen.getByLabelText(/^Password/i),
      'current-password'
    )
    await userEvent.click(sendButton)

    await vi.waitFor(() => expect(updateEmailInitMock).toHaveBeenCalledOnce())

    updateEmailVerifyMock.mockRejectedValue(
      new Error('Invalid or expired verification token')
    )
    await userEvent.fill(
      screen.getByLabelText(/^Verification token/i),
      'a'.repeat(32)
    )
    await userEvent.click(screen.getByRole('button', { name: /Verify email/i }))

    await vi.waitFor(() => expect(handleServerErrorMock).toHaveBeenCalledOnce())
    expect(setUserMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ email: 'old@example.com' })
    )
    expect(setQueryDataMock).not.toHaveBeenCalled()
  })
})
