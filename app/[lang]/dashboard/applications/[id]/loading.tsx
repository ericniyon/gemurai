import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ApplicationDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Applicant Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>

            <div className="border-t border-gray-200 pt-4" />

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4" />

            <div>
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Application Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3, 4].map((section) => (
                <div key={section} className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    ))}
                  </div>
                  {section < 4 && <div className="border-t border-gray-200 pt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
