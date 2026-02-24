"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, Plus, ClipboardList, Building2 } from "lucide-react"
import { CommodityCollectionForm } from "@/components/mcc/CommodityCollectionForm"

export default function AgentCollectionsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [mccs, setMccs] = useState<{ id: string; name: string }[]>([])
  const [selectedMccId, setSelectedMccId] = useState<string>("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("Gemurai_token")
    if (!token || !user) return
    fetch("/api/v1/agent/mccs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setMccs(data.data)
          if (user.mccId && data.data.some((m: { id: string }) => m.id === user.mccId)) {
            setSelectedMccId(user.mccId)
          } else if (data.data.length === 1) {
            setSelectedMccId(data.data[0].id)
          }
        }
      })
      .finally(() => setLoading(false))
  }, [user])

  const canAccess =
    user &&
    (user.role === "AGENT" ||
      user.role === "AGENT" ||
      user.role === "MCC_MANAGER" ||
      user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN")

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-md border-slate-200">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center">
              <Package className="h-10 w-10 text-slate-400 mb-4" />
              <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
              <p className="mt-2 text-sm text-slate-600">
                You need an agent or MCC role to use the Agent Collection App.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Agent Collection App</h1>
          <p className="text-slate-600 mt-1">
            Record commodity collections in the field. Select the collection center (MCC), then add a collection.
          </p>
        </div>

        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-slate-600" />
              Collection center (MCC)
            </CardTitle>
            <CardDescription>Choose the MCC you are recording collections for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading MCCs...</p>
            ) : (
              <>
                <Select value={selectedMccId} onValueChange={setSelectedMccId}>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select MCC" />
                  </SelectTrigger>
                  <SelectContent>
                    {mccs.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setIsFormOpen(true)}
                  disabled={!selectedMccId}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record collection
                </Button>
                {!selectedMccId && mccs.length > 0 && (
                  <p className="text-sm text-amber-600">Select an MCC to record a collection.</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 border-slate-200 bg-slate-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <ClipboardList className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-600">
                <p className="font-medium text-slate-700">How it works</p>
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  <li>Select the collection center (MCC) above.</li>
                  <li>Click &quot;Record collection&quot; and choose commodity, farmer, quantity, quality, and advances.</li>
                  <li>Collections are recorded with you as the agent and linked to the selected MCC.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CommodityCollectionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {}}
        overrideMccId={selectedMccId || undefined}
        overrideAgentId={user?.id}
      />
    </div>
  )
}
