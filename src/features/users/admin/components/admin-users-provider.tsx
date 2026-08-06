import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type AdminUser } from '../../api'

type AdminUsersDialogType = 'add' | 'edit' | 'delete'

type AdminUsersContextType = {
  open: AdminUsersDialogType | null
  setOpen: (str: AdminUsersDialogType | null) => void
  currentRow: AdminUser | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminUser | null>>
}

const AdminUsersContext = React.createContext<AdminUsersContextType | null>(
  null
)

export function AdminUsersProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<AdminUsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminUser | null>(null)

  return (
    <AdminUsersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AdminUsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminUsers = () => {
  const adminUsersContext = React.useContext(AdminUsersContext)

  if (!adminUsersContext) {
    throw new Error('useAdminUsers has to be used within <AdminUsersProvider>')
  }

  return adminUsersContext
}
