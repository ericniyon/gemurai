import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AuthHeader />
      <main className="flex-1">
        {children}
      </main>
      <AuthFooter />
    </div>
  )
} 