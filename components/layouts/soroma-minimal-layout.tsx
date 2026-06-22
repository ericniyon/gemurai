import type { ReactNode } from "react"

/** MinimalLayout — lightweight pages without sidebar */
export function SoromaMinimalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="soroma-app min-h-screen bg-[var(--sf-page-bg)] p-6">
      {children}
    </div>
  )
}
