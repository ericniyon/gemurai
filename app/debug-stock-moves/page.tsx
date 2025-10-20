'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DebugStockMoves() {
  const [stockMoveId, setStockMoveId] = useState('cmcpfvcsf0001dd3ke5xy10b1')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testNewEndpoint = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('=== TESTING NEW ENDPOINT ===')
      console.log('URL: /api/v1/superadmin/stock-moves/confirm')
      console.log('Body:', { id: stockMoveId })
      
      const response = await fetch('/api/v1/superadmin/stock-moves/confirm', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: stockMoveId }),
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('Response data:', data)
      
      setResult({
        endpoint: 'NEW',
        status: response.status,
        ok: response.ok,
        data
      })
      
    } catch (error) {
      console.error('Error:', error)
      setResult({
        endpoint: 'NEW',
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const testOldEndpoint = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('=== TESTING OLD ENDPOINT (SHOULD FAIL) ===')
      console.log('URL: /api/v1/superadmin/stock-moves/' + stockMoveId + '/confirm')
      
      const response = await fetch(`/api/v1/superadmin/stock-moves/${stockMoveId}/confirm`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('Response data:', data)
      
      setResult({
        endpoint: 'OLD',
        status: response.status,
        ok: response.ok,
        data
      })
      
    } catch (error) {
      console.error('Error:', error)
      setResult({
        endpoint: 'OLD',
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Debug Stock Move Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stockMoveId">Stock Move ID</Label>
            <Input
              id="stockMoveId"
              value={stockMoveId}
              onChange={(e) => setStockMoveId(e.target.value)}
              placeholder="Enter stock move ID"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={testNewEndpoint}
              disabled={loading}
              className="flex-1"
            >
              Test NEW Endpoint
            </Button>
            
            <Button 
              onClick={testOldEndpoint}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Test OLD Endpoint
            </Button>
          </div>
          
          {result && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">
                  Result ({result.endpoint} endpoint)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Expected behavior:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>NEW endpoint should return 401 Unauthorized (if not logged in) or work properly (if logged in)</li>
              <li>OLD endpoint should return 404 Not Found or fail with ECONNRESET</li>
            </ul>
            <p className="mt-2"><strong>Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Open browser Developer Tools (F12)</li>
              <li>Go to Network tab</li>
              <li>Click the test buttons and check which URLs are actually being called</li>
              <li>If you see the old URL pattern, clear browser cache and hard refresh (Ctrl+Shift+R)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 