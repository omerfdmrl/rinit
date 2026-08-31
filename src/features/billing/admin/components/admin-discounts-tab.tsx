import { getRouteApi } from '@tanstack/react-router'
import { AdminDiscountsDialogs } from './admin-discounts-dialogs'
import { AdminDiscountsPrimaryButtons } from './admin-discounts-primary-buttons'
import { AdminDiscountsProvider } from './admin-discounts-provider'
import { AdminDiscountsTable } from './admin-discounts-table'

const route = getRouteApi('/_authenticated/admin/billing/')

export function AdminDiscountsTab() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <AdminDiscountsProvider>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Discounts</h2>
          <p className='text-muted-foreground'>
            Promo codes and discounts that can be applied to subscriptions.
          </p>
        </div>
        <AdminDiscountsPrimaryButtons />
      </div>
      <AdminDiscountsTable search={search} navigate={navigate} />
      <AdminDiscountsDialogs />
    </AdminDiscountsProvider>
  )
}
