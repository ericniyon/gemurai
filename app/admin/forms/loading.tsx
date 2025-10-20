export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mt-2 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
