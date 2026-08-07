import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PlanUsage } from '../../api'
import { usePlanUsage } from '../../hooks/use-plans'
import { useCurrentTeam } from '../../hooks/use-teams'

export function UsageTable() {
  const { currentTeam } = useCurrentTeam()
  const usageQuery = usePlanUsage(currentTeam?.id ?? 0)
  const usage = usageQuery.data?.usage ?? []

  if (usageQuery.isLoading) {
    return (
      <div className='rounded-lg border p-8 text-center text-muted-foreground'>
        Loading usage...
      </div>
    )
  }

  return (
    <div className='rounded-lg border p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold'>Usage</h3>
        <p className='text-sm text-muted-foreground'>
          Current billing period usage vs included amounts.
        </p>
      </div>

      {usage.length === 0 ? (
        <p className='py-8 text-center text-muted-foreground'>
          No usage data available.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className='text-right'>Used</TableHead>
              <TableHead className='text-right'>Included</TableHead>
              <TableHead className='text-right'>Utilization</TableHead>
              <TableHead className='text-right'>Aggregation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usage.map((u: PlanUsage) => {
              const utilization =
                u.unlimited || u.included === 0
                  ? null
                  : Math.round((u.total / u.included) * 100)

              return (
                <TableRow key={u.metric_key}>
                  <TableCell className='font-medium'>
                    {u.metric_key.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className='text-right'>
                    {u.total.toLocaleString()}
                  </TableCell>
                  <TableCell className='text-right'>
                    {u.unlimited ? (
                      <Badge variant='secondary'>Unlimited</Badge>
                    ) : (
                      u.included.toLocaleString()
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    {utilization !== null ? (
                      <Badge
                        variant={
                          utilization > 100
                            ? 'destructive'
                            : utilization > 80
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {utilization}%
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className='text-right text-muted-foreground'>
                    {u.aggregation}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
