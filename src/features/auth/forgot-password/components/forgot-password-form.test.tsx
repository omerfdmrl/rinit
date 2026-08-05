import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent, type Locator } from 'vitest/browser'
import { ForgotPasswordForm } from './forgot-password-form'

const forgotPasswordMock = vi.fn()
const handleServerErrorMock = vi.fn()
const toastSuccess = vi.fn()

vi.mock('@/features/auth/api', () => ({
  forgotPassword: (...args: unknown[]) => forgotPasswordMock(...args),
}))

vi.mock('@/lib/handle-server-error', () => ({
  handleServerError: (...args: unknown[]) => handleServerErrorMock(...args),
}))

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: vi.fn(),
  },
}))

describe('ForgotPasswordForm', () => {
  let screen: RenderResult
  let emailInput: Locator
  let continueButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()

    screen = await render(<ForgotPasswordForm />)
    emailInput = screen.getByRole('textbox', { name: /^Email$/i })
    continueButton = screen.getByRole('button', { name: /^Continue$/i })
  })

  it('renders email field and continue button', async () => {
    await expect.element(emailInput).toBeInTheDocument()
    await expect.element(continueButton).toBeInTheDocument()
  })

  it('shows validation when submitting empty form', async () => {
    await userEvent.click(continueButton)
    await expect
      .element(screen.getByText(/^Please enter your email\.$/i))
      .toBeInTheDocument()
    expect(forgotPasswordMock).not.toHaveBeenCalled()
  })

  it('sends the reset email and resets the form on success', async () => {
    forgotPasswordMock.mockResolvedValue({
      message: 'Reset link sent — check your inbox',
    })

    await userEvent.fill(emailInput, 'a@b.com')
    await userEvent.click(continueButton)

    await vi.waitFor(() => expect(forgotPasswordMock).toHaveBeenCalledOnce())
    expect(forgotPasswordMock).toHaveBeenCalledWith({ email: 'a@b.com' })
    expect(toastSuccess).toHaveBeenCalledWith(
      'Reset link sent — check your inbox'
    )

    // Form should reset on success
    await expect.element(emailInput).toHaveValue('')
  })

  it('handles errors from the API', async () => {
    forgotPasswordMock.mockRejectedValue(new Error('Validation failed'))

    await userEvent.fill(emailInput, 'a@b.com')
    await userEvent.click(continueButton)

    await vi.waitFor(() => expect(handleServerErrorMock).toHaveBeenCalledOnce())
    await expect.element(emailInput).toHaveValue('a@b.com')
  })
})
