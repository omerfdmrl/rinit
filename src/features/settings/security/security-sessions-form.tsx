import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRightLeft,
  Info,
  Laptop,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  type Session,
  getSessions,
  revokeSession,
  revokeAllSessions,
} from '../api'

export const sessionsQueryKey = ['sessions'] as const

function DeviceIcon({ os }: { os: string }) {
  switch (os.toLowerCase()) {
    case 'macos':
    case 'mac':
      return <Laptop className='size-5 text-muted-foreground' />
    case 'ios':
    case 'iphone':
      return <Smartphone className='size-5 text-muted-foreground' />
    case 'ipados':
    case 'ipad':
      return <Tablet className='size-5 text-muted-foreground' />
    case 'android':
      return <Smartphone className='size-5 text-muted-foreground' />
    case 'windows':
      return <Monitor className='size-5 text-muted-foreground' />
    default:
      return <Monitor className='size-5 text-muted-foreground' />
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  return 'Active now'
}

function formatStartDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function SessionItem({
  session,
  isCurrent,
  onRevoke,
}: {
  session: Session
  isCurrent: boolean
  onRevoke: (session: Session) => void
}) {
  return (
    <div className='flex items-start gap-4 px-6 py-4'>
      <div className='mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted'>
        <DeviceIcon os={session.os} />
      </div>
      <div className='flex-1 min-w-0 space-y-1'>
        <div className='flex items-center gap-2'>
          <span className='font-medium truncate'>{session.device_name}</span>
          {isCurrent && (
            <Badge
              variant='default'
              className='bg-emerald-500 hover:bg-emerald-600 text-[10px] px-1.5 py-0'
            >
              Current session
            </Badge>
          )}
        </div>
        <p className='text-sm text-muted-foreground'>
          {session.browser} on {session.os}
        </p>
        <p className='text-sm text-muted-foreground font-mono text-xs'>
          {session.ip_address}
        </p>
        <p className='text-xs text-muted-foreground'>
          Started {formatStartDate(session.created_at)}
        </p>
      </div>
      <div className='flex flex-col items-end gap-1 shrink-0'>
        {!isCurrent && (
          <>
            <span className='text-xs text-muted-foreground'>
              {formatRelativeTime(session.created_at)}
            </span>
            <Button
              variant='ghost'
              size='sm'
              className='text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 px-2'
              onClick={() => onRevoke(session)}
            >
              <ArrowRightLeft className='size-3.5' />
              Revoke
            </Button>
          </>
        )}
        {isCurrent && (
          <span className='text-xs text-emerald-500 font-medium'>
            Active now
          </span>
        )}
      </div>
    </div>
  )
}

export function SecuritySessionsForm() {
  const queryClient = useQueryClient()
  const [revokeTarget, setRevokeTarget] = useState<Session | null>(null)
  const [revokeAllOpen, setRevokeAllOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: sessionsQueryKey,
    queryFn: getSessions,
  })

  const sessions = data?.sessions ?? []
  const currentSessionId = data?.current_session_id ?? 0
  const otherSessionsCount = sessions.filter(
    (s) => s.id !== currentSessionId
  ).length

  const revokeMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey })
      setRevokeTarget(null)
    },
    onError: () => {},
  })

  const revokeAllMutation = useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey })
      setRevokeAllOpen(false)
    },
    onError: () => {},
  })

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                Active Sessions
                <span className='text-base font-normal text-muted-foreground'>
                  {sessions.length}
                </span>
              </CardTitle>
              <CardDescription>
                Devices currently signed in to your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-0 p-0'>
          <div className='mx-6 mb-4 flex items-start gap-3 rounded-lg border bg-muted/30 px-4 py-3'>
            <Info className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
            <p className='text-sm text-muted-foreground'>
              If you don't recognize a session, revoke it immediately and
              change your password. Sessions from new locations are flagged
              automatically.
            </p>
          </div>

          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='size-6 animate-spin text-muted-foreground' />
            </div>
          ) : sessions.length === 0 ? (
            <div className='flex items-center justify-center py-12 text-sm text-muted-foreground'>
              No active sessions found.
            </div>
          ) : (
            <div className='divide-y'>
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isCurrent={session.id === currentSessionId}
                  onRevoke={setRevokeTarget}
                />
              ))}
            </div>
          )}
        </CardContent>
        {sessions.length > 1 && (
          <CardFooter className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>
              {otherSessionsCount} other session
              {otherSessionsCount !== 1 ? 's' : ''} besides this device
            </span>
            <Button
              variant='outline'
              size='sm'
              className='text-red-500 hover:text-red-600 hover:bg-red-500/10 hover:border-red-500/30'
              onClick={() => setRevokeAllOpen(true)}
            >
              <ArrowRightLeft className='size-3.5' />
              Revoke all other sessions
            </Button>
          </CardFooter>
        )}
      </Card>

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null)
        }}
        title='Revoke this session?'
        desc={
          revokeTarget
            ? `This will sign out ${revokeTarget.device_name} (${revokeTarget.browser} on ${revokeTarget.os}) from ${revokeTarget.ip_address}. The device will need to sign in again.`
            : ''
        }
        confirmText='Revoke Session'
        destructive
        isLoading={revokeMutation.isPending}
        handleConfirm={() => {
          if (revokeTarget) revokeMutation.mutate(revokeTarget.id)
        }}
      />

      <ConfirmDialog
        open={revokeAllOpen}
        onOpenChange={setRevokeAllOpen}
        title='Revoke all other sessions?'
        desc={`This will sign out ${otherSessionsCount} other session${otherSessionsCount !== 1 ? 's' : ''}. All other devices will need to sign in again.`}
        confirmText='Revoke All Sessions'
        destructive
        isLoading={revokeAllMutation.isPending}
        handleConfirm={() => revokeAllMutation.mutate()}
      />
    </>
  )
}