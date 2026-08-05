import * as React from 'react'
import { Building2, ChevronsUpDown, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  useTeams,
  useCurrentTeam,
  useSwitchTeam,
} from '@/features/teams/hooks/use-teams'
import { CreateTeamDialog } from './create-team-dialog'

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const teamsQuery = useTeams()
  const { currentTeam } = useCurrentTeam()
  const switchTeamMutation = useSwitchTeam()

  const teams = teamsQuery.data ?? []

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <Building2 className='size-4' />
                </div>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    {currentTeam?.name ??
                      (teamsQuery.isLoading ? 'Loading...' : 'No team')}
                  </span>
                </div>
                <ChevronsUpDown className='ms-auto' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              align='start'
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className='text-xs text-muted-foreground'>
                Teams
              </DropdownMenuLabel>
              {teams.length === 0 && teamsQuery.isLoading ? (
                <DropdownMenuItem disabled className='gap-2 p-2'>
                  Loading teams...
                </DropdownMenuItem>
              ) : (
                teams.map((team) => (
                  <DropdownMenuItem
                    key={team.id}
                    onClick={() => {
                      if (currentTeam?.id !== team.id) {
                        switchTeamMutation.mutate({ team_id: team.id })
                      }
                    }}
                    className='gap-2 p-2'
                  >
                    <div className='flex size-6 items-center justify-center rounded-sm border'>
                      <Building2 className='size-4 shrink-0' />
                    </div>
                    <span className='truncate'>{team.name}</span>
                    {currentTeam?.id === team.id && (
                      <span className='ms-auto text-xs text-muted-foreground'>
                        Current
                      </span>
                    )}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='gap-2 p-2'
                onClick={() => setCreateDialogOpen(true)}
              >
                <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                  <Plus className='size-4' />
                </div>
                <div className='font-medium text-muted-foreground'>
                  Create team
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  )
}
