"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, User, Loader2 } from "lucide-react"

interface Interviewer {
  id: string
  name: string
  email: string
  role: string
}

interface ScheduleInterviewModalProps {
  applicationId: string
  applicantName: string
  onInterviewScheduled: () => void
}

export default function ScheduleInterviewModal({ 
  applicationId, 
  applicantName, 
  onInterviewScheduled 
}: ScheduleInterviewModalProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [selectedInterviewer, setSelectedInterviewer] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (open) {
      fetchInterviewers()
    }
  }, [open])

  const fetchInterviewers = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/interviewers", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch interviewers")
      }

      const data = await response.json()
      if (data.success) {
        setInterviewers(data.interviewers)
      }
    } catch (error) {
      console.error("Error fetching interviewers:", error)
      toast({
        title: "Error",
        description: "Failed to load interviewers",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedInterviewer || !scheduledDate || !scheduledTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
      
      const response = await fetch("/api/v1/superadmin/applications?action=create-interview", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          interviewerId: selectedInterviewer,
          scheduledDate: scheduledDateTime.toISOString(),
          notes
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to schedule interview")
      }

      const data = await response.json()
      
      toast({
        title: "Success",
        description: "Interview scheduled successfully",
      })

      // Reset form
      setSelectedInterviewer("")
      setScheduledDate("")
      setScheduledTime("")
      setNotes("")
      setOpen(false)
      
      // Notify parent component
      onInterviewScheduled()

    } catch (error) {
      console.error("Error scheduling interview:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule interview",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Interview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="applicant">Applicant</Label>
            <Input
              id="applicant"
              value={applicantName}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="interviewer">Interviewer *</Label>
            <Select value={selectedInterviewer} onValueChange={setSelectedInterviewer}>
              <SelectTrigger>
                <SelectValue placeholder="Select an interviewer" />
              </SelectTrigger>
              <SelectContent>
                {interviewers.map((interviewer) => (
                  <SelectItem key={interviewer.id} value={interviewer.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{interviewer.name}</span>
                      <span className="text-gray-500">({interviewer.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes for the interviewer..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Schedule Interview
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 