"use client"

export function SoromaLoadingSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div className="space-y-3 p-4" aria-label="Loading records">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="h-4 animate-pulse rounded"
              style={{ background: "var(--sf-border)" }}
              aria-hidden
            />
          ))}
        </div>
      ))}
    </div>
  )
}
