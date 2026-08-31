import { getRouteApi } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAdminRolePermissions } from '../hooks/use-admin-permissions'
import { AdminPermissionsTab } from './components/admin-permissions-tab'
import { AdminRolesDialogs } from './components/admin-roles-dialogs'
import { AdminRolesPrimaryButtons } from './components/admin-roles-primary-buttons'
import { AdminRolesProvider } from './components/admin-roles-provider'
import { AdminRolesTable } from './components/admin-roles-table'

const route = getRouteApi('/app/_authenticated/admin/roles/')

export function AdminRoles() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { canListPermissions } = useAdminRolePermissions()

  return (
    <AdminRolesProvider>
      <Header fixed>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Role Management
            </h2>
            <p className='text-muted-foreground'>
              Manage roles and their permissions here.
            </p>
          </div>
          <AdminRolesPrimaryButtons />
        </div>

        <Tabs defaultValue='roles' className='w-full'>
          <TabsList>
            <TabsTrigger value='roles'>Roles</TabsTrigger>
            {canListPermissions && (
              <TabsTrigger value='permissions'>Permissions</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value='roles' className='mt-4'>
            <AdminRolesTable search={search} navigate={navigate} />
          </TabsContent>
          {canListPermissions && (
            <TabsContent value='permissions' className='mt-4'>
              <AdminPermissionsTab />
            </TabsContent>
          )}
        </Tabs>
      </Main>

      <AdminRolesDialogs />
    </AdminRolesProvider>
  )
}
