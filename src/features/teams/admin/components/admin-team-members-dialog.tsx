import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, Loader2, UsersRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type AdminTeam } from '../api'
import { useAdminTeamUsers } from '../hooks/use-admin-teams'

type AdminTeamMembersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: AdminTeam
}

export function AdminTeamMembersDialog({
  open,
  onOpenChange,
  team,
}: AdminTeamMembersDialogProps) {
  const [page, setPage] = useState(1)
  const [role, setRole] = useState<string>('all')

  const { data, isLoading } = useAdminTeamUsers(team.id, {
    page,
    per_page: 20,
    role: role === 'all' ? undefined : role,
  })

  const users = data?.users ?? []
  const total = data?.pagination.total ?? 0
  const totalPages = data?.pagination.total_pages ?? 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <UsersRound size={18} />
            Team Members
          </DialogTitle>
          <DialogDescription>
            Members of{' '}
            <span className='font-medium text-foreground'>{team.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center justify-between'>
          <Select
            value={role}
            onValueChange={(value) => {
              setRole(value)
              setPage(1)
            }}
          >
            <SelectTrigger className='h-8 w-40' aria-label='Filter by role'>
              <SelectValue placeholder='All roles' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All roles</SelectItem>
              <SelectItem value='owner'>Owner</SelectItem>
              <SelectItem value='member'>Member</SelectItem>
            </SelectContent>
          </Select>
          <span className='text-sm text-muted-foreground'>
            {total} member{total === 1 ? '' : 's'}
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className='h-24 text-center'>
                    <Loader2 className='me-2 inline animate-spin' />
                    Loading members...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className='h-24 text-center'>
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <code className='rounded bg-muted px-1.5 py-0.5 text-xs'>
                        {user.user_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === 'owner' ? 'default' : 'secondary'
                        }
                        className='capitalize'
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className='items-center gap-y-2'>
          <div className='me-auto flex items-center gap-2 text-sm text-muted-foreground'>
            Page {page} of {totalPages}
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className='size-4' />
              <span className='sr-only'>Previous page</span>
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              <ChevronRight className='size-4' />
              <span className='sr-only'>Next page</span>
            </Button>
          </div>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
