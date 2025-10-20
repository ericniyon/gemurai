import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ApplicationsLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-8 border border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="flex space-x-1 bg-white/80 backdrop-blur-sm border shadow-lg rounded-lg p-1">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Search Skeleton */}
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
        </div>

        {/* Table Skeleton */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4 pb-2 border-b">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Table Rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-7 gap-4 py-3">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-16 rounded-full" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
