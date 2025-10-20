"use client"

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Target
} from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  change?: number
  icon: React.ComponentType<{ className?: string }>
  color?: string
  description?: string
}

const StatsCard = memo<StatsCardProps>(({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  description 
}) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      red: 'text-red-600 bg-red-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${getColorClasses(color)}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-xs mt-1 ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${
              change < 0 ? 'rotate-180' : ''
            }`} />
            {Math.abs(change)}% from last period
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
})

StatsCard.displayName = 'StatsCard'

interface ApplicationStatsProps {
  applications: any[]
  isLoading?: boolean
}

export const ApplicationStats = memo<ApplicationStatsProps>(({ 
  applications, 
  isLoading = false 
}) => {
  const stats = React.useMemo(() => {
    const total = applications.length
    const submitted = applications.filter(app => app.status === 'SUBMITTED').length
    const interviewInvited = applications.filter(app => app.status === 'INTERVIEW_INVITED').length
    const interviewed = applications.filter(app => app.status === 'INTERVIEWED').length
    const approved = applications.filter(app => app.status === 'APPROVED').length
    const rejected = applications.filter(app => app.status === 'REJECTED').length
    
    const avgScore = applications.length > 0 
      ? applications.reduce((sum, app) => sum + (app.totalScore || 0), 0) / applications.length 
      : 0

    return {
      total,
      submitted,
      interviewInvited,
      interviewed,
      approved,
      rejected,
      avgScore
    }
  }, [applications])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Applications"
        value={stats.total}
        icon={Users}
        color="blue"
        description="All submitted applications"
      />
      <StatsCard
        title="Submitted"
        value={stats.submitted}
        icon={Clock}
        color="blue"
        description="Awaiting review"
      />
      <StatsCard
        title="Interview Invited"
        value={stats.interviewInvited}
        icon={Calendar}
        color="yellow"
        description="Scheduled for interview"
      />
      <StatsCard
        title="Interviewed"
        value={stats.interviewed}
        icon={CheckCircle}
        color="purple"
        description="Completed interviews"
      />
      <StatsCard
        title="Approved"
        value={stats.approved}
        icon={CheckCircle}
        color="green"
        description="Successfully approved"
      />
      <StatsCard
        title="Rejected"
        value={stats.rejected}
        icon={AlertCircle}
        color="red"
        description="Not selected"
      />
      <StatsCard
        title="Average Score"
        value={`${stats.avgScore.toFixed(1)}/40`}
        icon={Star}
        color="orange"
        description="Overall performance"
      />
      <StatsCard
        title="Success Rate"
        value={`${stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0}%`}
        icon={Target}
        color="green"
        description="Approval percentage"
      />
    </div>
  )
})

ApplicationStats.displayName = 'ApplicationStats'

export default StatsCard
