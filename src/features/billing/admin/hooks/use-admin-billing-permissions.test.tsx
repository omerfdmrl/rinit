import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import {
  useAdminBillingPermissions,
  adminBillingPermissions,
} from './use-admin-billing-permissions'

let mockPermissions: string[] = []

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ auth: { user: { permissions: mockPermissions } } }),
}))

function PermissionsProbe() {
  const perms = useAdminBillingPermissions()
  return (
    <pre data-testid='probe'>
      {JSON.stringify({
        plansList: perms.plans.canList,
        plansCreate: perms.plans.canCreate,
        plansUpdate: perms.plans.canUpdate,
        plansDelete: perms.plans.canDelete,
        metricsList: perms.metrics.canList,
        metricsCreate: perms.metrics.canCreate,
        metricsUpdate: perms.metrics.canUpdate,
        metricsDelete: perms.metrics.canDelete,
        discountsList: perms.discounts.canList,
        discountsCreate: perms.discounts.canCreate,
        discountsUpdate: perms.discounts.canUpdate,
        discountsDelete: perms.discounts.canDelete,
        restrictionsList: perms.restrictions.canList,
        restrictionsCreate: perms.restrictions.canCreate,
        restrictionsUpdate: perms.restrictions.canUpdate,
        restrictionsDelete: perms.restrictions.canDelete,
      })}
    </pre>
  )
}

async function probeValues() {
  const screen = await render(<PermissionsProbe />)
  const text = screen.getByTestId('probe').element()?.textContent
  return JSON.parse(text ?? '{}')
}

describe('adminBillingPermissions', () => {
  it('exports the backend permission keys', () => {
    expect(adminBillingPermissions.plans.list).toBe('billing.plans.list')
    expect(adminBillingPermissions.plans.create).toBe('billing.plans.create')
    expect(adminBillingPermissions.metrics.delete).toBe(
      'billing.metrics.delete'
    )
    expect(adminBillingPermissions.discounts.update).toBe(
      'billing.discounts.update'
    )
    expect(adminBillingPermissions.restrictions.list).toBe(
      'billing.restrictions.list'
    )
  })
})

describe('useAdminBillingPermissions', () => {
  beforeEach(() => {
    mockPermissions = []
  })

  it('denies everything when no permissions are present', async () => {
    const values = await probeValues()

    expect(values).toEqual({
      plansList: false,
      plansCreate: false,
      plansUpdate: false,
      plansDelete: false,
      metricsList: false,
      metricsCreate: false,
      metricsUpdate: false,
      metricsDelete: false,
      discountsList: false,
      discountsCreate: false,
      discountsUpdate: false,
      discountsDelete: false,
      restrictionsList: false,
      restrictionsCreate: false,
      restrictionsUpdate: false,
      restrictionsDelete: false,
    })
  })

  it('maps billing permissions for each entity independently', async () => {
    mockPermissions = [
      'billing.plans.list',
      'billing.plans.create',
      'billing.metrics.list',
      'billing.metrics.update',
      'billing.discounts.create',
      'billing.restrictions.list',
      'billing.restrictions.delete',
    ]
    const values = await probeValues()

    expect(values.plansList).toBe(true)
    expect(values.plansCreate).toBe(true)
    expect(values.plansUpdate).toBe(false)
    expect(values.plansDelete).toBe(false)
    expect(values.metricsList).toBe(true)
    expect(values.metricsUpdate).toBe(true)
    expect(values.metricsDelete).toBe(false)
    expect(values.discountsCreate).toBe(true)
    expect(values.discountsList).toBe(false)
    expect(values.restrictionsList).toBe(true)
    expect(values.restrictionsDelete).toBe(true)
    expect(values.restrictionsCreate).toBe(false)
  })
})
