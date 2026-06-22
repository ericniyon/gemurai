import type { ReactNode } from "react"

/** AuthLayout — login and unauthenticated SOROMA screens */
export function SoromaAuthLayout({ children }: { children: ReactNode }) {
  return <div className="soroma-app min-h-screen">{children}</div>
}
