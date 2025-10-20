"use client"

import { useState, useEffect } from "react"
import { User, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface Interviewer {
  id: string
  name: string
  email: string
}

interface AssignInterviewersModalProps {
  applicationId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AssignInterviewersModal({ 
  applicationId, 
  isOpen, 
  onClose, 
  onSuccess 
}: AssignInterviewersModalProps) {
  const { toast } = useToast()
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingInterviewers, setFetchingInterviewers] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchInterviewers()
    }
  }, [isOpen])

  const fetchInterviewers = async () => {
    setFetchingInterviewers(true)
    try {
      const response = await fetch('/api/test/interviewers')
      const data = await response.json()
      
      if (data.success) {
        setInterviewers(data.interviewers)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch interviewers",
        variant: "destructive",
      })
    } finally {
      setFetchingInterviewers(false)
    }
  }

  const handleAddInterviewer = () => {
    if (selectedInterviewers.length < 3) { // Limit to 3 interviewers
      setSelectedInterviewers(prev => [...prev, ""])
    }
  }

  const handleRemoveInterviewer = (index: number) => {
    setSelectedInterviewers(prev => prev.filter((_, i) => i !== index))
  }

  const handleInterviewerChange = (index: number, interviewerId: string) => {
    setSelectedInterviewers(prev => {
      const newList = [...prev]
      newList[index] = interviewerId
      return newList
    })
  }

  const handleSubmit = async () => {
    const validInterviewers = selectedInterviewers.filter(id => id && id !== "")
    
    if (validInterviewers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one interviewer",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/test/assign-interviewers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          interviewerIds: validInterviewers
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Interviewers assigned successfully",
        })
        onSuccess()
        onClose()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign interviewers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Assign Interviewers</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Application ID: <span className="font-mono">{applicationId}</span></p>
            <p>Select interviewers to evaluate this application (max 3)</p>
          </div>

          {fetchingInterviewers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading interviewers...</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {selectedInterviewers.map((interviewerId, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Select
                      value={interviewerId}
                      onValueChange={(value) => handleInterviewerChange(index, value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select an interviewer" />
                      </SelectTrigger>
                      <SelectContent>
                        {interviewers.map((interviewer) => (
                          <SelectItem 
                            key={interviewer.id} 
                            value={interviewer.id}
                            disabled={selectedInterviewers.includes(interviewer.id) && interviewerId !== interviewer.id}
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{interviewer.name}</span>
                              <span className="text-gray-500">({interviewer.email})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveInterviewer(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {selectedInterviewers.length < 3 && (
                <Button
                  variant="outline"
                  onClick={handleAddInterviewer}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Interviewer
                </Button>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || selectedInterviewers.filter(id => id && id !== "").length === 0}
                >
                  {loading ? "Assigning..." : "Assign Interviewers"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 