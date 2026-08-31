import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type AdminDiscount } from '../api'

type AdminDiscountsDialogType = 'add' | 'edit' | 'delete'

type AdminDiscountsContextType = {
  open: AdminDiscountsDialogType | null
  setOpen: (str: AdminDiscountsDialogType | null) => void
  currentRow: AdminDiscount | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminDiscount | null>>
}

const AdminDiscountsContext =
  React.createContext<AdminDiscountsContextType | null>(null)

export function AdminDiscountsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<AdminDiscountsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminDiscount | null>(null)

  return (
    <AdminDiscountsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AdminDiscountsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminDiscountsContext = () => {
  const ctx = React.useContext(AdminDiscountsContext)

  if (!ctx) {
    throw new Error(
      'useAdminDiscountsContext has to be used within <AdminDiscountsProvider>'
    )
  }

  return ctx
}
