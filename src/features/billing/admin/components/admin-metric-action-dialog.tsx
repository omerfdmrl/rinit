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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type AdminUsageMetric } from '../api'
import { aggregationTypes } from '../constants'
import {
  useCreateAdminMetric,
  useUpdateAdminMetric,
  type AdminMetricBody,
} from '../hooks/use-admin-metrics'

const formSchema = z.object({
  key: z.string().min(1, 'Key is required.'),
  name: z.string().min(1, 'Name is required.'),
  unit: z.string().min(1, 'Unit is required.'),
  aggregation_type: z.string().min(1, 'Aggregation is required.'),
})

type MetricForm = z.infer<typeof formSchema>

type AdminMetricActionDialogProps = {
  currentRow?: AdminUsageMetric
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminMetricActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AdminMetricActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<MetricForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          key: currentRow.key,
          name: currentRow.name,
          unit: currentRow.unit,
          aggregation_type: currentRow.aggregation_type,
        }
      : { key: '', name: '', unit: 'count', aggregation_type: 'sum' },
  })
  const createMutation = useCreateAdminMetric()
  const updateMutation = useUpdateAdminMetric()
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (values: MetricForm) => {
    const body: AdminMetricBody = values
    if (isEdit && currentRow) {
      updateMutation.mutate(
        { metricId: currentRow.id, body },
        {
          onSuccess: () => {
            toast.success('Metric updated')
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
        toast.success('Metric created')
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
          <DialogTitle>{isEdit ? 'Edit Metric' : 'Add New Metric'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the usage metric here. '
              : 'Create a new usage metric here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='admin-metric-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., API calls'
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
              name='key'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., api_calls'
                      autoComplete='off'
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
                name='unit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='count'
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
                name='aggregation_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aggregation</FormLabel>
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
                        {aggregationTypes.map((a) => (
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
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='admin-metric-form' disabled={isPending}>
            {isPending && <Loader2 className='animate-spin' />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
