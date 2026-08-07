import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type AdminTeam } from '../api'

type AdminTeamsDialogType = 'add' | 'edit' | 'delete' | 'members'

type AdminTeamsContextType = {
  open: AdminTeamsDialogType | null
  setOpen: (str: AdminTeamsDialogType | null) => void
  currentRow: AdminTeam | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminTeam | null>>
}

const AdminTeamsContext = React.createContext<AdminTeamsContextType | null>(
  null
)

export function AdminTeamsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<AdminTeamsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminTeam | null>(null)

  return (
    <AdminTeamsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AdminTeamsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminTeams = () => {
  const adminTeamsContext = React.useContext(AdminTeamsContext)

  if (!adminTeamsContext) {
    throw new Error('useAdminTeams has to be used within <AdminTeamsProvider>')
  }

  return adminTeamsContext
}
