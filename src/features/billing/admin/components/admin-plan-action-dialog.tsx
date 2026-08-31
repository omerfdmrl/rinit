import { z } from 'zod'
import { useFieldArray, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
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
import { type AdminPlan, type AdminPlanInput } from '../api'
import { featureValueTypes, intervalTypes, pricingModels } from '../constants'
import {
  useCreateAdminPlan,
  useUpdateAdminPlan,
} from '../hooks/use-admin-plans'

const featureSchema = z.object({
  feature_key: z.string().min(1, 'Required'),
  value_type: z.string().min(1, 'Required'),
  value: z.string().optional(),
  unlimited: z.boolean().optional(),
})

const metricSchema = z.object({
  metric_key: z.string().min(1, 'Required'),
  pricing_model: z.string().min(1, 'Required'),
  included_amount: z.coerce.number().min(0).optional(),
  unit_price: z.coerce.number().min(0).optional(),
  package_size: z.coerce.number().int().min(1).optional(),
  unlimited: z.boolean().optional(),
})

const formSchema = z.object({
  code: z.string().min(1, 'Code is required.'),
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
  interval_type: z.string().min(1, 'Billing interval is required.'),
  interval_days: z.coerce.number().int().min(1).optional(),
  price_amount: z.coerce
    .number()
    .min(0, 'Price cannot be negative.')
    .optional(),
  currency: z.string().min(1, 'Currency is required.'),
  trial_days: z.coerce.number().int().min(0).optional(),
  negative_balance_limit: z.coerce.number().min(0).optional(),
  is_addon: z.boolean().optional(),
  is_default: z.boolean().optional(),
  features: z.array(featureSchema),
  metrics: z.array(metricSchema),
})

type PlanForm = z.infer<typeof formSchema>

function toFormValue(plan: AdminPlan): PlanForm {
  return {
    code: plan.code,
    name: plan.name,
    description: plan.description ?? '',
    interval_type: plan.interval_type,
    interval_days: plan.interval_days > 0 ? plan.interval_days : undefined,
    price_amount: plan.price_amount / 100,
    currency: plan.currency || 'USD',
    trial_days: plan.trial_days,
    negative_balance_limit:
      plan.negative_balance_limit != null
        ? plan.negative_balance_limit / 100
        : undefined,
    is_addon: plan.is_addon,
    is_default: plan.is_default,
    features: (plan.features ?? []).map((f) => ({
      feature_key: f.feature_key,
      value_type: f.value_type,
      value:
        f.value_type === 'number'
          ? (f.value_number?.toString() ?? '')
          : f.value_type === 'bool'
            ? (f.value_bool?.toString() ?? '')
            : f.value_type === 'json'
              ? (f.value_json ?? '')
              : (f.value_string ?? ''),
      unlimited: f.unlimited ?? false,
    })),
    metrics: (plan.metrics ?? []).map((m) => ({
      metric_key: m.metric_key,
      pricing_model: m.pricing_model,
      included_amount: m.included_amount,
      unit_price: m.unit_price / 100,
      package_size: m.package_size || 1,
      unlimited: m.unlimited ?? false,
    })),
  }
}

function toPayload(values: PlanForm): AdminPlanInput {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description ?? '',
    interval_type: values.interval_type,
    interval_days: values.interval_days ?? 0,
    price_amount: Math.round((values.price_amount ?? 0) * 100),
    currency: values.currency.trim().toUpperCase(),
    trial_days: values.trial_days ?? 0,
    negative_balance_limit:
      values.negative_balance_limit != null && values.negative_balance_limit > 0
        ? Math.round(values.negative_balance_limit * 100)
        : null,
    is_addon: values.is_addon ?? false,
    is_default: values.is_default ?? false,
    features: values.features.map((f) => {
      const value = f.value ?? ''
      let valueBool = false
      let valueNumber = 0
      let valueString = ''
      let valueJSON = ''
      switch (f.value_type) {
        case 'bool':
          valueBool = value === 'true'
          break
        case 'number':
          valueNumber = Number(value) || 0
          break
        case 'json':
          valueJSON = value
          break
        default:
          valueString = value
      }
      return {
        feature_key: f.feature_key.trim(),
        value_type: f.value_type,
        value_bool: valueBool,
        value_number: valueNumber,
        value_string: valueString,
        value_json: valueJSON,
        unlimited: f.unlimited ?? false,
      }
    }),
    metrics: values.metrics.map((m) => ({
      metric_key: m.metric_key.trim(),
      pricing_model: m.pricing_model,
      included_amount: m.included_amount ?? 0,
      unit_price: Math.round((m.unit_price ?? 0) * 100),
      package_size: m.package_size ?? 1,
      unlimited: m.unlimited ?? false,
      billing_type: 'instant',
    })),
  }
}

type AdminPlanActionDialogProps = {
  currentRow?: AdminPlan
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminPlanActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AdminPlanActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<PlanForm>({
    resolver: zodResolver(formSchema) as Resolver<PlanForm>,
    defaultValues: isEdit
      ? toFormValue(currentRow)
      : {
          code: '',
          name: '',
          description: '',
          interval_type: 'monthly',
          currency: 'USD',
          trial_days: 0,
          price_amount: 0,
          is_addon: false,
          is_default: false,
          features: [],
          metrics: [],
        },
  })

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({ control: form.control, name: 'features' })
  const {
    fields: metricFields,
    append: appendMetric,
    remove: removeMetric,
  } = useFieldArray({ control: form.control, name: 'metrics' })

  const createMutation = useCreateAdminPlan()
  const updateMutation = useUpdateAdminPlan()
  const isPending = createMutation.isPending || updateMutation.isPending
  // eslint-disable-next-line react-hooks/incompatible-library
  const intervalType = form.watch('interval_type')

  const onSubmit = (values: PlanForm) => {
    const body = toPayload(values)
    if (isEdit && currentRow) {
      updateMutation.mutate(
        { planId: currentRow.id, body },
        {
          onSuccess: () => {
            toast.success('Plan updated')
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
        toast.success('Plan created')
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
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the plan configuration here. '
              : 'Create a new billing plan here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='admin-plan-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
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
                        placeholder='e.g., Pro'
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
                        placeholder='e.g., pro'
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

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='What does this plan include?'
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='interval_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing interval</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select interval' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {intervalTypes.map((i) => (
                          <SelectItem key={i.value} value={i.value}>
                            {i.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {intervalType === 'custom' && (
                <FormField
                  control={form.control}
                  name='interval_days'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval days</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={1}
                          placeholder='e.g., 45'
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name='price_amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (per interval)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step='0.01'
                        placeholder='0.00'
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
                name='currency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='USD'
                        maxLength={3}
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
                name='trial_days'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trial days</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        placeholder='0'
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
                name='negative_balance_limit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Negative balance limit</FormLabel>
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

            <div className='flex gap-8'>
              <FormField
                control={form.control}
                name='is_addon'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2 space-y-0'>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormLabel className='mb-0'>Addon plan</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='is_default'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2 space-y-0'>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormLabel className='mb-0'>Default plan</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-3 rounded-lg border p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Features</p>
                  <p className='text-xs text-muted-foreground'>
                    Entitlements granted to subscribers of this plan.
                  </p>
                </div>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    appendFeature({
                      feature_key: '',
                      value_type: 'number',
                      value: '',
                      unlimited: false,
                    })
                  }
                >
                  <Plus size={16} /> Add feature
                </Button>
              </div>
              {featureFields.length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No features yet.
                </p>
              )}
              {featureFields.map((field, index) => (
                <div
                  key={field.id}
                  className='grid grid-cols-12 items-start gap-2'
                >
                  <FormField
                    control={form.control}
                    name={`features.${index}.feature_key`}
                    render={({ field }) => (
                      <FormItem className='col-span-4'>
                        <FormControl>
                          <Input
                            placeholder='feature key'
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`features.${index}.value_type`}
                    render={({ field }) => (
                      <FormItem className='col-span-3'>
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
                            {featureValueTypes.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`features.${index}.value`}
                    render={({ field }) => (
                      <FormItem className='col-span-4'>
                        <FormControl>
                          <Input
                            placeholder='value'
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='col-span-1 size-8 text-red-500'
                    onClick={() => removeFeature(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>

            <div className='space-y-3 rounded-lg border p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Metered pricing</p>
                  <p className='text-xs text-muted-foreground'>
                    Usage metrics and how they are billed.
                  </p>
                </div>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    appendMetric({
                      metric_key: '',
                      pricing_model: 'per_unit',
                      included_amount: 0,
                      unit_price: 0,
                      package_size: 1,
                      unlimited: false,
                    })
                  }
                >
                  <Plus size={16} /> Add metric
                </Button>
              </div>
              {metricFields.length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No metered pricing yet.
                </p>
              )}
              {metricFields.map((field, index) => (
                <div
                  key={field.id}
                  className='grid grid-cols-12 items-start gap-2'
                >
                  <FormField
                    control={form.control}
                    name={`metrics.${index}.metric_key`}
                    render={({ field }) => (
                      <FormItem className='col-span-3'>
                        <FormControl>
                          <Input
                            placeholder='metric key'
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`metrics.${index}.pricing_model`}
                    render={({ field }) => (
                      <FormItem className='col-span-3'>
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
                            {pricingModels.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`metrics.${index}.included_amount`}
                    render={({ field }) => (
                      <FormItem className='col-span-2'>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            placeholder='included'
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`metrics.${index}.unit_price`}
                    render={({ field }) => (
                      <FormItem className='col-span-2'>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            step='0.01'
                            placeholder='unit $'
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`metrics.${index}.package_size`}
                    render={({ field }) => (
                      <FormItem className='col-span-1'>
                        <FormControl>
                          <Input
                            type='number'
                            min={1}
                            placeholder='size'
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='col-span-1 size-8 text-red-500'
                    onClick={() => removeMetric(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>

            <FormDescription className='text-xs'>
              Price and unit price are entered in dollars and stored as cents.
            </FormDescription>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='admin-plan-form' disabled={isPending}>
            {isPending && <Loader2 className='animate-spin' />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
