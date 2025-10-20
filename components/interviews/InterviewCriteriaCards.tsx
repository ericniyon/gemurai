"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Star, GraduationCap, Smartphone, Users, Home } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface InterviewCriteria {
  id: string
  name: string
  description: string
  maxScore: number
  weight: number
}

export default function InterviewCriteriaCards() {
  const [criteria, setCriteria] = useState<InterviewCriteria[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadCriteria()
  }, [])

  const loadCriteria = async () => {
    try {
      const response = await fetch("/api/test/interview-criteria")
      const data = await response.json()
      
      if (data.success) {
        setCriteria(data.criteria)
      } else {
        toast({
          title: "Error",
          description: "Failed to load interview criteria",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading criteria:", error)
      toast({
        title: "Error",
        description: "Failed to load interview criteria",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCriteriaIcon = (name: string) => {
    switch (name) {
      case "Education and Work Experience":
        return <GraduationCap className="h-6 w-6" />
      case "Digital Access and Literacy":
        return <Smartphone className="h-6 w-6" />
      case "Living Environment & Community Connections":
        return <Home className="h-6 w-6" />
      case "Socio-Economic and Vulnerability Status":
        return <Users className="h-6 w-6" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  const getCriteriaColor = (name: string) => {
    switch (name) {
      case "Education and Work Experience":
        return "from-blue-500 to-blue-600"
      case "Digital Access and Literacy":
        return "from-purple-500 to-purple-600"
      case "Living Environment & Community Connections":
        return "from-green-500 to-green-600"
      case "Socio-Economic and Vulnerability Status":
        return "from-orange-500 to-orange-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getScoreLevel = (maxScore: number) => {
    if (maxScore >= 25) return { level: "High Priority", color: "bg-red-100 text-red-800 border-red-200" }
    if (maxScore >= 15) return { level: "Medium Priority", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    return { level: "Standard", color: "bg-green-100 text-green-800 border-green-200" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading interview criteria...</span>
        </div>
      </div>
    )
  }

  if (criteria.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">No Interview Criteria</h3>
        <p className="text-gray-600 mb-6">No interview criteria have been configured yet.</p>
        <Button 
          onClick={loadCriteria}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Interview Criteria</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          These are the criteria used to evaluate applicants during interviews. Each criterion has a specific weight and maximum score.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {criteria.map((criterion) => {
          const scoreLevel = getScoreLevel(criterion.maxScore)
          
          return (
            <Card key={criterion.id} className="border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getCriteriaColor(criterion.name)} rounded-xl flex items-center justify-center text-white`}>
                      {getCriteriaIcon(criterion.name)}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800">
                        {criterion.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        Weight: {criterion.weight}x
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${scoreLevel.color} border text-sm font-semibold px-3 py-1`}>
                      {scoreLevel.level}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    {criterion.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Max Score:</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                        {criterion.maxScore} points
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Weight:</span>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                        {criterion.weight}x
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl border border-blue-200/50">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Total Maximum Score</h3>
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {criteria.reduce((sum, c) => sum + c.maxScore, 0)} points
          </div>
          <p className="text-gray-600 mt-2">
            Combined maximum score across all criteria
          </p>
        </div>
      </div>
    </div>
  )
} 