import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Filters and Search Skeleton */}
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full md:w-[180px]" />
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            {Array(5)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
