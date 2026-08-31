import { useAuthStore } from '@/stores/auth-store'

export const adminBillingPermissions = {
  plans: {
    list: 'billing.plans.list',
    view: 'billing.plans.view',
    create: 'billing.plans.create',
    update: 'billing.plans.update',
    delete: 'billing.plans.delete',
  },
  metrics: {
    list: 'billing.metrics.list',
    view: 'billing.metrics.view',
    create: 'billing.metrics.create',
    update: 'billing.metrics.update',
    delete: 'billing.metrics.delete',
  },
  discounts: {
    list: 'billing.discounts.list',
    create: 'billing.discounts.create',
    update: 'billing.discounts.update',
    delete: 'billing.discounts.delete',
  },
  restrictions: {
    list: 'billing.restrictions.list',
    create: 'billing.restrictions.create',
    update: 'billing.restrictions.update',
    delete: 'billing.restrictions.delete',
  },
} as const

export function useAdminBillingPermissions() {
  const permissions =
    useAuthStore((state) => state.auth.user?.permissions) ?? []

  const has = (key: string) => permissions.includes(key)

  return {
    plans: {
      canList: has(adminBillingPermissions.plans.list),
      canView: has(adminBillingPermissions.plans.view),
      canCreate: has(adminBillingPermissions.plans.create),
      canUpdate: has(adminBillingPermissions.plans.update),
      canDelete: has(adminBillingPermissions.plans.delete),
    },
    metrics: {
      canList: has(adminBillingPermissions.metrics.list),
      canView: has(adminBillingPermissions.metrics.view),
      canCreate: has(adminBillingPermissions.metrics.create),
      canUpdate: has(adminBillingPermissions.metrics.update),
      canDelete: has(adminBillingPermissions.metrics.delete),
    },
    discounts: {
      canList: has(adminBillingPermissions.discounts.list),
      canCreate: has(adminBillingPermissions.discounts.create),
      canUpdate: has(adminBillingPermissions.discounts.update),
      canDelete: has(adminBillingPermissions.discounts.delete),
    },
    restrictions: {
      canList: has(adminBillingPermissions.restrictions.list),
      canCreate: has(adminBillingPermissions.restrictions.create),
      canUpdate: has(adminBillingPermissions.restrictions.update),
      canDelete: has(adminBillingPermissions.restrictions.delete),
    },
  }
}
