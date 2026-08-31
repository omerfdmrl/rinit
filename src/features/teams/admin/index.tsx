import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { AdminTeamsDialogs } from './components/admin-teams-dialogs'
import { AdminTeamsPrimaryButtons } from './components/admin-teams-primary-buttons'
import { AdminTeamsProvider } from './components/admin-teams-provider'
import { AdminTeamsTable } from './components/admin-teams-table'

const route = getRouteApi('/app/_authenticated/admin/teams/')

export function AdminTeams() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <AdminTeamsProvider>
      <Header fixed>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Team Management
            </h2>
            <p className='text-muted-foreground'>
              Manage teams and their members here.
            </p>
          </div>
          <AdminTeamsPrimaryButtons />
        </div>
        <AdminTeamsTable search={search} navigate={navigate} />
      </Main>

      <AdminTeamsDialogs />
    </AdminTeamsProvider>
  )
}
