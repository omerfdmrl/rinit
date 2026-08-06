import * as React from 'react'
import { MoreHorizontal, UserMinus, ShieldCheck, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { TeamMember } from '../api'
import { useTeamUserPermissions } from '../hooks/use-team-user-permissions'
import { useCurrentTeam, useTeamMembers } from '../hooks/use-teams'
import { AssignRoleDialog } from './assign-role-dialog'
import { InviteMemberDialog } from './invite-member-dialog'
import { RemoveMemberDialog } from './remove-member-dialog'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function TeamMembers() {
  const { currentTeam } = useCurrentTeam()
  const { canInviteMember, canAssignRole, canRemoveMember } =
    useTeamUserPermissions()
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [removeMember, setRemoveMember] = React.useState<TeamMember | null>(
    null
  )
  const [assignRole, setAssignRole] = React.useState<TeamMember | null>(null)

  const membersQuery = useTeamMembers(currentTeam?.id ?? '')
  const members = membersQuery.data?.members ?? []

  if (!currentTeam) {
    return (
      <div className='rounded-lg border p-8 text-center text-muted-foreground'>
        No team selected. Please select or create a team first.
      </div>
    )
  }

  return (
    <>
      <div className='rounded-lg border p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold'>Team Members</h3>
            <p className='text-sm text-muted-foreground'>
              Manage roles and access for your workspace.
            </p>
          </div>
          {canInviteMember && (
            <Button size='sm' onClick={() => setInviteOpen(true)}>
              <UserPlus className='size-4' />
              Invite
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className='w-[50px]' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {membersQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  Loading members...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='size-8'>
                        <AvatarFallback>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>{member.name}</div>
                        <div className='text-sm text-muted-foreground'>
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.role === 'owner' ? 'default' : 'secondary'
                      }
                    >
                      {member.role === 'owner' && (
                        <ShieldCheck className='size-3' />
                      )}
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {formatDate(member.created_at)}
                  </TableCell>
                  <TableCell>
                    {member.role !== 'owner' &&
                      (canAssignRole || canRemoveMember) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='size-8'
                            >
                              <MoreHorizontal className='size-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            {canAssignRole && (
                              <DropdownMenuItem
                                onClick={() => setAssignRole(member)}
                              >
                                <ShieldCheck className='size-4' />
                                Change role
                              </DropdownMenuItem>
                            )}
                            {canAssignRole && canRemoveMember && (
                              <DropdownMenuSeparator />
                            )}
                            {canRemoveMember && (
                              <DropdownMenuItem
                                className='text-destructive'
                                onClick={() => setRemoveMember(member)}
                              >
                                <UserMinus className='size-4' />
                                Remove
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        teamId={currentTeam.id}
      />
      <RemoveMemberDialog
        open={!!removeMember}
        onOpenChange={(open) => {
          if (!open) setRemoveMember(null)
        }}
        teamId={currentTeam.id}
        member={removeMember}
      />
      <AssignRoleDialog
        open={!!assignRole}
        onOpenChange={(open) => {
          if (!open) setAssignRole(null)
        }}
        teamId={currentTeam.id}
        member={assignRole}
      />
    </>
  )
}
