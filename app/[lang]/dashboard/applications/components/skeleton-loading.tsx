"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ApplicationSkeletonProps {
  count?: number
}

export const ApplicationSkeleton: React.FC<ApplicationSkeletonProps> = ({ count = 10 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications list skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ApplicationSkeleton count={5} />
        </CardContent>
      </Card>
    </div>
  )
}

export default ApplicationSkeleton
