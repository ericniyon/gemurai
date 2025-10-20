export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Clean Header Skeleton */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 bg-gray-200 rounded w-48"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-40"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </div>
              </div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="w-9 h-9 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>

          {/* Progress Skeleton */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded w-48 mt-2"></div>
          </div>
        </div>
      </div>

      {/* Tabs and Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-1 bg-white border border-gray-200 rounded-lg p-1 h-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>

          <div className="border border-gray-200 bg-white rounded-lg">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-40"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
