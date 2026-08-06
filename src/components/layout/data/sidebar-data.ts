import {
  LayoutDashboard,
  ListTodo,
  Package,
  Shield,
  Users,
  MessagesSquare,
} from 'lucide-react'
import { adminUserPermissions } from '@/features/users/hooks/use-admin-permissions'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
      ],
    },
    {
      title: 'Admin',
      items: [
        {
          title: 'Users',
          url: '/admin/users',
          icon: Shield,
          permission: adminUserPermissions.list,
        },
      ],
    },
  ],
}
