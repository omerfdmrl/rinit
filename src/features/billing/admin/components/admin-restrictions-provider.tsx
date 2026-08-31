import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type AdminRestrictionStage } from '../api'

type AdminRestrictionsDialogType = 'add' | 'edit' | 'delete'

type AdminRestrictionsContextType = {
  open: AdminRestrictionsDialogType | null
  setOpen: (str: AdminRestrictionsDialogType | null) => void
  currentRow: AdminRestrictionStage | null
  setCurrentRow: React.Dispatch<
    React.SetStateAction<AdminRestrictionStage | null>
  >
}

const AdminRestrictionsContext =
  React.createContext<AdminRestrictionsContextType | null>(null)

export function AdminRestrictionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<AdminRestrictionsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminRestrictionStage | null>(
    null
  )

  return (
    <AdminRestrictionsContext
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </AdminRestrictionsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminRestrictionsContext = () => {
  const ctx = React.useContext(AdminRestrictionsContext)

  if (!ctx) {
    throw new Error(
      'useAdminRestrictionsContext has to be used within <AdminRestrictionsProvider>'
    )
  }

  return ctx
}
