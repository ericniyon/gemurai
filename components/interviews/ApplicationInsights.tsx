"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, GraduationCap, Smartphone, Briefcase, Heart, MessageSquare, Users, Target, Clock, Globe, Monitor, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface ApplicationInsightsProps {
  application: any
}

export function ApplicationInsights({ application }: ApplicationInsightsProps) {
  const formData = application?.formData || {}

  const getVulnerabilityFactors = () => {
    const factors = []
    
    if (formData.disability === 'Yes') factors.push('Has disability')
    if (formData.refugee === 'Yes') factors.push('Refugee status')
    if (formData.householdHead === 'Yes') factors.push('Household head')
    if (formData.primaryProvider === 'Yes') factors.push('Primary financial provider')
    if (formData.smartphoneAccess === 'No') factors.push('Limited digital access')
    if (formData.internetUsage === 'Rarely' || formData.internetUsage === 'Never') factors.push('Limited internet access')
    
    return factors
  }

  const getStrengths = () => {
    const strengths = []
    
    if (formData.education) strengths.push(`Education: ${formData.education}`)
    if (formData.skills && Array.isArray(formData.skills) && formData.skills.length > 0) {
      strengths.push(`Skills: ${formData.skills.join(', ')}`)
    }
    if (formData.languages && Array.isArray(formData.languages) && formData.languages.length > 1) {
      strengths.push(`Languages: ${formData.languages.join(', ')}`)
    }
    if (formData.workExperience === 'Yes') strengths.push('Has work experience')
    if (formData.healthcareBackground === 'Yes') strengths.push('Healthcare background')
    if (formData.communityInvolvement === 'Yes') strengths.push('Community involvement')
    if (formData.appFamiliarity === 'Yes') strengths.push('Digital literacy')
    
    return strengths
  }

  const getAreasForDevelopment = () => {
    const areas = []
    
    if (!formData.workExperience || formData.workExperience === 'No') areas.push('Limited work experience')
    if (!formData.healthcareBackground || formData.healthcareBackground === 'No') areas.push('No healthcare background')
    if (formData.smartphoneAccess === 'No') areas.push('Limited technology access')
    if (formData.internetUsage === 'Rarely' || formData.internetUsage === 'Never') areas.push('Limited internet usage')
    if (!formData.communityInvolvement || formData.communityInvolvement === 'No') areas.push('Limited community involvement')
    if (!formData.appFamiliarity || formData.appFamiliarity === 'No') areas.push('Limited digital literacy')
    
    return areas
  }

  const getKeyInsights = () => {
    const insights = []
    
    // Personal background insights
    if (formData.disability === 'Yes') {
      insights.push({
        type: 'info',
        icon: Info,
        title: 'Disability Accommodation',
        description: 'Candidate has indicated a disability. Consider accessibility needs and accommodations that may be required.'
      })
    }
    
    if (formData.refugee === 'Yes') {
      insights.push({
        type: 'info',
        icon: Info,
        title: 'Refugee Background',
        description: 'Candidate has refugee status. This may provide unique perspectives on community health and resilience.'
      })
    }
    
    // Education insights
    if (formData.education) {
      insights.push({
        type: 'strength',
        icon: GraduationCap,
        title: 'Educational Background',
        description: `Completed ${formData.education}. This provides a solid foundation for learning and development.`
      })
    }
    
    // Skills insights
    if (formData.skills && Array.isArray(formData.skills)) {
      const relevantSkills = formData.skills.filter((skill: string) => 
        ['Healthcare', 'Teaching', 'Customer Service', 'Computer Literacy'].includes(skill)
      )
      if (relevantSkills.length > 0) {
        insights.push({
          type: 'strength',
          icon: Briefcase,
          title: 'Relevant Skills',
          description: `Has relevant skills: ${relevantSkills.join(', ')}. These are directly applicable to the role.`
        })
      }
    }
    
    // Language insights
    if (formData.languages && Array.isArray(formData.languages) && formData.languages.length > 1) {
      insights.push({
        type: 'strength',
        icon: MessageSquare,
        title: 'Multilingual',
        description: `Speaks ${formData.languages.length} languages: ${formData.languages.join(', ')}. This is valuable for community communication.`
      })
    }
    
    // Healthcare insights
    if (formData.healthcareBackground === 'Yes') {
      insights.push({
        type: 'strength',
        icon: Heart,
        title: 'Healthcare Experience',
        description: 'Has healthcare background. This provides valuable knowledge and experience for community health work.'
      })
    }
    
    // Community insights
    if (formData.communityInvolvement === 'Yes') {
      insights.push({
        type: 'strength',
        icon: Users,
        title: 'Community Engagement',
        description: 'Active in community activities. This shows leadership potential and community understanding.'
      })
    }
    
    // Digital access insights
    if (formData.smartphoneAccess === 'No') {
      insights.push({
        type: 'concern',
        icon: Monitor,
        title: 'Limited Digital Access',
        description: 'No smartphone access. This may impact ability to use digital tools required for the role.'
      })
    }
    
    // Motivation insights
    if (formData.motivation) {
      insights.push({
        type: 'strength',
        icon: Target,
        title: 'Strong Motivation',
        description: 'Provided detailed motivation statement. Shows genuine interest and commitment to the role.'
      })
    }
    
    return insights
  }

  const vulnerabilityFactors = getVulnerabilityFactors()
  const strengths = getStrengths()
  const areasForDevelopment = getAreasForDevelopment()
  const keyInsights = getKeyInsights()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <div className="space-y-2">
                {strengths.map((strength, index) => (
                  <div key={index} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                    {strength}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No specific strengths identified</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Areas for Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            {areasForDevelopment.length > 0 ? (
              <div className="space-y-2">
                {areasForDevelopment.map((area, index) => (
                  <div key={index} className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                    {area}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No major areas for development identified</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-blue-600" />
              Vulnerability Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vulnerabilityFactors.length > 0 ? (
              <div className="space-y-2">
                {vulnerabilityFactors.map((factor, index) => (
                  <div key={index} className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                    {factor}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No vulnerability factors identified</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Insights for Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keyInsights.map((insight, index) => {
              const IconComponent = insight.icon
              const getBadgeVariant = () => {
                switch (insight.type) {
                  case 'strength': return 'default'
                  case 'concern': return 'destructive'
                  case 'info': return 'secondary'
                  default: return 'outline'
                }
              }
              
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <IconComponent className="h-5 w-5 mt-0.5 text-gray-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge variant={getBadgeVariant()} className="text-xs">
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 