import { AdminRestrictionActionDialog } from './admin-restriction-action-dialog'
import { AdminRestrictionDeleteDialog } from './admin-restriction-delete-dialog'
import { useAdminRestrictionsContext } from './admin-restrictions-provider'

export function AdminRestrictionsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } =
    useAdminRestrictionsContext()
  return (
    <>
      <AdminRestrictionActionDialog
        key='admin-restriction-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AdminRestrictionActionDialog
            key={`admin-restriction-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AdminRestrictionDeleteDialog
            key={`admin-restriction-delete-${currentRow.id}`}
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
