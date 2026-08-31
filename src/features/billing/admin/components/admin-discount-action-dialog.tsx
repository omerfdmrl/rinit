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
import { type AdminDiscount, type AdminDiscountInput } from '../api'
import { discountDurations, discountTypes } from '../constants'
import {
  useCreateAdminDiscount,
  useUpdateAdminDiscount,
} from '../hooks/use-admin-discounts'

const formSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Name is required.'),
  discount_type: z.string().min(1, 'Type is required.'),
  amount: z.coerce.number().min(0, 'Amount cannot be negative.'),
  duration: z.string().min(1, 'Duration is required.'),
  max_uses: z.coerce.number().int().min(1).optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  active: z.boolean().optional(),
})

type DiscountForm = z.infer<typeof formSchema>

function toFormValue(discount: AdminDiscount): DiscountForm {
  return {
    code: discount.code ?? '',
    name: discount.name,
    discount_type: discount.discount_type,
    amount:
      discount.discount_type === 'percentage'
        ? discount.amount / 100
        : discount.amount / 100,
    duration: discount.duration,
    max_uses: discount.max_uses ?? undefined,
    starts_at: discount.starts_at
      ? new Date(discount.starts_at).toISOString().slice(0, 16)
      : '',
    ends_at: discount.ends_at
      ? new Date(discount.ends_at).toISOString().slice(0, 16)
      : '',
    active: discount.active,
  }
}

function toPayload(values: DiscountForm): AdminDiscountInput {
  return {
    code: values.code?.trim() || '',
    name: values.name.trim(),
    discount_type: values.discount_type,
    amount: Math.round(values.amount * 100),
    duration: values.duration,
    max_uses: values.max_uses ?? null,
    starts_at: values.starts_at
      ? new Date(values.starts_at).toISOString()
      : null,
    ends_at: values.ends_at ? new Date(values.ends_at).toISOString() : null,
    active: values.active ?? true,
  }
}

type AdminDiscountActionDialogProps = {
  currentRow?: AdminDiscount
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminDiscountActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AdminDiscountActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<DiscountForm>({
    resolver: zodResolver(formSchema) as Resolver<DiscountForm>,
    defaultValues: isEdit
      ? toFormValue(currentRow)
      : {
          code: '',
          name: '',
          discount_type: 'percentage',
          amount: 0,
          duration: 'one_cycle',
          active: true,
        },
  })
  const createMutation = useCreateAdminDiscount()
  const updateMutation = useUpdateAdminDiscount()
  const isPending = createMutation.isPending || updateMutation.isPending
  // eslint-disable-next-line react-hooks/incompatible-library
  const discountType = form.watch('discount_type')

  const onSubmit = (values: DiscountForm) => {
    const body = toPayload(values)
    if (isEdit && currentRow) {
      updateMutation.mutate(
        { discountId: currentRow.id, body },
        {
          onSuccess: () => {
            toast.success('Discount updated')
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
        toast.success('Discount created')
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
            {isEdit ? 'Edit Discount' : 'Add New Discount'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the discount here. '
              : 'Create a new discount here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='admin-discount-form'
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
                        placeholder='e.g., Launch discount'
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
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., LAUNCH20'
                        autoComplete='off'
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
                name='discount_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
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
                        {discountTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
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
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {discountType === 'percentage'
                        ? 'Percentage'
                        : 'Amount ($)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step={discountType === 'percentage' ? '1' : '0.01'}
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
                name='duration'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
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
                        {discountDurations.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
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
                name='max_uses'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max uses</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
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
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='starts_at'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starts at</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
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
                name='ends_at'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ends at</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
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
              name='active'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                  <div>
                    <FormLabel className='mb-0'>Active</FormLabel>
                    <FormDescription>
                      Inactive discounts cannot be redeemed.
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
          <Button type='submit' form='admin-discount-form' disabled={isPending}>
            {isPending && <Loader2 className='animate-spin' />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
