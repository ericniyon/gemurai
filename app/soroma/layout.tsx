import type { Metadata } from "next"
import "./soroma.css"

export const metadata: Metadata = {
  title: "SOROMA FOODS | Agroprocessor OS",
  description: "Multi-tenant agroprocessor operating system",
}

export default function SoromaRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="soroma-app">{children}</div>
}
