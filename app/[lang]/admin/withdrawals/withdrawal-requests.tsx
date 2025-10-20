"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface WithdrawalRequest {
  id: string
  amount: number
  status: string
  reason: string | null
  createdAt: string
  wallet: {
    dccProfile: {
      name: string
      email: string
    }
  }
}

async function getWithdrawalRequests() {
  const res = await fetch("/api/admin/withdrawals")
  if (!res.ok) throw new Error("Failed to fetch withdrawal requests")
  return res.json()
}

export function WithdrawalRequests() {
  const router = useRouter()
  const { toast } = useToast()
  const [requests, setRequests] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [notes, setNotes] = useState<string>("")

  const handleAction = async (requestId: string, action: "APPROVE" | "REJECT") => {
    try {
      setLoading(requestId)
      const response = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
          notes
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      toast({
        title: `Request ${action.toLowerCase()}ed`,
        description: `The withdrawal request has been ${action.toLowerCase()}ed successfully.`
      })

      // Refresh the requests list
      const updatedRequests = await getWithdrawalRequests()
      setRequests(updatedRequests)
      setNotes("")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process request",
        variant: "destructive"
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DCC Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{request.wallet.dccProfile.name}</p>
                    <p className="text-sm text-muted-foreground">{request.wallet.dccProfile.email}</p>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(request.amount)}</TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleAction(request.id, "APPROVE")}
                        disabled={loading === request.id}
                        variant="outline"
                        className="flex-1"
                      >
                        {loading === request.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleAction(request.id, "REJECT")}
                        disabled={loading === request.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        {loading === request.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reject
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 