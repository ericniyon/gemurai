"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function TestWarehousePage() {
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const testGenerateCode = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/v1/superadmin/warehouses/generate-code", {
        method: "POST",
        credentials: "include"
      })
      const data = await response.json()
      
      if (data.success) {
        setGeneratedCode(data.code)
        toast({
          title: "Success",
          description: `Generated warehouse code: ${data.code}`,
        })
      } else {
        throw new Error(data.error || "Failed to generate code")
      }
    } catch (error) {
      console.error("Error generating warehouse code:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate warehouse code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Code Generation Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testGenerateCode} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Generating..." : "Generate Warehouse Code"}
            </Button>
            
            {generatedCode && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm font-medium text-green-800">Generated Code:</p>
                <p className="text-lg font-mono text-green-900">{generatedCode}</p>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p>This test will generate a warehouse code in the format WH001, WH002, etc.</p>
              <p className="mt-2">Make sure you're logged in as a superadmin to test this functionality.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 