"use client"

import React, { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Star, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface ApplicationCardProps {
  application: {
    id: string
    status: string
    applicantName: string
    applicantEmail: string
    applicantPhone: string
    totalScore: number
    createdAt: string
    district?: string
    vulnerabilityCategory?: string
  }
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const ApplicationCard = memo<ApplicationCardProps>(({ 
  application, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'SUBMITTED': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'INTERVIEW_INVITED': { color: 'bg-yellow-100 text-yellow-800', icon: Calendar },
      'INTERVIEWED': { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      'APPROVED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'REJECTED': { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['SUBMITTED']
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 30) return 'text-green-600'
    if (score >= 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {application.applicantName}
              </h3>
              {getStatusBadge(application.status)}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="truncate">{application.applicantEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{application.applicantPhone}</span>
              </div>
              {application.district && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{application.district}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(application.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2 ml-4">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className={`font-semibold ${getScoreColor(application.totalScore)}`}>
                {application.totalScore.toFixed(1)}/40
              </span>
            </div>
            
            {application.vulnerabilityCategory && (
              <Badge variant="outline" className="text-xs">
                {application.vulnerabilityCategory}
              </Badge>
            )}
            
            <div className="flex space-x-1">
              {onView && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onView(application.id)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(application.id)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(application.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ApplicationCard.displayName = 'ApplicationCard'

export default ApplicationCard
