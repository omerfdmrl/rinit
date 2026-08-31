import { z } from 'zod'
import { useForm, type Resolver } from 'react-hook-form'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  type AdminRestrictionStage,
  type AdminRestrictionStageInput,
} from '../api'
import { restrictionActions } from '../constants'
import {
  useCreateAdminRestrictionStage,
  useUpdateAdminRestrictionStage,
} from '../hooks/use-admin-restrictions'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  sort_order: z.coerce.number().int().min(0),
  action: z.string().min(1, 'Action is required.'),
  trigger_balance: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
})

type RestrictionForm = z.infer<typeof formSchema>

function toFormValue(stage: AdminRestrictionStage): RestrictionForm {
  return {
    name: stage.name,
    sort_order: stage.sort_order,
    action: stage.action,
    trigger_balance:
      stage.trigger_balance != null ? stage.trigger_balance / 100 : undefined,
    description: stage.description ?? '',
    enabled: stage.enabled,
  }
}

function toPayload(values: RestrictionForm): AdminRestrictionStageInput {
  return {
    name: values.name.trim(),
    sort_order: values.sort_order,
    action: values.action,
    trigger_balance:
      values.trigger_balance != null && values.trigger_balance > 0
        ? Math.round(values.trigger_balance * 100)
        : null,
    description: values.description ?? '',
    enabled: values.enabled ?? true,
  }
}

type AdminRestrictionActionDialogProps = {
  currentRow?: AdminRestrictionStage
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminRestrictionActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AdminRestrictionActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<RestrictionForm>({
    resolver: zodResolver(formSchema) as Resolver<RestrictionForm>,
    defaultValues: isEdit
      ? toFormValue(currentRow)
      : { name: '', sort_order: 1, action: 'restrict_write', enabled: true },
  })
  const createMutation = useCreateAdminRestrictionStage()
  const updateMutation = useUpdateAdminRestrictionStage()
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (values: RestrictionForm) => {
    const body = toPayload(values)
    if (isEdit && currentRow) {
      updateMutation.mutate(
        { stageId: currentRow.id, body },
        {
          onSuccess: () => {
            toast.success('Restriction stage updated')
            form.reset()
            onOpenChange(false)
          },
          onError: (error) => handleServerError(error),
        }
      )
      return
    }

    createMutation.mutate(body, {
      onSuccess: () => {
        toast.success('Restriction stage created')
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
          <DialogTitle>
            {isEdit ? 'Edit Restriction Stage' : 'Add Restriction Stage'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the stage here. ' : 'Create a new stage here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='admin-restriction-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Soft block'
                        autoComplete='off'
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='sort_order'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort order</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='action'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {restrictionActions.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='trigger_balance'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger balance ($)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step='0.01'
                        placeholder='Unlimited'
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='What happens at this stage?'
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='enabled'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                  <div>
                    <FormLabel className='mb-0'>Enabled</FormLabel>
                    <FormDescription>
                      Disabled stages are ignored by the enforcement engine.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='admin-restriction-form'
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
