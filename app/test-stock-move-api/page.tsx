'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function TestStockMoveAPI() {
  const [stockMoveId, setStockMoveId] = useState('cmcry38zv0001ddpgg1pna0fo')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const testConfirmAPI = async () => {
    try {
      setLoading(true)
      setResult(null)
      
      console.log('Testing stock move confirm API...')
      
      const response = await fetch(`/api/v1/superadmin/stock-moves/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: stockMoveId }),
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('Response data:', data)
      
      setResult({
        status: response.status,
        ok: response.ok,
        data
      })
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Stock move confirmed successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to confirm stock move',
          variant: 'destructive',
        })
      }
      
    } catch (error) {
      console.error('Error testing API:', error)
      setResult({
        error: error instanceof Error ? error.message : String(error)
      })
      toast({
        title: 'Error',
        description: 'Failed to test API',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const testAuthAPI = async () => {
    try {
      setLoading(true)
      setResult(null)
      
      console.log('Testing auth API...')
      
      const response = await fetch('/api/v1/superadmin/stock-moves', {
        method: 'GET',
        credentials: 'include'
      })
      
      console.log('Auth test response status:', response.status)
      
      const data = await response.json()
      console.log('Auth test response data:', data)
      
      setResult({
        status: response.status,
        ok: response.ok,
        data
      })
      
    } catch (error) {
      console.error('Error testing auth:', error)
      setResult({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const testSimpleAPI = async () => {
    try {
      setLoading(true)
      setResult(null)
      
      console.log('Testing simple API...')
      
      const response = await fetch('/api/v1/test-simple', {
        method: 'POST',
        credentials: 'include'
      })
      
      console.log('Simple test response status:', response.status)
      
      const data = await response.json()
      console.log('Simple test response data:', data)
      
      setResult({
        status: response.status,
        ok: response.ok,
        data
      })
      
    } catch (error) {
      console.error('Error testing simple API:', error)
      setResult({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseAPI = async () => {
    try {
      setLoading(true)
      setResult(null)
      
      console.log('Testing database API...')
      
      const response = await fetch('/api/v1/test-db', {
        method: 'GET',
        credentials: 'include'
      })
      
      console.log('Database test response status:', response.status)
      
      const data = await response.json()
      console.log('Database test response data:', data)
      
      setResult({
        status: response.status,
        ok: response.ok,
        data
      })
      
    } catch (error) {
      console.error('Error testing database API:', error)
      setResult({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Stock Move API</CardTitle>
          <CardDescription>
            Test the stock move confirmation API with proper authentication
          </CardDescription>
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
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={testSimpleAPI}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Testing...' : 'Test Simple API'}
            </Button>
            
            <Button 
              onClick={testDatabaseAPI}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Testing...' : 'Test Database'}
            </Button>
            
            <Button 
              onClick={testAuthAPI}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Testing...' : 'Test Auth'}
            </Button>
            
            <Button 
              onClick={testConfirmAPI}
              disabled={loading || !stockMoveId}
            >
              {loading ? 'Testing...' : 'Test Confirm API'}
            </Button>
          </div>
          
          {result && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 