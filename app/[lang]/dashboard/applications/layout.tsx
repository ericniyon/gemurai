import { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Applications | Dashboard",
  description: "View and manage your applications"
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  )
}

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  )
}