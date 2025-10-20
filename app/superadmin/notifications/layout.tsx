"use client"

import { SuperAdminLayoutClient } from "../components/SuperAdminLayoutClient"

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SuperAdminLayoutClient>{children}</SuperAdminLayoutClient>
} 