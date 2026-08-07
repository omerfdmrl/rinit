import { Link } from '@tanstack/react-router'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { usePlanPermissions } from '../hooks/use-plan-permissions'
import { useCurrentTeam } from '../hooks/use-teams'
import { AddonsManager } from './components/addons-manager'
import { BillingSettings } from './components/billing-settings'
import { InvoicesTable } from './components/invoices-table'
import { LedgerTable } from './components/ledger-table'
import { PlanOverview } from './components/plan-overview'
import { UsageTable } from './components/usage-table'

export function TeamPlans() {
  const { currentTeam } = useCurrentTeam()
  const { canView, canSettings } = usePlanPermissions()

  if (!canView && !canSettings) {
    return (
      <>
        <Header fixed>
          <Search className='me-auto' />
          <ThemeSwitch />
          <ProfileDropdown />
        </Header>
        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <div className='flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border p-8 text-center'>
            <h2 className='text-lg font-semibold'>Insufficient permissions</h2>
            <p className='max-w-sm text-sm text-muted-foreground'>
              You do not have permission to view billing and plans. Contact a
              team owner to request access.
            </p>
          </div>
        </Main>
      </>
    )
  }

  const defaultTab = canView ? 'plan' : 'settings'

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <div className='flex items-center gap-2'>
              <Button variant='ghost' size='icon' className='size-8' asChild>
                <Link to='/teams'>
                  <ArrowLeft className='size-4' />
                </Link>
              </Button>
              <h2 className='text-2xl font-bold tracking-tight'>
                Billing & Plan
              </h2>
            </div>
            <p className='ml-10 text-muted-foreground'>
              {currentTeam
                ? `Manage ${currentTeam.name} subscription, addons, and billing settings.`
                : 'Manage your subscription, addons, and billing settings.'}
            </p>
          </div>
          <CreditCard className='size-8 text-muted-foreground' />
        </div>

        <Tabs defaultValue={defaultTab} className='w-full'>
          <TabsList>
            {canView && <TabsTrigger value='plan'>Plan</TabsTrigger>}
            {canView && <TabsTrigger value='addons'>Addons</TabsTrigger>}
            {canView && <TabsTrigger value='usage'>Usage</TabsTrigger>}
            {canView && <TabsTrigger value='invoices'>Invoices</TabsTrigger>}
            {canView && <TabsTrigger value='ledger'>Ledger</TabsTrigger>}
            {canSettings && (
              <TabsTrigger value='settings'>Settings</TabsTrigger>
            )}
          </TabsList>
          {canView && (
            <TabsContent value='plan' className='mt-4'>
              <PlanOverview />
            </TabsContent>
          )}
          {canView && (
            <TabsContent value='addons' className='mt-4'>
              <AddonsManager />
            </TabsContent>
          )}
          {canView && (
            <TabsContent value='usage' className='mt-4'>
              <UsageTable />
            </TabsContent>
          )}
          {canView && (
            <TabsContent value='invoices' className='mt-4'>
              <InvoicesTable />
            </TabsContent>
          )}
          {canView && (
            <TabsContent value='ledger' className='mt-4'>
              <LedgerTable />
            </TabsContent>
          )}
          {canSettings && (
            <TabsContent value='settings' className='mt-4'>
              <BillingSettings />
            </TabsContent>
          )}
        </Tabs>
      </Main>
    </>
  )
}
