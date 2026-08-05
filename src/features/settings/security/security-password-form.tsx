import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { updatePassword } from '../api'

type PasswordFormValues = {
  current_password: string
  new_password: string
  confirm_password: string
  two_factor_code: string
}

export function SecurityPasswordForm() {
  const { auth } = useAuthStore()
  const twoFactorEnabled = auth.user?.two_factor_enabled ?? false
  const [isLoading, setIsLoading] = useState(false)

  const resolver = useMemo<Resolver<PasswordFormValues>>(
    () =>
      zodResolver(
        z
          .object({
            current_password: z.string().optional(),
            new_password: z
              .string()
              .min(1, 'Please enter a new password.')
              .min(8, 'Password must be at least 8 characters long.'),
            confirm_password: z
              .string()
              .min(1, 'Please confirm your new password.'),
            two_factor_code: z.string().optional(),
          })
          .refine((data) => data.current_password || data.two_factor_code, {
            message: twoFactorEnabled
              ? 'Please enter your two-factor authentication code.'
              : 'Please enter your current password.',
            path: [twoFactorEnabled ? 'two_factor_code' : 'current_password'],
          })
          .refine((data) => data.new_password === data.confirm_password, {
            message: "Passwords don't match.",
            path: ['confirm_password'],
          })
      ) as Resolver<PasswordFormValues>,
    [twoFactorEnabled]
  )

  const form = useForm<PasswordFormValues>({
    resolver,
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
      two_factor_code: '',
    },
  })

  async function onSubmit(data: PasswordFormValues) {
    setIsLoading(true)

    try {
      const res = await updatePassword({
        new_password: data.new_password,
        ...(twoFactorEnabled
          ? { two_factor_code: data.two_factor_code }
          : { current_password: data.current_password }),
      })
      toast.success(res.message)
      form.reset()
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {twoFactorEnabled ? (
          <FormField
            control={form.control}
            name='two_factor_code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Two-factor code</FormLabel>
                <FormControl>
                  <Input
                    placeholder='6-digit code'
                    maxLength={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name='current_password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='********' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name='new_password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirm_password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <KeyRound />}
          Update password
        </Button>
      </form>
    </Form>
  )
}