import type { Metadata } from "next"
import { YdenNavigation } from "@/components/yden/navigation"
import { YdenFooter } from "@/components/yden/footer"

export const metadata: Metadata = {
  title: {
    default: "YDEN | Young Dairy Entrepreneurs Network",
    template: "%s | YDEN",
  },
  description: "YDEN connects young people across Rwanda to dairy entrepreneurship opportunities, partners, and resources.",
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <YdenNavigation />
      <main>{children}</main>
      <YdenFooter />
    </div>
  )
}

