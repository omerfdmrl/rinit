import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent, type Locator } from 'vitest/browser'
import { ResetPasswordForm } from './reset-password-form'

const navigate = vi.fn()
const resetPasswordMock = vi.fn()
const handleServerErrorMock = vi.fn()
const toastSuccess = vi.fn()
const toastError = vi.fn()

vi.mock('@/features/auth/api', () => ({
  resetPassword: (...args: unknown[]) => resetPasswordMock(...args),
}))

vi.mock('@/lib/handle-server-error', () => ({
  handleServerError: (...args: unknown[]) => handleServerErrorMock(...args),
}))

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}))

vi.mock('@tanstack/react-router', async (orig) => {
  const actual = await orig<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
    useSearch: () => ({ token: 'reset-token-value' }),
  }
})

describe('ResetPasswordForm', () => {
  let screen: RenderResult
  let passwordInput: Locator
  let confirmPasswordInput: Locator
  let submitButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()
    screen = await render(<ResetPasswordForm />)
    passwordInput = screen.getByLabelText(/^New Password$/i)
    confirmPasswordInput = screen.getByLabelText(/^Confirm Password$/i)
    submitButton = screen.getByRole('button', { name: /^Reset Password$/i })
  })

  it('renders password fields and submit button', async () => {
    await expect.element(passwordInput).toBeInTheDocument()
    await expect.element(confirmPasswordInput).toBeInTheDocument()
    await expect.element(submitButton).toBeInTheDocument()
  })

  it('shows validation messages when submitting empty form', async () => {
    await userEvent.click(submitButton)

    await expect
      .element(screen.getByText(/^Please enter a new password\.$/i))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(/^Please confirm your password\.$/i))
      .toBeInTheDocument()
  })

  it('shows a mismatch error when passwords do not match', async () => {
    await userEvent.fill(passwordInput, '12345678')
    await userEvent.fill(confirmPasswordInput, '87654321')
    await userEvent.click(submitButton)

    await expect
      .element(screen.getByText(/^Passwords don't match\.$/i))
      .toBeInTheDocument()
  })

  it('resets the password and navigates to sign-in on success', async () => {
    resetPasswordMock.mockResolvedValue({
      message: 'Password has been reset successfully',
    })

    await userEvent.fill(passwordInput, '12345678')
    await userEvent.fill(confirmPasswordInput, '12345678')
    await userEvent.click(submitButton)

    await vi.waitFor(() => expect(resetPasswordMock).toHaveBeenCalledOnce())
    expect(resetPasswordMock).toHaveBeenCalledWith({
      token: 'reset-token-value',
      password: '12345678',
      password_confirmation: '12345678',
    })
    expect(toastSuccess).toHaveBeenCalledWith(
      'Password has been reset successfully'
    )
    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/auth/sign-in' })
    )
  })
})
