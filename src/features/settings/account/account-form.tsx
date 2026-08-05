import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'
import { meQueryKey } from '@/features/auth/api'
import { Button } from '@/components/ui/button'
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
import { updateName } from '../api'

const nameFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(30, 'Name must not be longer than 30 characters.'),
})

export function AccountForm() {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof nameFormSchema>>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: auth.user?.name ?? '',
    },
  })

  async function onSubmit(data: z.infer<typeof nameFormSchema>) {
    const previous = auth.user
    if (!previous) return

    setIsLoading(true)
    auth.setUser({ ...previous, name: data.name })

    try {
      const res = await updateName({ name: data.name })
      auth.setUser(res.user)
      queryClient.setQueryData(meQueryKey, { user: res.user })
      form.reset({ name: res.user.name })
      toast.success(res.message)
    } catch (error) {
      auth.setUser(previous)
      handleServerError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Your name' {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed on your profile and in
                emails.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <UserRound />}
          Update name
        </Button>
      </form>
    </Form>
  )
}