"use client"

import { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ClientOnly } from "@/components/client-only"
import dynamic from "next/dynamic"
import { Toaster } from "sonner"

// Dynamically import AuthProvider with no SSR
const AuthProvider = dynamic(() => import("@/components/auth-provider"), {
  ssr: false,
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClientOnly>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
        storageKey="Gemurai-theme"
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster richColors closeButton position="top-right" />
      </ThemeProvider>
    </ClientOnly>
  )
} 