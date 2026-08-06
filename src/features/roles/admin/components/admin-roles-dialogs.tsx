import { AdminRoleActionDialog } from './admin-role-action-dialog'
import { AdminRoleDeleteDialog } from './admin-role-delete-dialog'
import { AdminRolePermissionsDialog } from './admin-role-permissions-dialog'
import { useAdminRoles } from './admin-roles-provider'

export function AdminRolesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAdminRoles()
  return (
    <>
      <AdminRoleActionDialog
        key='admin-role-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AdminRoleActionDialog
            key={`admin-role-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AdminRolePermissionsDialog
            key={`admin-role-permissions-${currentRow.id}`}
            open={open === 'permissions'}
            onOpenChange={() => {
              setOpen('permissions')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            role={currentRow}
          />

          <AdminRoleDeleteDialog
            key={`admin-role-delete-${currentRow.id}`}
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
