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
import { SelectDropdown } from '@/components/select-dropdown'
import { type AdminUser } from '../../api'
import {
  useCreateAdminUser,
  useUpdateAdminUser,
} from '../../hooks/use-admin-users'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Email is required.' : undefined),
  }),
  role: z.union([z.literal('user'), z.literal('admin')]),
})
type UserForm = z.infer<typeof formSchema>

const roles = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
] as const

type AdminUserActionDialogProps = {
  currentRow?: AdminUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminUserActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AdminUserActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          email: currentRow.email,
          role: currentRow.role,
        }
      : { name: '', email: '', role: 'user' },
  })
  const createMutation = useCreateAdminUser()
  const updateMutation = useUpdateAdminUser()
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (values: UserForm) => {
    if (isEdit && currentRow) {
      updateMutation.mutate(
        { userId: currentRow.id, body: values },
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
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='admin-user-form'
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
                      placeholder='John Doe'
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
              name='email'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='john.doe@gmail.com'
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
              name='role'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Role</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select a role'
                    className='col-span-4'
                    disabled={isPending}
                    items={roles.map(({ label, value }) => ({
                      label,
                      value,
                    }))}
                  />
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='admin-user-form' disabled={isPending}>
            {isPending && <Loader2 className='animate-spin' />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
