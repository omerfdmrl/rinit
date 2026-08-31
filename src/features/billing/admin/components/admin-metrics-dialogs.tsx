import { AdminMetricActionDialog } from './admin-metric-action-dialog'
import { AdminMetricDeleteDialog } from './admin-metric-delete-dialog'
import { useAdminMetricsContext } from './admin-metrics-provider'

export function AdminMetricsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAdminMetricsContext()
  return (
    <>
      <AdminMetricActionDialog
        key='admin-metric-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AdminMetricActionDialog
            key={`admin-metric-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AdminMetricDeleteDialog
            key={`admin-metric-delete-${currentRow.id}`}
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
