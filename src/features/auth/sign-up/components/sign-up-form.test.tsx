import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { SignUpForm } from './sign-up-form'

const FORM_MESSAGES = {
  nameEmpty: 'Please enter your name.',
  emailEmpty: 'Please enter your email.',
  passwordEmpty: 'Please enter your password.',
  passwordShort: 'Password must be at least 8 characters long.',
  confirmPasswordEmpty: 'Please confirm your password.',
  passwordMismatch: "Passwords don't match.",
} as const

const navigate = vi.fn()
const setUserMock = vi.fn()
const registerMock = vi.fn()
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
  register: (...args: unknown[]) => registerMock(...args),
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
  email: 'a@b.com',
  two_factor_enabled: false,
  permissions: ['post:read'],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

async function fillForm(screen: RenderResult) {
  await userEvent.fill(screen.getByLabelText(/^Name$/i), 'John Doe')
  await userEvent.fill(
    screen.getByRole('textbox', { name: /^Email$/i }),
    'a@b.com'
  )
  await userEvent.fill(screen.getByLabelText(/^Password$/i), '12345678')
  await userEvent.fill(screen.getByLabelText(/^Confirm Password$/i), '12345678')
  await userEvent.click(
    screen.getByRole('button', { name: /^Create Account$/i })
  )
}

describe('SignUpForm', () => {
  let screen: RenderResult

  beforeEach(async () => {
    vi.clearAllMocks()
    screen = await render(<SignUpForm />)
  })

  it('renders fields and submit button', async () => {
    await expect.element(screen.getByLabelText(/^Name$/i)).toBeInTheDocument()
    await expect
      .element(screen.getByRole('textbox', { name: /^Email$/i }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByLabelText(/^Password$/i))
      .toBeInTheDocument()
    await expect
      .element(screen.getByLabelText(/^Confirm Password$/i))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: /^Create Account$/i }))
      .toBeInTheDocument()
  })

  it('shows validation messages when submitting empty form', async () => {
    await userEvent.click(
      screen.getByRole('button', { name: /^Create Account$/i })
    )

    await expect
      .element(screen.getByText(FORM_MESSAGES.nameEmpty))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(FORM_MESSAGES.emailEmpty))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(FORM_MESSAGES.passwordEmpty))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(FORM_MESSAGES.confirmPasswordEmpty))
      .toBeInTheDocument()
  })

  it('shows a mismatch error when passwords do not match', async () => {
    await userEvent.fill(screen.getByLabelText(/^Name$/i), 'John Doe')
    await userEvent.fill(
      screen.getByRole('textbox', { name: /^Email$/i }),
      'a@b.com'
    )
    await userEvent.fill(screen.getByLabelText(/^Password$/i), '12345678')
    await userEvent.fill(
      screen.getByLabelText(/^Confirm Password$/i),
      '87654321'
    )

    await userEvent.click(
      screen.getByRole('button', { name: /^Create Account$/i })
    )
    await expect
      .element(screen.getByText(FORM_MESSAGES.passwordMismatch))
      .toBeInTheDocument()
  })

  it('registers, sets the user, and navigates home on success', async () => {
    registerMock.mockResolvedValue({
      user: sampleUser,
      team_id: 'team-uuid',
      message: 'Account created — your workspace is ready',
    })

    await fillForm(screen)

    await vi.waitFor(() => expect(registerMock).toHaveBeenCalledOnce())
    expect(registerMock).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'a@b.com',
      password: '12345678',
    })
    await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledWith(sampleUser))
    expect(toastSuccess).toHaveBeenCalledWith(
      'Account created — your workspace is ready'
    )
    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
    )
  })

  it('handles registration errors without setting the user', async () => {
    registerMock.mockRejectedValue(
      new Error('An account with this email already exists')
    )

    await fillForm(screen)

    await vi.waitFor(() => expect(handleServerErrorMock).toHaveBeenCalledOnce())
    expect(setUserMock).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
