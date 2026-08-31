import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type AdminPlan } from '../api'

type AdminPlansDialogType = 'add' | 'edit' | 'delete'

type AdminPlansContextType = {
  open: AdminPlansDialogType | null
  setOpen: (str: AdminPlansDialogType | null) => void
  currentRow: AdminPlan | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminPlan | null>>
}

const AdminPlansContext = React.createContext<AdminPlansContextType | null>(
  null
)

export function AdminPlansProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<AdminPlansDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminPlan | null>(null)

  return (
    <AdminPlansContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AdminPlansContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminPlansContext = () => {
  const adminPlansContext = React.useContext(AdminPlansContext)

  if (!adminPlansContext) {
    throw new Error(
      'useAdminPlansContext has to be used within <AdminPlansProvider>'
    )
  }

  return adminPlansContext
}
