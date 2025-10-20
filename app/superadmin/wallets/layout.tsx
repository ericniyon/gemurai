"use client"

import { SuperAdminLayoutClient } from "../components/SuperAdminLayoutClient"

export default function WalletsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SuperAdminLayoutClient>{children}</SuperAdminLayoutClient>
} 