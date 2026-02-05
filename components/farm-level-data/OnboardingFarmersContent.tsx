"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Phone, Loader2 } from "lucide-react"
import { AddFarmerForm } from "@/app/[lang]/dashboard/mcc/components/AddFarmerForm"

export function OnboardingFarmersContent() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [farmers, setFarmers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFarmers = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch("/api/v1/mcc/farmers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setFarmers(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching farmers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFarmers()
  }, [])

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-10 w-10 mx-auto animate-spin text-blue-600 mb-3" />
        <p className="text-gray-500">Loading farmers...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 shadow-sm">
        <CardHeader className="border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-blue-900">Farmers</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Register smallholder farmers. A unique code and ledger account will be created automatically. National ID verification is mandatory.
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Register farmer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {farmers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No farmers yet. Register your first farmer to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {farmers.map((farmer) => (
                  <Card
                    key={farmer.id}
                    className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-blue-900">{farmer.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-800">{farmer.phone || "—"}</span>
                      </div>
                      {farmer.farmerCode && (
                        <span className="inline-block rounded-lg bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                          {farmer.farmerCode}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddFarmerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          setIsFormOpen(false)
          fetchFarmers()
        }}
      />
    </div>
  )
}
