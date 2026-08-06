import { useAuthStore } from '@/stores/auth-store'
import { type NavItem } from './types'

type NavVisibilityContext = {
  permissions: string[]
  pathname: string
}

const ADMIN_PATH = '/admin'

function hasPermission(permission: string | undefined, permissions: string[]) {
  return !permission || permissions.includes(permission)
}

function isAdminScoped(url: string | undefined) {
  return !!url && url.startsWith(ADMIN_PATH)
}

/**
 * Filters nav items by the current user's RBAC permissions and URL scope.
 *
 * Items with a `permission` are hidden when the user lacks it. Admin-scoped
 * items (url starting with `/admin`) are only shown while on an admin page.
 */
export function filterNavItems(
  items: NavItem[],
  { permissions, pathname }: NavVisibilityContext
): NavItem[] {
  const onAdminPath = pathname.startsWith(ADMIN_PATH)

  const visible = items.map((item) => {
    if (item.items) {
      const subItems = item.items.filter(
        (sub) =>
          hasPermission(sub.permission, permissions) &&
          (!isAdminScoped(sub.url) || onAdminPath)
      )
      if (subItems.length === 0) return null
      return { ...item, items: subItems }
    }

    if (!hasPermission(item.permission, permissions)) return null
    if (isAdminScoped(item.url) && !onAdminPath) return null
    return item
  })

  return visible.filter((item): item is NavItem => item !== null)
}

export function useNavVisibility(): NavVisibilityContext {
  const permissions =
    useAuthStore((state) => state.auth.user?.permissions) ?? []
  return { permissions, pathname: window.location.pathname }
}
