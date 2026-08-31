import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center'>
      <div className='mx-auto max-w-2xl space-y-8'>
        <h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>
          Welcome to <span className='text-primary'>Rinit</span>
        </h1>
        <p className='text-lg text-muted-foreground'>
          A powerful platform to manage your tasks, apps, and team — all in one
          place.
        </p>
        <div className='flex items-center justify-center gap-4'>
          <Button asChild size='lg'>
            <Link to='/auth/sign-in'>Sign In</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link to='/auth/sign-up'>Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
