'use client'

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApplicationWithRelations } from "@/types/application"
import { useToast } from "@/components/ui/use-toast"

interface BulkEmailDialogProps {
  applications: ApplicationWithRelations[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkEmailDialog({ 
  applications,
  open,
  onOpenChange,
}: BulkEmailDialogProps) {
  const { toast } = useToast()
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)

  const handleSendEmails = async () => {
    if (!subject || !message) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message fields.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/v1/applications/bulk-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationIds: applications.map(app => app.id),
          subject,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send emails")
      }

      toast({
        title: "Success",
        description: `Emails sent to ${applications.length} applicants successfully.`,
      })
      onOpenChange(false)
      setSubject("")
      setMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Bulk Email</DialogTitle>
          <DialogDescription>
            Send an email to {applications.length} selected applicant{applications.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              className="h-32"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmails}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send Emails"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 