import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type AdminUsageMetric } from '../api'
import { AdminMetricActionDialog } from './admin-metric-action-dialog'

const MOCK_METRIC: AdminUsageMetric = {
  id: 1,
  key: 'api_calls',
  name: 'API Calls',
  unit: 'count',
  aggregation_type: 'sum',
  created_at: '2026-01-01T10:30:00Z',
}

const createMetricMock = vi.fn()
const updateMetricMock = vi.fn()

vi.mock('../hooks/use-admin-metrics', () => ({
  useCreateAdminMetric: () => ({
    mutate: (...args: unknown[]) => createMetricMock(...args),
    isPending: false,
  }),
  useUpdateAdminMetric: () => ({
    mutate: (...args: unknown[]) => updateMetricMock(...args),
    isPending: false,
  }),
}))

const toastSuccess = vi.fn()
vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}))

vi.mock('@/lib/handle-server-error', () => ({ handleServerError: vi.fn() }))

describe('AdminMetricActionDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders title and description for a new metric', async () => {
    const { getByRole, getByText } = await render(
      <AdminMetricActionDialog open onOpenChange={vi.fn()} />
    )

    await expect
      .element(getByRole('heading', { level: 2, name: /Add New Metric/i }))
      .toBeInTheDocument()
    await expect
      .element(
        getByText(
          /Create a new usage metric here. Click save when you're done./i
        )
      )
      .toBeInTheDocument()
  })

  it('shows a validation message when the name is empty', async () => {
    const { getByRole, getByText } = await render(
      <AdminMetricActionDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /Save Changes/i }))

    await expect.element(getByText('Name is required.')).toBeInTheDocument()
    await expect.element(getByText('Key is required.')).toBeInTheDocument()
  })

  it('creates the metric and shows a success toast on submit', async () => {
    createMetricMock.mockImplementation(
      (
        _body: unknown,
        opts?: { onSuccess?: (data: { message: string }) => void }
      ) => opts?.onSuccess?.({ message: 'Metric created' })
    )

    const onOpenChange = vi.fn()
    const screen = await render(
      <AdminMetricActionDialog open onOpenChange={onOpenChange} />
    )

    await userEvent.fill(screen.getByLabelText(/^Name$/i), MOCK_METRIC.name)
    await userEvent.fill(screen.getByLabelText(/^Key$/i), MOCK_METRIC.key)

    await userEvent.click(screen.getByRole('button', { name: /Save Changes/i }))

    expect(createMetricMock).toHaveBeenCalledOnce()
    expect(createMetricMock).toHaveBeenCalledWith(
      {
        key: 'api_calls',
        name: 'API Calls',
        unit: 'count',
        aggregation_type: 'sum',
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
    expect(toastSuccess).toHaveBeenCalledWith('Metric created')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('pre-fills fields when editing and updates on submit', async () => {
    updateMetricMock.mockImplementation(
      (
        _args: unknown,
        opts?: { onSuccess?: (data: { message: string }) => void }
      ) => opts?.onSuccess?.({ message: 'Metric updated' })
    )

    const onOpenChange = vi.fn()
    const screen = await render(
      <AdminMetricActionDialog
        open
        onOpenChange={onOpenChange}
        currentRow={MOCK_METRIC}
      />
    )

    await expect
      .element(screen.getByRole('heading', { level: 2, name: /Edit Metric/i }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByLabelText(/^Name$/i))
      .toHaveValue('API Calls')

    await userEvent.click(screen.getByRole('button', { name: /Save Changes/i }))

    expect(updateMetricMock).toHaveBeenCalledWith(
      {
        metricId: MOCK_METRIC.id,
        body: {
          key: 'api_calls',
          name: 'API Calls',
          unit: 'count',
          aggregation_type: 'sum',
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
    expect(toastSuccess).toHaveBeenCalledWith('Metric updated')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
