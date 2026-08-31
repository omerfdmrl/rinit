import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type AdminUsageMetric } from '../api'

type AdminMetricsDialogType = 'add' | 'edit' | 'delete'

type AdminMetricsContextType = {
  open: AdminMetricsDialogType | null
  setOpen: (str: AdminMetricsDialogType | null) => void
  currentRow: AdminUsageMetric | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminUsageMetric | null>>
}

const AdminMetricsContext = React.createContext<AdminMetricsContextType | null>(
  null
)

export function AdminMetricsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<AdminMetricsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminUsageMetric | null>(null)

  return (
    <AdminMetricsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AdminMetricsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminMetricsContext = () => {
  const ctx = React.useContext(AdminMetricsContext)

  if (!ctx) {
    throw new Error(
      'useAdminMetricsContext has to be used within <AdminMetricsProvider>'
    )
  }

  return ctx
}
