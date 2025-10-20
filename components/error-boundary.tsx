"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error!}
            reset={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
          />
        )
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-800">Application Error</CardTitle>
              <CardDescription>A client-side exception has occurred. Please see the details below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">Error Details:</h3>
                <p className="text-sm text-red-700 font-mono">{this.state.error?.message || "Unknown error"}</p>
                {this.state.error?.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                      View Stack Trace
                    </summary>
                    <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto max-h-40">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Troubleshooting Steps:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>1. Check the browser console (F12) for additional errors</li>
                  <li>2. Clear your browser cache and cookies</li>
                  <li>3. Try refreshing the page</li>
                  <li>4. Try opening in incognito/private mode</li>
                  <li>5. Disable browser extensions temporarily</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/application-debug")}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Debug
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
