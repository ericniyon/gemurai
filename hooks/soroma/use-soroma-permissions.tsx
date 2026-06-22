"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"

export type SoromaPermissionsContextValue = {
  permissions: string[]
  role: string
  workspaceType: "platform" | "tenant"
  tenantId?: string
}

const SoromaPermissionsContext =
  createContext<SoromaPermissionsContextValue | null>(null)

export function SoromaPermissionsProvider({
  value,
  children,
}: {
  value: SoromaPermissionsContextValue
  children: ReactNode
}) {
  const memo = useMemo(() => value, [value])
  return (
    <SoromaPermissionsContext.Provider value={memo}>
      {children}
    </SoromaPermissionsContext.Provider>
  )
}

export function useSoromaPermissions(): SoromaPermissionsContextValue {
  const ctx = useContext(SoromaPermissionsContext)
  if (!ctx) {
    return {
      permissions: [],
      role: "",
      workspaceType: "tenant",
    }
  }
  return ctx
}
