"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { 
  Play, 
  Copy, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Code2,
  Settings
} from "lucide-react"
import { toast } from "sonner"

interface ApiEndpoint {
  method: string
  path: string
  summary: string
  description: string
  tags: string[]
  requiresAuth?: boolean
  requestBody?: any
  responses?: any
  parameters?: any[]
}

interface ApiTesterProps {
  endpoint: ApiEndpoint
}

export function ApiTester({ endpoint }: ApiTesterProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [requestBody, setRequestBody] = useState(
    endpoint.requestBody ? JSON.stringify(endpoint.requestBody, null, 2) : ""
  )
  const [authToken, setAuthToken] = useState("")
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin
    }
    return "http://localhost:3000"
  }

  const buildUrl = () => {
    let url = endpoint.path
    
    // Replace path parameters
    if (endpoint.parameters) {
      endpoint.parameters.forEach(param => {
        if (param.name && parameters[param.name]) {
          url = url.replace(`{${param.name}}`, parameters[param.name])
        }
      })
    }
    
    // Add query parameters
    const queryParams = new URLSearchParams()
    if (endpoint.parameters) {
      endpoint.parameters.forEach(param => {
        if (param.name && parameters[param.name] && !url.includes(`{${param.name}}`)) {
          queryParams.append(param.name, parameters[param.name])
        }
      })
    }
    
    const queryString = queryParams.toString()
    return `${getBaseUrl()}${url}${queryString ? `?${queryString}` : ""}`
  }

  const testEndpoint = async () => {
    setIsLoading(true)
    setResponse(null)
    setResponseTime(null)
    setStatusCode(null)
    
    const startTime = Date.now()
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (endpoint.requiresAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      const requestOptions: RequestInit = {
        method: endpoint.method,
        headers
      }
      
      if (requestBody && (endpoint.method === 'POST' || endpoint.method === 'PUT' || endpoint.method === 'PATCH')) {
        try {
          JSON.parse(requestBody) // Validate JSON
          requestOptions.body = requestBody
        } catch (error) {
          toast.error("Invalid JSON in request body")
          setIsLoading(false)
          return
        }
      }
      
      const response = await fetch(buildUrl(), requestOptions)
      const endTime = Date.now()
      setResponseTime(endTime - startTime)
      setStatusCode(response.status)
      
      const responseData = await response.json()
      setResponse(responseData)
      
      if (response.ok) {
        toast.success(`Request successful (${response.status})`)
      } else {
        toast.error(`Request failed (${response.status})`)
      }
      
    } catch (error) {
      const endTime = Date.now()
      setResponseTime(endTime - startTime)
      setResponse({ error: error instanceof Error ? error.message : "Unknown error" })
      toast.error("Request failed")
    } finally {
      setIsLoading(false)
    }
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2))
      toast.success("Response copied to clipboard")
    }
  }

  const getStatusColor = (status: number | null) => {
    if (!status) return "bg-gray-100 text-gray-800"
    if (status >= 200 && status < 300) return "bg-green-100 text-green-800"
    if (status >= 400 && status < 500) return "bg-red-100 text-red-800"
    if (status >= 500) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: number | null) => {
    if (!status) return <AlertCircle className="w-4 h-4" />
    if (status >= 200 && status < 300) return <CheckCircle className="w-4 h-4" />
    return <XCircle className="w-4 h-4" />
  }

  return (
    <Card className="border border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Play className="w-5 h-5 text-blue-600" />
          API Tester
        </CardTitle>
        <CardDescription>
          Test this endpoint directly from your browser
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4 mt-4">
            {/* Authentication */}
            {endpoint.requiresAuth && (
              <div className="space-y-2">
                <Label htmlFor="auth-token" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Authorization Token
                </Label>
                <Input
                  id="auth-token"
                  placeholder="Enter your JWT token (without 'Bearer ')"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-600">
                  Get your token by logging in with: admin@Gemurai.rw / admin123
                </p>
              </div>
            )}

            {/* Parameters */}
            {endpoint.parameters && endpoint.parameters.length > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Parameters
                </Label>
                {endpoint.parameters.map((param, idx) => (
                  <div key={idx} className="space-y-1">
                    <Label htmlFor={`param-${param.name}`} className="text-sm">
                      {param.name}
                      {param.required && <span className="text-red-500 ml-1">*</span>}
                      <span className="text-gray-500 ml-1">({param.type})</span>
                    </Label>
                    <Input
                      id={`param-${param.name}`}
                      placeholder={param.description}
                      value={parameters[param.name] || ""}
                      onChange={(e) => setParameters(prev => ({
                        ...prev,
                        [param.name]: e.target.value
                      }))}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Request Body */}
            {(endpoint.method === 'POST' || endpoint.method === 'PUT' || endpoint.method === 'PATCH') && (
              <div className="space-y-2">
                <Label htmlFor="request-body" className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Request Body (JSON)
                </Label>
                <Textarea
                  id="request-body"
                  placeholder="Enter JSON request body"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="font-mono text-sm min-h-[120px]"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Request Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className="font-mono">{endpoint.method}</Badge>
                    <code className="bg-white px-2 py-1 rounded border">{buildUrl()}</code>
                  </div>
                  {endpoint.requiresAuth && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Auth:</span>
                      <code className="bg-white px-2 py-1 rounded border text-xs">
                        {authToken ? `Bearer ${authToken.substring(0, 20)}...` : "No token provided"}
                      </code>
                    </div>
                  )}
                  {requestBody && (
                    <div>
                      <span className="text-gray-600">Body:</span>
                      <pre className="bg-white p-2 rounded border text-xs mt-1 overflow-x-auto">
                        {requestBody}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={testEndpoint} 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Test Endpoint
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="response" className="space-y-4 mt-4">
            {response ? (
              <div className="space-y-4">
                {/* Response Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(statusCode)}
                    <Badge className={getStatusColor(statusCode)}>
                      {statusCode || "Unknown"}
                    </Badge>
                    {responseTime && (
                      <span className="text-sm text-gray-600">
                        {responseTime}ms
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={copyResponse}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Response
                  </Button>
                </div>

                {/* Response Body */}
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No response yet. Test the endpoint to see results here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 