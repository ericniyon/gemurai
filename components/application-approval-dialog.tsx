"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Shield, Users } from "lucide-react"

interface ApplicationApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: {
    id: string
    email: string
    phone: string
    formData: any
  }
  onApproved: () => void
}

export function ApplicationApprovalDialog({
  open,
  onOpenChange,
  application,
  onApproved,
}: ApplicationApprovalDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"CONSUMER">("CONSUMER") // Remove DCC option
  const [createUserAccount, setCreateUserAccount] = useState(true)
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [upgradeToDCC, setUpgradeToDCC] = useState(false)

  // Auto-determine suggested role based on form data
  const getSuggestedRole = (): "DCC" | "CONSUMER" => {
    const formData = application.formData as { [key: string]: any }

    // Check for DCC indicators based on skills and other relevant fields
    const dccKeywords = ["business", "entrepreneur", "digital services", "community", "training"]
    const skills = (formData.skills || []).join(" ").toLowerCase()
    const motivation = (formData.motivation || "").toLowerCase()
    const goals = (formData.goals || "").toLowerCase()

    if (dccKeywords.some((keyword) => skills.includes(keyword) || motivation.includes(keyword) || goals.includes(keyword))) {
      return "DCC"
    }

    return "CONSUMER"
  }

  const handleApprove = async () => {
    setIsLoading(true)

    try {
      // First create Consumer account
      const response = await fetch("/api/v1/applications/approve-and-create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: application.id,
          createUser: createUserAccount,
          sendEmail: sendWelcomeEmail,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // If DCC upgrade requested, do that too
        if (upgradeToDCC && result.user) {
          const upgradeResponse = await fetch("/api/v1/users/upgrade-to-dcc", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: result.user.id,
              applicationId: application.id,
              reason: "Approved during application review",
            }),
          })

          const upgradeResult = await upgradeResponse.json()

          if (upgradeResult.success) {
            toast({
              title: "Application Approved!",
              description: `User account created and upgraded to DCC role. Welcome email sent to ${application.email}.`,
            })
          } else {
            toast({
              title: "Partial Success",
              description: `Consumer account created, but DCC upgrade failed: ${upgradeResult.message}`,
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "Application Approved!",
            description: `Consumer account created. Welcome email sent to ${application.email}.`,
          })
        }

        onApproved()
        onOpenChange(false)
      } else {
        toast({
          title: "Approval Failed",
          description: result.message || "Failed to approve application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving application:", error)
      toast({
        title: "Error",
        description: "An error occurred while approving the application",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formData = application.formData as { [key: string]: any }
  const userName = `${formData?.q1 || ""} ${formData?.q2 || ""}`.trim() || "Applicant"
  const suggestedRole = getSuggestedRole()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Approve Application
          </DialogTitle>
          <DialogDescription>
            Approve this application and optionally create a user account for {userName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Application Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Application Details</h4>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Name:</strong> {userName}
              </p>
              <p>
                <strong>Email:</strong> {application.email}
              </p>
              <p>
                <strong>Phone:</strong> {application.phone}
              </p>
              <p>
                <strong>Suggested Role:</strong>
                <span
                  className={`ml-1 px-2 py-1 rounded text-xs ${
                    suggestedRole === "DCC" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {suggestedRole === "DCC" ? "Digital Community Champion" : "Consumer"}
                </span>
              </p>
            </div>
          </div>

          {/* User Account Creation */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="createAccount" checked={createUserAccount} onCheckedChange={(checked) => setCreateUserAccount(!!checked)} />
              <Label htmlFor="createAccount" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Create user account automatically
              </Label>
            </div>

            {createUserAccount && (
              <div className="ml-6 space-y-4">
                {/* Replace the role selection with Consumer-only info */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">Account Creation</h5>
                  <p className="text-sm text-blue-800">
                    New accounts are created with Consumer role by default. DCC role requires manual review and
                    approval.
                  </p>
                </div>

                {/* Add DCC upgrade option */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="upgradeDCC" checked={upgradeToDCC} onCheckedChange={(checked) => setUpgradeToDCC(!!checked)} />
                  <Label htmlFor="upgradeDCC" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Also upgrade to DCC role (requires admin review)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="sendWelcomeEmail" checked={sendWelcomeEmail} onCheckedChange={(checked) => setSendWelcomeEmail(!!checked)} />
                  <Label htmlFor="sendWelcomeEmail" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Send welcome email
                  </Label>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Approving...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Approve Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
