"use client"

import { Badge } from "@/components/ui/badge"
import { ApplicationWithRelations } from "@/types/application"
import { Users, Brain, UserCheck, CheckCircle, MapPin, TrendingUp, Clock, Award, Target, BarChart3, Star, Zap, Activity, Calendar, CalendarDays } from "lucide-react"

interface ApplicationAnalyticsProps {
  applications: ApplicationWithRelations[]
  lang: string
}

export function ApplicationAnalytics({ applications, lang }: ApplicationAnalyticsProps) {
  if (!applications || applications.length === 0) {
    return null
  }

  const totalApplications = applications.length
  
  // Status distribution
  const statusCounts = applications.reduce((acc, app) => {
    const status = app.status || 'UNKNOWN'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Score analysis
  const validScores = applications.filter(app => {
    if (app.formData && app.formData['Total Score'] !== undefined) {
      const score = Number(app.formData['Total Score'])
      return !isNaN(score) && score > 0 && app.formData['Total Score'] !== '#N/A'
    }
    return app.evaluations && app.evaluations.length > 0
  })

  const averageScore = validScores.length > 0 
    ? validScores.reduce((sum, app) => {
        let score = 0
        if (app.formData && app.formData['Total Score'] !== undefined) {
          score = Number(app.formData['Total Score']) || 0
        } else if (app.evaluations && app.evaluations.length > 0) {
          score = app.evaluations[0].score || 0
        }
        return sum + score
      }, 0) / validScores.length
    : 0

  const interviewInvited = statusCounts['INTERVIEW_INVITED'] || 0
  const approved = statusCounts['APPROVED'] || 0
  const pending = statusCounts['PENDING_DOCUMENTS'] || 0
  const underReview = statusCounts['UNDER_REVIEW'] || 0

  // Calculate recent applications (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentApplications = applications.filter(app => {
    const appDate = new Date(app.createdAt)
    return appDate >= sevenDaysAgo
  }).length

  // Calculate top performers (applications with scores above 80)
  const topPerformers = validScores.filter(app => {
    let score = 0
    if (app.formData && app.formData['Total Score'] !== undefined) {
      score = Number(app.formData['Total Score']) || 0
    } else if (app.evaluations && app.evaluations.length > 0) {
      score = app.evaluations[0].score || 0
    }
    return score >= 80
  }).length

  // Calculate this month's applications
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)
  const thisMonthApplications = applications.filter(app => {
    const appDate = new Date(app.createdAt)
    return appDate >= thisMonth
  }).length

  // Calculate conversion rate (interview invited / total)
  const conversionRate = totalApplications > 0 ? (interviewInvited / totalApplications) * 100 : 0

  return (
    <div className="space-y-8 font-sans animate-fade-in">
      {/* Enhanced Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <div className="analytics-card blue elevated rounded-lg border-0 transition-all duration-300 transform hover:-translate-y-2">
          <div className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="stat-label font-sans text-foreground">
              {lang === 'rw' ? 'Ubwishingizi Bwose' : 'Total Applications'}
            </div>
            <div className="icon-container blue">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="stat-number font-sans text-foreground">{totalApplications.toLocaleString()}</div>
            <div className="stat-description text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              <span className="font-bold">
                +{recentApplications} {lang === 'rw' ? 'mu wa mbere' : 'this week'}
              </span>
            </div>
          </div>
        </div>

        {/* Interview Invited */}
        <div className="analytics-card green elevated rounded-lg border-0 transition-all duration-300 transform hover:-translate-y-2">
          <div className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="stat-label font-sans text-foreground">
              {lang === 'rw' ? 'Batumijwe Kuri Interview' : 'Interview Invited'}
            </div>
            <div className="icon-container green">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="stat-number font-sans text-foreground">{interviewInvited.toLocaleString()}</div>
            <div className="stat-description text-muted-foreground flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span className="font-bold">
                {lang === 'rw' ? 'Batumijwe' : 'Invited'} {interviewInvited}
              </span>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="analytics-card orange elevated rounded-lg border-0 transition-all duration-300 transform hover:-translate-y-2">
          <div className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="stat-label font-sans text-foreground">
              {lang === 'rw' ? 'Isesengura Ry\'ubwishingizi' : 'Average Score'}
            </div>
            <div className="icon-container orange">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="stat-number font-sans text-foreground">{averageScore.toFixed(1)}%</div>
            <div className="stat-description text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              <span className="font-bold">
                {lang === 'rw' ? 'Isesengura' : 'Score'} {averageScore.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="analytics-card purple elevated rounded-lg border-0 transition-all duration-300 transform hover:-translate-y-2">
          <div className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="stat-label font-sans text-foreground">
              {lang === 'rw' ? 'Uku Kwezi' : 'This Month'}
            </div>
            <div className="icon-container purple">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="stat-number font-sans text-foreground">{thisMonthApplications.toLocaleString()}</div>
            <div className="stat-description text-muted-foreground flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span className="font-bold">
                {lang === 'rw' ? 'Uku kwezi' : 'This month'} {thisMonthApplications}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 