import { useAuthStore } from '@/stores/auth-store'

export const billingPlanPermissions = {
  view: 'billing.team.plans.view',
  change: 'billing.team.plans.change',
  addons: 'billing.team.plans.addons',
  settings: 'billing.team.plans.settings',
} as const

export function usePlanPermissions() {
  const permissions =
    useAuthStore((state) => state.auth.user?.permissions) ?? []

  return {
    canView: permissions.includes(billingPlanPermissions.view),
    canChange: permissions.includes(billingPlanPermissions.change),
    canManageAddons: permissions.includes(billingPlanPermissions.addons),
    canSettings: permissions.includes(billingPlanPermissions.settings),
  }
}
