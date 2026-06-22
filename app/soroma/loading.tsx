import { SoromaLoadingSkeleton } from "@/components/soroma/loading-skeleton"

export default function SoromaLoading() {
  return (
    <div className="soroma-app p-6 lg:p-8">
      <div className="sf-card sf-card-elevated p-6">
        <SoromaLoadingSkeleton rows={6} columns={4} />
      </div>
    </div>
  )
}
