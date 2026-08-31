import {
  Building2,
  LayoutDashboard,
  ListTodo,
  Package,
  Shield,
  ShieldCheck,
  Users,
  MessagesSquare,
  CreditCard,
} from 'lucide-react'
import { adminRolePermissions } from '@/features/roles/hooks/use-admin-permissions'
import { adminTeamPermissions } from '@/features/teams/admin/hooks/use-admin-team-permissions'
import { adminUserPermissions } from '@/features/users/hooks/use-admin-permissions'
import { type SidebarData } from '../types'
import { adminBillingPermissions } from '@/features/billing/admin/hooks/use-admin-billing-permissions'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/app',
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/app/tasks',
          icon: ListTodo,
        },
        {
          title: 'Apps',
          url: '/app/apps',
          icon: Package,
        },
        {
          title: 'Chats',
          url: '/app/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/app/users',
          icon: Users,
        },
      ],
    },
    {
      title: 'Admin',
      items: [
        {
          title: 'Users',
          url: '/app/admin/users',
          icon: Shield,
          permission: adminUserPermissions.list,
        },
        {
          title: 'Roles',
          url: '/app/admin/roles',
          icon: ShieldCheck,
          permission: adminRolePermissions.list,
        },
        {
          title: 'Teams',
          url: '/app/admin/teams',
          icon: Building2,
          permission: adminTeamPermissions.list,
        },
        {
          title: 'Billing',
          url: '/app/admin/billing',
          icon: CreditCard,
          permission: adminBillingPermissions.plans.list,
        },
      ],
    },
  ],
}
