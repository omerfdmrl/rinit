import { AdminPlanActionDialog } from './admin-plan-action-dialog'
import { AdminPlanDeleteDialog } from './admin-plan-delete-dialog'
import { useAdminPlansContext } from './admin-plans-provider'

export function AdminPlansDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAdminPlansContext()
  return (
    <>
      <AdminPlanActionDialog
        key='admin-plan-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AdminPlanActionDialog
            key={`admin-plan-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AdminPlanDeleteDialog
            key={`admin-plan-delete-${currentRow.id}`}
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
