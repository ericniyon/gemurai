"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, Shield, Info } from 'lucide-react'
import Link from 'next/link'

interface AuthHelperProps {
  lang?: string
}

export function AuthHelper({ lang = 'en' }: AuthHelperProps) {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth-status')
      const data = await response.json()
      setAuthStatus(data)
    } catch (error) {
      console.error('Failed to check auth status:', error)
      setAuthStatus({ authenticated: false, message: 'Failed to check authentication' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Checking authentication...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (authStatus?.authenticated) {
    return null // Don't show anything if authenticated
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {lang === 'rw' ? 'Uburenganzira' : 'Authentication Required'}
        </CardTitle>
        <CardDescription>
          {lang === 'rw' 
            ? 'Ukeneye kwinjira kugirango ubone amakuru yose.'
            : 'You need to log in to access all features.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {lang === 'rw'
              ? 'Amakuru ya vuba yerekwa ariko ntabwo ufite uburenganzira bwose.'
              : 'Limited data is shown but you may not have full access.'
            }
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-2">
          <Link href={`/${lang}/login`} className="w-full">
            <Button className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              {lang === 'rw' ? 'Injira' : 'Log In'}
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={checkAuthStatus}
          >
            {lang === 'rw' ? 'Ongera ugerageze' : 'Check Again'}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Status:</strong> {authStatus?.message || 'Unknown'}</p>
          <p><strong>NextAuth:</strong> {authStatus?.nextAuthSession ? 'Yes' : 'No'}</p>
          <p><strong>Custom Token:</strong> {authStatus?.customToken ? 'Yes' : 'No'}</p>
          <p><strong>Token Valid:</strong> {authStatus?.tokenValid ? 'Yes' : 'No'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
