import { AdminTeamActionDialog } from './admin-team-action-dialog'
import { AdminTeamDeleteDialog } from './admin-team-delete-dialog'
import { AdminTeamMembersDialog } from './admin-team-members-dialog'
import { useAdminTeams } from './admin-teams-provider'

export function AdminTeamsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAdminTeams()
  return (
    <>
      <AdminTeamActionDialog
        key='admin-team-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AdminTeamActionDialog
            key={`admin-team-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AdminTeamMembersDialog
            key={`admin-team-members-${currentRow.id}`}
            open={open === 'members'}
            onOpenChange={() => {
              setOpen('members')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            team={currentRow}
          />

          <AdminTeamDeleteDialog
            key={`admin-team-delete-${currentRow.id}`}
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
