"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, FileSpreadsheet } from "lucide-react"

export default function TestGoogleSheetsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testGoogleSheets = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/test-google-sheets')
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testDirectGoogleSheets = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycby98sxBqV-YjFrC3-KHBlxezCy6azUcaB1Cy2aWS2bvqHYC4h9R3AADz5ACm0sG7SXH/exec?path=Evaluation&action=read', {
        redirect: 'follow'
      })
      const data = await response.text()
      setResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Google Sheets Integration Test</h1>
          <p className="text-gray-600">Test the Google Sheets integration and see the raw data</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testGoogleSheets} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Test via API
          </Button>
          <Button onClick={testDirectGoogleSheets} disabled={loading} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Test Direct
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.source === 'google-sheets' ? (
                <>
                  <FileSpreadsheet className="h-4 w-4" />
                  Google Sheets Data
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Database Data
                </>
              )}
              <Badge variant="outline">
                {result.count || 0} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Response Details:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              
              {result.data && result.data.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Sample Data:</h3>
                  <div className="space-y-2">
                    {result.data.slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <pre className="text-sm">{JSON.stringify(item, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 