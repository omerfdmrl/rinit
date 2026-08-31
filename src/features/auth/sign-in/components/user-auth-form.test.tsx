import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { UserAuthForm } from './user-auth-form'

const FORM_MESSAGES = {
  emailEmpty: 'Please enter your email.',
  passwordEmpty: 'Please enter your password.',
  passwordShort: 'Password must be at least 8 characters long.',
} as const

const navigate = vi.fn()
const setUserMock = vi.fn()
const loginMock = vi.fn()
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
  login: (...args: unknown[]) => loginMock(...args),
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

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
    Link: ({
      children,
      to,
      className,
      ...rest
    }: {
      children?: React.ReactNode
      to: string
      className?: string
    }) => (
      <a href={to} className={className} {...rest}>
        {children}
      </a>
    ),
  }
})

const sampleUser = {
  id: 'uuid',
  name: 'John Doe',
  email: 'a@b.com',
  two_factor_enabled: false,
  permissions: ['post:read'],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

async function submitCredentials(
  screen: RenderResult,
  email: string,
  password: string
) {
  await userEvent.fill(screen.getByRole('textbox', { name: /^Email$/i }), email)
  await userEvent.fill(screen.getByLabelText(/^Password$/i), password)
  await userEvent.click(screen.getByRole('button', { name: /^Sign in$/i }))
}

describe('UserAuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders fields, submit button, and forgot password link', async () => {
    const screen = await render(<UserAuthForm />)

    await expect
      .element(screen.getByRole('textbox', { name: /^Email$/i }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByLabelText(/^Password$/i))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: /^Sign in$/i }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(/^Forgot password\?$/i))
      .toBeInTheDocument()
  })

  it('shows validation messages when submitting empty form', async () => {
    const screen = await render(<UserAuthForm />)

    await userEvent.click(screen.getByRole('button', { name: /^Sign in$/i }))

    await expect
      .element(screen.getByText(FORM_MESSAGES.emailEmpty))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(FORM_MESSAGES.passwordEmpty))
      .toBeInTheDocument()
  })

  it('authenticates and navigates to default route on success', async () => {
    loginMock.mockResolvedValue({ user: sampleUser, message: 'Welcome back!' })
    const screen = await render(<UserAuthForm />)

    await submitCredentials(screen, 'a@b.com', '12345678')

    await vi.waitFor(() => expect(loginMock).toHaveBeenCalledOnce())
    expect(loginMock).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: '12345678',
    })
    await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledWith(sampleUser))
    expect(toastSuccess).toHaveBeenCalledWith('Welcome back!')
    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/app', replace: true })
    )
  })

  it('navigates to redirectTo when provided', async () => {
    loginMock.mockResolvedValue({ user: sampleUser, message: 'Welcome back!' })
    const screen = await render(<UserAuthForm redirectTo='/settings' />)

    await submitCredentials(screen, 'a@b.com', '12345678')

    await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledWith(sampleUser))
    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/settings',
        replace: true,
      })
    )
  })

  it('navigates to OTP when 2FA is required without setting user', async () => {
    loginMock.mockResolvedValue({
      two_factor_required: true,
      message: 'Two-factor authentication required',
    })
    const screen = await render(<UserAuthForm />)

    await submitCredentials(screen, 'a@b.com', '12345678')

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/auth/otp' })
    )
    expect(setUserMock).not.toHaveBeenCalled()
  })

  it('handles login errors without setting user', async () => {
    loginMock.mockRejectedValue(new Error('Invalid email or password'))
    const screen = await render(<UserAuthForm />)

    await submitCredentials(screen, 'a@b.com', '12345678')

    await vi.waitFor(() => expect(handleServerErrorMock).toHaveBeenCalledOnce())
    expect(setUserMock).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
