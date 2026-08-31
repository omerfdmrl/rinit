import { AdminDiscountActionDialog } from './admin-discount-action-dialog'
import { AdminDiscountDeleteDialog } from './admin-discount-delete-dialog'
import { useAdminDiscountsContext } from './admin-discounts-provider'

export function AdminDiscountsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } =
    useAdminDiscountsContext()
  return (
    <>
      <AdminDiscountActionDialog
        key='admin-discount-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AdminDiscountActionDialog
            key={`admin-discount-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AdminDiscountDeleteDialog
            key={`admin-discount-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
