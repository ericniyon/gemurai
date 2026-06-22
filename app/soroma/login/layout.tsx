import { SoromaAuthLayout } from "@/components/layouts/soroma-auth-layout"

export default function SoromaLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SoromaAuthLayout>{children}</SoromaAuthLayout>
}
