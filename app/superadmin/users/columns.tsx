import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export type User = {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  lastLogin: string | null
  isActive: boolean
}

// This file is kept for type definitions but the actual table rendering
// is now handled directly in the page component for better control
// and responsiveness

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLogin = row.getValue("lastLogin")
      return lastLogin ? formatDate(lastLogin) : "Never"
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const lastLogin = row.getValue("lastLogin")
      const isActive = lastLogin && Date.now() - new Date(lastLogin).getTime() < 30 * 24 * 60 * 60 * 1000
      return (
        <Badge variant={isActive ? "success" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
] 