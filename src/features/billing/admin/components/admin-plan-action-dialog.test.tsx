import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type AdminPlan } from '../api'
import { AdminPlanActionDialog } from './admin-plan-action-dialog'

const MOCK_PLAN: AdminPlan = {
  id: 1,
  code: 'pro',
  name: 'Pro',
  description: 'For teams',
  status: 'active',
  interval_type: 'monthly',
  interval_days: 0,
  price_amount: 1990,
  currency: 'USD',
  trial_days: 7,
  negative_balance_limit: null,
  is_addon: false,
  is_default: false,
  created_at: '2026-01-01T10:30:00Z',
  updated_at: '2026-01-01T10:30:00Z',
  features: [],
  metrics: [],
}

const createPlanMock = vi.fn()
const updatePlanMock = vi.fn()

vi.mock('../hooks/use-admin-plans', () => ({
  useCreateAdminPlan: () => ({
    mutate: (...args: unknown[]) => createPlanMock(...args),
    isPending: false,
  }),
  useUpdateAdminPlan: () => ({
    mutate: (...args: unknown[]) => updatePlanMock(...args),
    isPending: false,
  }),
  useDeleteAdminPlan: () => ({ mutate: vi.fn(), isPending: false }),
  useDuplicateAdminPlan: () => ({ mutate: vi.fn(), isPending: false }),
  useArchiveAdminPlan: () => ({ mutate: vi.fn(), isPending: false }),
  useActivateAdminPlan: () => ({ mutate: vi.fn(), isPending: false }),
}))

const toastSuccess = vi.fn()
vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}))

vi.mock('@/lib/handle-server-error', () => ({ handleServerError: vi.fn() }))

describe('AdminPlanActionDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders title and description for a new plan', async () => {
    const { getByRole, getByText } = await render(
      <AdminPlanActionDialog open onOpenChange={vi.fn()} />
    )

    await expect
      .element(getByRole('heading', { level: 2, name: /Add New Plan/i }))
      .toBeInTheDocument()
    await expect
      .element(
        getByText(
          /Create a new billing plan here. Click save when you're done./i
        )
      )
      .toBeInTheDocument()
  })

  it('shows validation messages when required fields are empty', async () => {
    const { getByRole, getByText } = await render(
      <AdminPlanActionDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /Save Changes/i }))

    await expect.element(getByText('Name is required.')).toBeInTheDocument()
    await expect.element(getByText('Code is required.')).toBeInTheDocument()
  })

  it('converts dollars to cents when creating a plan', async () => {
    createPlanMock.mockImplementation(
      (_body: unknown, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.()
    )

    const onOpenChange = vi.fn()
    const screen = await render(
      <AdminPlanActionDialog open onOpenChange={onOpenChange} />
    )

    await userEvent.fill(screen.getByLabelText(/^Name$/i), 'Pro')
    await userEvent.fill(screen.getByLabelText(/^Code$/i), 'pro')
    await userEvent.fill(
      screen.getByLabelText(/^Price \(per interval\)$/i),
      '19.9'
    )

    await userEvent.click(screen.getByRole('button', { name: /Save Changes/i }))

    expect(createPlanMock).toHaveBeenCalledOnce()
    const [payload] = createPlanMock.mock.calls[0] as [Record<string, unknown>]
    expect(payload.price_amount).toBe(1990)
    expect(payload.interval_type).toBe('monthly')
    expect(payload.currency).toBe('USD')
    expect(payload.is_addon).toBe(false)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('pre-fills from an existing plan and preserves cents on edit', async () => {
    updatePlanMock.mockImplementation(
      (_args: unknown, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.()
    )

    const screen = await render(
      <AdminPlanActionDialog
        open
        onOpenChange={vi.fn()}
        currentRow={MOCK_PLAN}
      />
    )

    await expect
      .element(screen.getByRole('heading', { level: 2, name: /Edit Plan/i }))
      .toBeInTheDocument()
    await expect.element(screen.getByLabelText(/^Name$/i)).toHaveValue('Pro')
    await expect
      .element(screen.getByLabelText(/^Price \(per interval\)$/i))
      .toHaveValue(19.9)

    await userEvent.click(screen.getByRole('button', { name: /Save Changes/i }))

    expect(updatePlanMock).toHaveBeenCalledOnce()
    const [args] = updatePlanMock.mock.calls[0] as [
      { planId: number; body: Record<string, unknown> },
    ]
    expect(args.body.price_amount).toBe(1990)
  })
})
