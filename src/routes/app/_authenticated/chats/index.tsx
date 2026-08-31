import { createFileRoute } from '@tanstack/react-router'
import { Chats } from '@/features/chats'

export const Route = createFileRoute('/app/_authenticated/chats/')({
  component: Chats,
})
