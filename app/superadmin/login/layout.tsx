import { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Login | Superadmin",
  description: "Login to access the superadmin dashboard",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function SuperadminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 