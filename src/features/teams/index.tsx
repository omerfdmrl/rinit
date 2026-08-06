import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TeamMembers } from './components/team-members'
import { TeamRoles } from './components/team-roles'
import { TeamSettings } from './components/team-settings'
import { useTeamUserPermissions } from './hooks/use-team-user-permissions'
import { useCurrentTeam } from './hooks/use-teams'

export function Teams() {
  const { currentTeam } = useCurrentTeam()
  const { canListMembers, canListRoles } = useTeamUserPermissions()

  const defaultTab = canListMembers
    ? 'members'
    : canListRoles
      ? 'roles'
      : 'settings'

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Team Management</h2>
          <p className='text-muted-foreground'>
            {currentTeam
              ? `Manage ${currentTeam.name} settings, members, and roles.`
              : 'Manage your team settings, members, and roles.'}
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className='w-full'>
          <TabsList>
            {canListMembers && (
              <TabsTrigger value='members'>Members</TabsTrigger>
            )}
            {canListRoles && <TabsTrigger value='roles'>Roles</TabsTrigger>}
            <TabsTrigger value='settings'>Settings</TabsTrigger>
          </TabsList>
          {canListMembers && (
            <TabsContent value='members' className='mt-4'>
              <TeamMembers />
            </TabsContent>
          )}
          {canListRoles && (
            <TabsContent value='roles' className='mt-4'>
              <TeamRoles />
            </TabsContent>
          )}
          <TabsContent value='settings' className='mt-4'>
            <TeamSettings />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
