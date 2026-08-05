import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'
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
import { PasswordInput } from '@/components/password-input'
import { meQueryKey } from '@/features/auth/api'
import { updateEmailInit, updateEmailVerify } from '../api'

type EmailFormValues = {
  new_email: string
  password: string
  two_factor_code: string
  token: string
}

export function AccountEmailForm() {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()
  const twoFactorEnabled = auth.user?.two_factor_enabled ?? false
  const [step, setStep] = useState<'init' | 'verify'>('init')
  const [pendingEmail, setPendingEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const resolver = useMemo<Resolver<Partial<EmailFormValues>>>(() => {
    if (step === 'verify') {
      return zodResolver(
        z.object({
          token: z
            .string()
            .min(32, 'Please enter the verification token from your email.'),
        })
      ) as Resolver<Partial<EmailFormValues>>
    }

    return zodResolver(
      z
        .object({
          new_email: z.email({
            error: (iss) =>
              iss.input === '' ? 'Please enter your new email.' : undefined,
          }),
          password: z.string().optional(),
          two_factor_code: z.string().optional(),
        })
        .refine((data) => data.password || data.two_factor_code, {
          message: twoFactorEnabled
            ? 'Please enter your two-factor authentication code.'
            : 'Please enter your password.',
          path: [twoFactorEnabled ? 'two_factor_code' : 'password'],
        })
    ) as Resolver<Partial<EmailFormValues>>
  }, [step, twoFactorEnabled])

  const form = useForm<Partial<EmailFormValues>>({
    resolver,
    defaultValues: {
      new_email: auth.user?.email ?? '',
      password: '',
      two_factor_code: '',
      token: '',
    },
  })

  async function onInitSubmit(data: Partial<EmailFormValues>) {
    setIsLoading(true)

    try {
      const res = await updateEmailInit({
        new_email: data.new_email!,
        ...(twoFactorEnabled
          ? { two_factor_code: data.two_factor_code ?? '' }
          : { password: data.password ?? '' }),
      })
      toast.success(res.message)
      setPendingEmail(data.new_email!)
      form.setValue('token', '')
      setStep('verify')
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onVerifySubmit(data: Partial<EmailFormValues>) {
    const previous = auth.user
    if (!previous) return

    const newEmail = pendingEmail || previous.email
    setIsLoading(true)
    auth.setUser({ ...previous, email: newEmail })

    try {
      const res = await updateEmailVerify({ token: data.token! })
      const updated = { ...previous, email: newEmail }
      queryClient.setQueryData(meQueryKey, { user: updated })
      toast.success(res.message)
      form.reset({
        new_email: newEmail,
        password: '',
        two_factor_code: '',
        token: '',
      })
      setStep('init')
    } catch (error) {
      auth.setUser(previous)
      handleServerError(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'verify') {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onVerifySubmit)}
          className='space-y-8'
        >
          <FormField
            control={form.control}
            name='token'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification token</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Paste the token sent to your new email'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the verification token you received at your new email
                  address.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setStep('init')}
              disabled={isLoading}
            >
              <ArrowLeft />
              Back
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? <Loader2 className='animate-spin' /> : <Mail />}
              Verify email
            </Button>
          </div>
        </form>
      </Form>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onInitSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='new_email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormDescription>
                A verification code will be sent to the new email address.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {twoFactorEnabled ? (
          <FormField
            control={form.control}
            name='two_factor_code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Two-factor code</FormLabel>
                <FormControl>
                  <Input placeholder='6-digit code' maxLength={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='********' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type='submit' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <Mail />}
          Send verification code
        </Button>
      </form>
    </Form>
  )
}
