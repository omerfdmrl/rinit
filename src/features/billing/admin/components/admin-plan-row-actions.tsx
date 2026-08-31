import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Archive, ArrowUpCircle, Copy, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type AdminPlan } from '../api'
import { useAdminBillingPermissions } from '../hooks/use-admin-billing-permissions'
import {
  useActivateAdminPlan,
  useArchiveAdminPlan,
  useDuplicateAdminPlan,
} from '../hooks/use-admin-plans'
import { useAdminPlansContext } from './admin-plans-provider'

type AdminPlanRowActionsProps = {
  row: Row<AdminPlan>
}

export function AdminPlanRowActions({ row }: AdminPlanRowActionsProps) {
  const { setOpen, setCurrentRow } = useAdminPlansContext()
  const { plans } = useAdminBillingPermissions()
  const plan = row.original

  const archiveMutation = useArchiveAdminPlan()
  const activateMutation = useActivateAdminPlan()
  const duplicateMutation = useDuplicateAdminPlan()

  const canMutate =
    plans.canUpdate || plans.canCreate || plans.canDelete || plans.canView

  if (!canMutate) {
    return null
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        {plans.canUpdate && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(plan)
              setOpen('edit')
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <Pencil size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {plans.canCreate && (
          <DropdownMenuItem
            onClick={() => {
              duplicateMutation.mutate(
                { planId: plan.id },
                {
                  onSuccess: () => toast.success('Plan duplicated'),
                  onError: (error) => handleServerError(error),
                }
              )
            }}
            disabled={duplicateMutation.isPending}
          >
            Duplicate
            <DropdownMenuShortcut>
              <Copy size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {plans.canUpdate && plan.status === 'archived' && (
          <DropdownMenuItem
            onClick={() => {
              activateMutation.mutate(plan.id, {
                onSuccess: () => toast.success('Plan activated'),
                onError: (error) => handleServerError(error),
              })
            }}
            disabled={activateMutation.isPending}
          >
            Activate
            <DropdownMenuShortcut>
              <ArrowUpCircle size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {plans.canUpdate && plan.status !== 'archived' && (
          <DropdownMenuItem
            onClick={() => {
              archiveMutation.mutate(plan.id, {
                onSuccess: () => toast.success('Plan archived'),
                onError: (error) => handleServerError(error),
              })
            }}
            disabled={archiveMutation.isPending}
          >
            Archive
            <DropdownMenuShortcut>
              <Archive size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {plans.canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(plan)
                setOpen('delete')
              }}
              className='text-red-500!'
            >
              Delete
              <DropdownMenuShortcut>
                <Trash2 size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
