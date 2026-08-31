import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/_authenticated/settings/')({
  beforeLoad: () => {
    throw redirect({ to: '/app/settings/account' })
  },
})