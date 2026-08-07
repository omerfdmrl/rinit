import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { AdminUsersDialogs } from './components/admin-users-dialogs'
import { AdminUsersPrimaryButtons } from './components/admin-users-primary-buttons'
import { AdminUsersProvider } from './components/admin-users-provider'
import { AdminUsersTable } from './components/admin-users-table'

const route = getRouteApi('/_authenticated/admin/users/')

export function AdminUsers() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <AdminUsersProvider>
      <Header fixed>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              User Management
            </h2>
            <p className='text-muted-foreground'>
              Manage users and their access here.
            </p>
          </div>
          <AdminUsersPrimaryButtons />
        </div>
        <AdminUsersTable search={search} navigate={navigate} />
      </Main>

      <AdminUsersDialogs />
    </AdminUsersProvider>
  )
}
