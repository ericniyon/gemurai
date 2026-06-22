import { SoromaLoadingSkeleton } from "@/components/soroma/loading-skeleton"

export default function SoromaTenantLoading() {
  return (
    <div className="sf-card sf-card-elevated p-6">
      <SoromaLoadingSkeleton rows={5} columns={4} />
    </div>
  )
}
