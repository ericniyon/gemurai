import { Metadata } from "next"
import { SuperAdminLayoutClient } from "./components/SuperAdminLayoutClient"

export const metadata: Metadata = {
  title: "Superadmin Dashboard",
  description: "Manage your entire system",
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SuperAdminLayoutClient>{children}</SuperAdminLayoutClient>
} 