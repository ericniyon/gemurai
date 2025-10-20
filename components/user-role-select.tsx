import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EMPLOYER",
  "TEAM_LEADER",
  "DCC",
  "AGENT",
  "CUSTOMER",
]

interface UserRoleSelectProps {
  userId: string
  currentRole: string
  onRoleUpdate?: (newRole: string) => void
}

export function UserRoleSelect({
  userId,
  currentRole,
  onRoleUpdate,
}: UserRoleSelectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie
            .split("; ")
            .find((row) => row.startsWith("Gemurai_token="))
            ?.split("=")[1]}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to update role")
      }

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`,
      })

      onRoleUpdate?.(newRole)
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Select
      disabled={isLoading}
      defaultValue={currentRole}
      onValueChange={handleRoleChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {role.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 