import { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Shield,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import QRCode from 'qrcode'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PasswordInput } from '@/components/password-input'
import { meQueryKey } from '@/features/auth/api'
import { enable2FA, verify2FA, disable2FA } from '../api'

type SetupStep = 'method' | 'scan' | 'verify'

type VerifyFormValues = {
  code: string
}

type DisableFormValues = {
  password: string
  two_factor_code: string
}

function StepIndicator({ currentStep }: { currentStep: SetupStep }) {
  const steps = [
    { key: 'method', label: 'Method' },
    { key: 'scan', label: 'Scan' },
    { key: 'verify', label: 'Verify' },
  ] as const

  const stepOrder: Record<SetupStep, number> = { method: 0, scan: 1, verify: 2 }
  const currentIndex = stepOrder[currentStep]

  return (
    <div className='flex items-center justify-between gap-0'>
      {steps.map((step, i) => {
        const isCompleted = i < currentIndex
        const isActive = i === currentIndex

        return (
          <div key={step.key} className='flex items-center'>
            <div className='flex flex-col items-center gap-1.5'>
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-2 border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className='size-4' /> : i + 1}
              </div>
              <span
                className={`text-xs transition-colors duration-300 ${
                  isActive || isCompleted
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 mb-5 h-0.5 w-12 transition-colors duration-500 sm:w-20 ${
                  i < currentIndex ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function SetupDialog({
  open,
  onOpenChange,
  onEnabled,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEnabled: () => void
}) {
  const [step, setStep] = useState<SetupStep>('method')
  const [secret, setSecret] = useState('')
  const [qrCodeDataUri, setQrCodeDataUri] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(
      z.object({
        code: z.string().min(6, 'Please enter the 6-digit code.').max(6),
      })
    ) as Resolver<VerifyFormValues>,
    defaultValues: { code: '' },
  })

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) {
        setStep('method')
        setSecret('')
        setQrCodeDataUri('')
        verifyForm.reset()
      }
      onOpenChange(value)
    },
    [onOpenChange, verifyForm]
  )

  async function handleStartSetup() {
    setIsGeneratingQR(true)
    try {
      const res = await enable2FA()
      setSecret(res.secret)
      const dataUri = await QRCode.toDataURL(res.qr_code, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      setQrCodeDataUri(dataUri)
      setStep('scan')
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsGeneratingQR(false)
    }
  }

  async function handleVerify(data: VerifyFormValues) {
    setIsLoading(true)
    try {
      const res = await verify2FA({ code: data.code })
      toast.success(res.message)
      handleOpenChange(false)
      onEnabled()
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsLoading(false)
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret)
    toast.success('Secret copied to clipboard')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='gap-6 sm:max-w-lg'>
        <DialogHeader className='gap-3'>
          <DialogTitle className='flex items-center gap-2 text-left'>
            <Shield className='size-5' />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription className='text-left'>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={step} />

        {step === 'method' && (
          <div className='space-y-4'>
            <div>
              <h3 className='text-base font-semibold'>
                Choose verification method
              </h3>
              <p className='text-sm text-muted-foreground'>
                Select how you'd like to receive verification codes
              </p>
            </div>
            <div className='rounded-lg border border-emerald-500/50 bg-emerald-500/5 p-4'>
              <div className='flex items-start gap-3'>
                <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted'>
                  <Smartphone className='size-5' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>Authenticator App</span>
                    <Badge variant='secondary' className='text-[10px]'>
                      Recommended
                    </Badge>
                  </div>
                  <p className='mt-0.5 text-sm text-muted-foreground'>
                    Use Google Authenticator, Authy, or 1Password to generate
                    time-based codes
                  </p>
                </div>
                <div className='mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500'>
                  <Check className='size-3 text-emerald-500' />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'scan' && (
          <div className='space-y-4'>
            <div>
              <h3 className='text-base font-semibold'>
                Scan with your authenticator app
              </h3>
              <p className='text-sm text-muted-foreground'>
                Open your authenticator app, tap the + icon, and scan this code
              </p>
            </div>
            <div className='flex flex-col items-center gap-4'>
              <div className='rounded-xl bg-white p-4'>
                {isGeneratingQR ? (
                  <div className='flex size-[200px] items-center justify-center'>
                    <Loader2 className='size-8 animate-spin text-muted-foreground' />
                  </div>
                ) : (
                  <img
                    src={qrCodeDataUri}
                    alt='QR Code for 2FA setup'
                    className='size-[200px]'
                  />
                )}
              </div>
              <div className='w-full space-y-2'>
                <p className='text-center text-sm text-muted-foreground'>
                  Or enter this key manually
                </p>
                <div className='flex items-center gap-2'>
                  <div className='flex-1 rounded-lg border bg-muted/50 px-4 py-2.5 font-mono text-sm tracking-widest'>
                    {secret}
                  </div>
                  <Button
                    variant='outline'
                    size='icon'
                    className='shrink-0'
                    onClick={copySecret}
                  >
                    <Copy className='size-4' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className='space-y-4'>
            <div className='flex flex-col items-center gap-2'>
              <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
                <KeyRound className='size-6 text-muted-foreground' />
              </div>
              <h3 className='text-base font-semibold'>
                Enter verification code
              </h3>
              <p className='text-center text-sm text-muted-foreground'>
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
            <Form {...verifyForm}>
              <form
                id='verify-2fa-form'
                onSubmit={verifyForm.handleSubmit(handleVerify)}
                className='space-y-4'
              >
                <FormField
                  control={verifyForm.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem className='flex flex-col items-center'>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className='text-center text-xs text-muted-foreground'>
                  Code refreshes every 30 seconds
                </p>
              </form>
            </Form>
          </div>
        )}

        <DialogFooter className='flex-row gap-2 sm:gap-2'>
          {step === 'method' && (
            <>
              <Button
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isGeneratingQR}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartSetup}
                disabled={isGeneratingQR}
                className='flex-1 sm:flex-none'
              >
                {isGeneratingQR ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  'Continue'
                )}
              </Button>
            </>
          )}
          {step === 'scan' && (
            <>
              <Button variant='outline' onClick={() => setStep('method')}>
                <ArrowLeft />
                Back
              </Button>
              <Button
                onClick={() => setStep('verify')}
                className='flex-1 sm:flex-none'
              >
                I've scanned the code
              </Button>
            </>
          )}
          {step === 'verify' && (
            <>
              <Button
                variant='outline'
                onClick={() => setStep('scan')}
                disabled={isLoading}
              >
                <ArrowLeft />
                Back
              </Button>
              <Button
                type='submit'
                form='verify-2fa-form'
                disabled={isLoading}
                className='flex-1 sm:flex-none'
              >
                {isLoading ? <Loader2 className='animate-spin' /> : null}
                Verify & Enable
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DisableDialog({
  open,
  onOpenChange,
  onDisabled,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDisabled: () => void
}) {
  const { auth } = useAuthStore()
  const twoFactorEnabled = auth.user?.two_factor_enabled ?? false
  const [isLoading, setIsLoading] = useState(false)

  const resolver = useMemo<Resolver<DisableFormValues>>(
    () =>
      zodResolver(
        z
          .object({
            password: z.string().optional(),
            two_factor_code: z.string().optional(),
          })
          .refine((data) => data.password || data.two_factor_code, {
            message: twoFactorEnabled
              ? 'Please enter your two-factor authentication code.'
              : 'Please enter your password.',
            path: [twoFactorEnabled ? 'two_factor_code' : 'password'],
          })
      ) as Resolver<DisableFormValues>,
    [twoFactorEnabled]
  )

  const form = useForm<DisableFormValues>({
    resolver,
    defaultValues: { password: '', two_factor_code: '' },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  async function onSubmit(data: DisableFormValues) {
    setIsLoading(true)
    try {
      const res = await disable2FA({
        ...(twoFactorEnabled
          ? { two_factor_code: data.two_factor_code }
          : { password: data.password }),
      })
      toast.success(res.message)
      onOpenChange(false)
      onDisabled()
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Disable Two-Factor Authentication'
      desc='This will reduce the security of your account. You will need to provide your identity to confirm this action.'
      confirmText='Disable'
      destructive
      isLoading={isLoading}
      form='disable-2fa-form'
    >
      <Form {...form}>
        <form
          id='disable-2fa-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
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
        </form>
      </Form>
    </ConfirmDialog>
  )
}

export function Security2FAForm() {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()
  const twoFactorEnabled = auth.user?.two_factor_enabled ?? false
  const [setupOpen, setSetupOpen] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)

  function handleEnabled() {
    const user = auth.user
    if (user) {
      const updated = { ...user, two_factor_enabled: true }
      auth.setUser(updated)
      queryClient.setQueryData(meQueryKey, { user: updated })
    }
  }

  function handleDisabled() {
    const user = auth.user
    if (user) {
      const updated = { ...user, two_factor_enabled: false }
      auth.setUser(updated)
      queryClient.setQueryData(meQueryKey, { user: updated })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='size-5' />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Status:</span>
            {twoFactorEnabled ? (
              <Badge
                variant='default'
                className='bg-emerald-500 hover:bg-emerald-600'
              >
                <ShieldCheck className='size-3' />
                Enabled
              </Badge>
            ) : (
              <Badge variant='outline'>Disabled</Badge>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {twoFactorEnabled ? (
            <Button variant='destructive' onClick={() => setDisableOpen(true)}>
              Disable 2FA
            </Button>
          ) : (
            <Button onClick={() => setSetupOpen(true)}>
              <ShieldCheck className='size-4' />
              Enable 2FA
            </Button>
          )}
        </CardFooter>
      </Card>

      <SetupDialog
        open={setupOpen}
        onOpenChange={setSetupOpen}
        onEnabled={handleEnabled}
      />
      <DisableDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        onDisabled={handleDisabled}
      />
    </>
  )
}
