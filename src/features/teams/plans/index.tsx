import { Link } from '@tanstack/react-router'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useCurrentTeam } from '../hooks/use-teams'
import { PlanOverview } from './components/plan-overview'
import { AddonsManager } from './components/addons-manager'
import { UsageTable } from './components/usage-table'
import { InvoicesTable } from './components/invoices-table'
import { LedgerTable } from './components/ledger-table'
import { BillingSettings } from './components/billing-settings'

export function TeamPlans() {
  const { currentTeam } = useCurrentTeam()

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
              <h2 className='text-2xl font-bold tracking-tight'>Billing & Plan</h2>
            </div>
            <p className='ml-10 text-muted-foreground'>
              {currentTeam
                ? `Manage ${currentTeam.name} subscription, addons, and billing settings.`
                : 'Manage your subscription, addons, and billing settings.'}
            </p>
          </div>
          <CreditCard className='size-8 text-muted-foreground' />
        </div>

        <Tabs defaultValue='plan' className='w-full'>
          <TabsList>
            <TabsTrigger value='plan'>Plan</TabsTrigger>
            <TabsTrigger value='addons'>Addons</TabsTrigger>
            <TabsTrigger value='usage'>Usage</TabsTrigger>
            <TabsTrigger value='invoices'>Invoices</TabsTrigger>
            <TabsTrigger value='ledger'>Ledger</TabsTrigger>
            <TabsTrigger value='settings'>Settings</TabsTrigger>
          </TabsList>
          <TabsContent value='plan' className='mt-4'>
            <PlanOverview />
          </TabsContent>
          <TabsContent value='addons' className='mt-4'>
            <AddonsManager />
          </TabsContent>
          <TabsContent value='usage' className='mt-4'>
            <UsageTable />
          </TabsContent>
          <TabsContent value='invoices' className='mt-4'>
            <InvoicesTable />
          </TabsContent>
          <TabsContent value='ledger' className='mt-4'>
            <LedgerTable />
          </TabsContent>
          <TabsContent value='settings' className='mt-4'>
            <BillingSettings />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
