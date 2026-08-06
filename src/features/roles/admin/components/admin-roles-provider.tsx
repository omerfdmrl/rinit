import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type AdminRole } from '../../api'

type AdminRolesDialogType = 'add' | 'edit' | 'delete' | 'permissions'

type AdminRolesContextType = {
  open: AdminRolesDialogType | null
  setOpen: (str: AdminRolesDialogType | null) => void
  currentRow: AdminRole | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminRole | null>>
}

const AdminRolesContext = React.createContext<AdminRolesContextType | null>(
  null
)

export function AdminRolesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<AdminRolesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminRole | null>(null)

  return (
    <AdminRolesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AdminRolesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminRoles = () => {
  const adminRolesContext = React.useContext(AdminRolesContext)

  if (!adminRolesContext) {
    throw new Error('useAdminRoles has to be used within <AdminRolesProvider>')
  }

  return adminRolesContext
}
