import { SoromaPlatformLayout } from "@/components/layouts/soroma-platform-layout"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SoromaPlatformLayout>{children}</SoromaPlatformLayout>
}
