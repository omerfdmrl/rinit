import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { SignOutDialog } from './sign-out-dialog'

const navigate = vi.fn()
const reset = vi.fn()
const logoutMock = vi.fn()
const handleServerErrorMock = vi.fn()

const MOCK_HREF = 'https://app.test/dashboard?tab=1'

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    auth: { reset },
  }),
}))

vi.mock('@/features/auth/api', () => ({
  logout: (...args: unknown[]) => logoutMock(...args),
}))

vi.mock('@/lib/handle-server-error', () => ({
  handleServerError: (...args: unknown[]) => handleServerErrorMock(...args),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
    useLocation: () => ({ href: MOCK_HREF }),
  }
})

async function renderDialog() {
  return await render(<SignOutDialog open onOpenChange={vi.fn()} />)
}

describe('SignOutDialog', () => {
  let screen: RenderResult

  beforeEach(async () => {
    vi.clearAllMocks()
    logoutMock.mockResolvedValue({ message: 'You have been signed out' })
    screen = await renderDialog()
  })

  it('calls the logout API, auth.reset, and navigates to sign-in with current location as redirect', async () => {
    await userEvent.click(screen.getByRole('button', { name: /^Sign out$/i }))

    await vi.waitFor(() => expect(logoutMock).toHaveBeenCalledOnce())
    expect(reset).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledWith({
      to: '/sign-in',
      search: { redirect: MOCK_HREF },
      replace: true,
    })
  })

  it('still resets and navigates when the logout API fails', async () => {
    logoutMock.mockRejectedValue(new Error('Network error'))

    await userEvent.click(screen.getByRole('button', { name: /^Sign out$/i }))

    await vi.waitFor(() => expect(handleServerErrorMock).toHaveBeenCalledOnce())
    expect(reset).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledWith({
      to: '/sign-in',
      search: { redirect: MOCK_HREF },
      replace: true,
    })
  })

  it('does not call reset or navigate when Cancel is clicked', async () => {
    await userEvent.click(screen.getByRole('button', { name: /^Cancel$/i }))

    expect(logoutMock).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
