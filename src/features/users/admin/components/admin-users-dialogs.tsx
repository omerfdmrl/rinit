import { AdminUserActionDialog } from './admin-user-action-dialog'
import { AdminUserDeleteDialog } from './admin-user-delete-dialog'
import { useAdminUsers } from './admin-users-provider'

export function AdminUsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAdminUsers()
  return (
    <>
      <AdminUserActionDialog
        key='admin-user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AdminUserActionDialog
            key={`admin-user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AdminUserDeleteDialog
            key={`admin-user-delete-${currentRow.id}`}
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
