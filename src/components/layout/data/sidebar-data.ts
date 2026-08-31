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
        {
          title: 'Roles',
          url: '/admin/roles',
          icon: ShieldCheck,
          permission: adminRolePermissions.list,
        },
        {
          title: 'Teams',
          url: '/admin/teams',
          icon: Building2,
          permission: adminTeamPermissions.list,
        },
        {
          title: 'Billing',
          url: '/admin/billing',
          icon: CreditCard,
          permission: adminBillingPermissions.plans.list,
        },
      ],
    },
  ],
}
