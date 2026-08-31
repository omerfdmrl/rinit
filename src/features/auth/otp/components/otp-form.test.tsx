import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { OtpForm } from './otp-form'

const navigate = vi.fn()
const setUserMock = vi.fn()
const verify2faMock = vi.fn()
const handleServerErrorMock = vi.fn()
const toastSuccess = vi.fn()

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    auth: {
      setUser: setUserMock,
    },
  }),
}))

vi.mock('@/features/auth/api', () => ({
  verify2fa: (...args: unknown[]) => verify2faMock(...args),
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

vi.mock('@tanstack/react-router', async (orig) => {
  const actual = await orig<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => navigate }
})

const sampleUser = {
  id: 'uuid',
  name: 'John Doe',
  email: 'john@example.com',
  two_factor_enabled: true,
  permissions: ['post:read'],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('OtpForm', () => {
  let screen: RenderResult
  let otpInput: Locator
  let verifyButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()

    screen = await render(<OtpForm />)
    otpInput = screen.getByLabelText(/^One-Time Password$/i)
    verifyButton = screen.getByRole('button', { name: /^Verify$/i })
  })

  it('disables Verify until 6 digits are entered', async () => {
    await expect.element(verifyButton).toBeDisabled()

    await userEvent.fill(otpInput, '12345')
    await expect.element(verifyButton).toBeDisabled()

    await userEvent.fill(otpInput, '123456')
    await expect.element(verifyButton).toBeEnabled()
  })

  it('verifies the code, sets the user, and navigates home on success', async () => {
    verify2faMock.mockResolvedValue({
      user: sampleUser,
      message: 'Two-factor authentication verified',
    })

    await userEvent.fill(otpInput, '123456')
    await userEvent.click(verifyButton)

    await vi.waitFor(() => expect(verify2faMock).toHaveBeenCalledOnce())
    expect(verify2faMock).toHaveBeenCalledWith({ code: '123456' })
    await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledWith(sampleUser))
    expect(toastSuccess).toHaveBeenCalledWith(
      'Two-factor authentication verified'
    )
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/app' }))
  })

  it('handles verification errors without setting the user', async () => {
    verify2faMock.mockRejectedValue(new Error('Invalid verification code'))

    await userEvent.fill(otpInput, '123456')
    await userEvent.click(verifyButton)

    await vi.waitFor(() => expect(handleServerErrorMock).toHaveBeenCalledOnce())
    expect(setUserMock).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
