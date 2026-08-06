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
import { Textarea } from '@/components/ui/textarea'
import { type AdminRole } from '../../api'
import {
  useCreateAdminRole,
  useUpdateAdminRole,
} from '../../hooks/use-admin-roles'

const formSchema = z.object({
  name: z.string().min(1, 'Role name is required.'),
  description: z.string().optional(),
})
type RoleForm = z.infer<typeof formSchema>

type AdminRoleActionDialogProps = {
  currentRow?: AdminRole
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminRoleActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AdminRoleActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<RoleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.role_name,
          description: currentRow.description,
        }
      : { name: '', description: '' },
  })
  const createMutation = useCreateAdminRole()
  const updateMutation = useUpdateAdminRole()
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (values: RoleForm) => {
    if (isEdit && currentRow) {
      updateMutation.mutate(
        { roleId: currentRow.id, body: values },
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
          <DialogTitle>{isEdit ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the role here. ' : 'Create new role here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='admin-role-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Role Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., editor'
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
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Role description (optional)'
                      className='col-span-4 resize-none'
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
          <Button type='submit' form='admin-role-form' disabled={isPending}>
            {isPending && <Loader2 className='animate-spin' />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
