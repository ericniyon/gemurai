import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

interface DCCOnlyProps {
  children: React.ReactNode
}

export function DCCOnly({ children }: DCCOnlyProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "DCC")) {
      toast({
        title: "Access Denied",
        description: "Only DCC users can access this page",
        variant: "destructive"
      })
      router.push("/rw")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user || user.role !== "DCC") {
    return null
  }

  return <>{children}</>
} 