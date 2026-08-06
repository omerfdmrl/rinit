import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { type AdminPermission } from '../../api'
import {
  useCreateAdminPermission,
  useUpdateAdminPermission,
} from '../../hooks/use-admin-roles'

const createSchema = z.object({
  key: z.string().min(1, 'Permission key is required.'),
  description: z.string().optional(),
  is_assignable: z.boolean(),
})

const editSchema = z.object({
  description: z.string().optional(),
})

type AdminPermissionActionDialogProps = {
  current?: AdminPermission
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminPermissionActionDialog({
  current,
  open,
  onOpenChange,
}: AdminPermissionActionDialogProps) {
  const isEdit = !!current
  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { key: '', description: '', is_assignable: true },
  })
  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: { description: current?.description ?? '' },
  })
  const createMutation = useCreateAdminPermission()
  const updateMutation = useUpdateAdminPermission()
  const isPending = createMutation.isPending || updateMutation.isPending

  const handleCreate = (values: z.infer<typeof createSchema>) => {
    createMutation.mutate(values, {
      onSuccess: ({ message }) => {
        toast.success(message)
        createForm.reset()
        onOpenChange(false)
      },
      onError: (error) => handleServerError(error),
    })
  }

  const handleEdit = (values: z.infer<typeof editSchema>) => {
    if (!current) return
    updateMutation.mutate(
      { permissionId: current.id, body: values },
      {
        onSuccess: ({ message }) => {
          toast.success(message)
          editForm.reset()
          onOpenChange(false)
        },
        onError: (error) => handleServerError(error),
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        createForm.reset()
        editForm.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Edit Permission' : 'Add New Permission'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the permission description here. '
              : 'Create new permission here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          <Form {...editForm}>
            <form
              id='admin-permission-form'
              onSubmit={editForm.handleSubmit(handleEdit)}
              className='space-y-4'
            >
              <FormField
                control={editForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Permission description'
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
        ) : (
          <Form {...createForm}>
            <form
              id='admin-permission-form'
              onSubmit={createForm.handleSubmit(handleCreate)}
              className='space-y-4'
            >
              <FormField
                control={createForm.control}
                name='key'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., reports.view'
                        className='col-span-4 font-mono'
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
                control={createForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Permission description'
                        className='col-span-4 resize-none'
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='is_assignable'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Assignable
                    </FormLabel>
                    <FormControl>
                      <div className='col-span-4 flex items-center gap-2'>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                        <span className='text-sm text-muted-foreground'>
                          Can be assigned to roles
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        <DialogFooter>
          <Button
            type='submit'
            form='admin-permission-form'
            disabled={isPending}
          >
            {isPending && <Loader2 className='animate-spin' />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
