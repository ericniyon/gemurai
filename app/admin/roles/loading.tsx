import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full max-w-[500px] mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
