import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DCCManagementLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-8 border border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full md:w-[180px]" />
        <Skeleton className="h-10 w-full md:w-[180px]" />
        <Skeleton className="h-10 w-full md:w-[180px]" />
      </div>

      {/* Table Skeleton */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-4 py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
