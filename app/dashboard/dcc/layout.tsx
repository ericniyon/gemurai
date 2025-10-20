import { Metadata } from "next"

export const metadata: Metadata = {
  title: "DCC Dashboard",
  description: "Digital Community Champion Dashboard",
}

export default function DCCLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 