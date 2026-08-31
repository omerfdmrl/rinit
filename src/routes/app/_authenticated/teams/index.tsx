import { createFileRoute } from '@tanstack/react-router'
import { Teams } from '@/features/teams'

export const Route = createFileRoute('/app/_authenticated/teams/')({
  component: Teams,
})
