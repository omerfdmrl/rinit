import { createFileRoute } from '@tanstack/react-router'
import { TeamPlans } from '@/features/teams/plans'

export const Route = createFileRoute('/app/_authenticated/teams/plans')({
  component: TeamPlans,
})
