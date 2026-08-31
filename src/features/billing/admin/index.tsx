import { useMemo } from 'react'
import { CreditCard } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { AdminDiscountsTab } from './components/admin-discounts-tab'
import { AdminMetricsTab } from './components/admin-metrics-tab'
import { AdminPlansTab } from './components/admin-plans-tab'
import { AdminRestrictionsTab } from './components/admin-restrictions-tab'
import { useAdminBillingPermissions } from './hooks/use-admin-billing-permissions'

export function AdminBilling() {
  const { plans, metrics, discounts, restrictions } =
    useAdminBillingPermissions()

  const defaultTab = useMemo(() => {
    if (plans.canList) return 'plans'
    if (metrics.canList) return 'metrics'
    if (discounts.canList) return 'discounts'
    if (restrictions.canList) return 'restrictions'
    return 'plans'
  }, [plans.canList, metrics.canList, discounts.canList, restrictions.canList])

  return (
    <>
      <Header fixed>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Billing Management
            </h2>
            <p className='text-muted-foreground'>
              Manage plans, usage metrics, discounts, and restriction stages.
            </p>
          </div>
          <CreditCard className='size-8 text-muted-foreground' />
        </div>

        <Tabs defaultValue={defaultTab} className='flex flex-1 flex-col'>
          <TabsList className='w-fit'>
            {plans.canList && <TabsTrigger value='plans'>Plans</TabsTrigger>}
            {metrics.canList && (
              <TabsTrigger value='metrics'>Metrics</TabsTrigger>
            )}
            {discounts.canList && (
              <TabsTrigger value='discounts'>Discounts</TabsTrigger>
            )}
            {restrictions.canList && (
              <TabsTrigger value='restrictions'>Restrictions</TabsTrigger>
            )}
          </TabsList>
          {plans.canList && (
            <TabsContent value='plans' className='mt-4 flex flex-1 flex-col'>
              <AdminPlansTab />
            </TabsContent>
          )}
          {metrics.canList && (
            <TabsContent value='metrics' className='mt-4 flex flex-1 flex-col'>
              <AdminMetricsTab />
            </TabsContent>
          )}
          {discounts.canList && (
            <TabsContent
              value='discounts'
              className='mt-4 flex flex-1 flex-col'
            >
              <AdminDiscountsTab />
            </TabsContent>
          )}
          {restrictions.canList && (
            <TabsContent
              value='restrictions'
              className='mt-4 flex flex-1 flex-col'
            >
              <AdminRestrictionsTab />
            </TabsContent>
          )}
        </Tabs>
      </Main>
    </>
  )
}
