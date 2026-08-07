import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { type AdminTeam } from '../api'
import {
  useCreateAdminTeam,
  useUpdateAdminTeam,
} from '../hooks/use-admin-teams'

const formSchema = z.object({
  name: z.string().min(1, 'Team name is required.'),
})
type TeamForm = z.infer<typeof formSchema>

type AdminTeamActionDialogProps = {
  currentRow?: AdminTeam
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminTeamActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AdminTeamActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<TeamForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit ? { name: currentRow.name } : { name: '' },
  })
  const createMutation = useCreateAdminTeam()
  const updateMutation = useUpdateAdminTeam()
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (values: TeamForm) => {
    if (isEdit && currentRow) {
      updateMutation.mutate(
        { teamId: currentRow.id, body: values },
        {
          onSuccess: ({ message }) => {
            toast.success(message)
            form.reset()
            onOpenChange(false)
          },
          onError: (error) => handleServerError(error),
        }
      )
      return
    }

    createMutation.mutate(values, {
      onSuccess: ({ message }) => {
        toast.success(message)
        form.reset()
        onOpenChange(false)
      },
      onError: (error) => handleServerError(error),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Team' : 'Add New Team'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the team here. ' : 'Create new team here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='admin-team-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., My Team'
                      className='col-span-4'
                      autoComplete='off'
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='admin-team-form' disabled={isPending}>
            {isPending && <Loader2 className='animate-spin' />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
