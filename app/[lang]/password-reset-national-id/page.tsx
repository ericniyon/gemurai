'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, CheckCircle, AlertCircle } from 'lucide-react'

interface PasswordResetStep {
  step: 'request' | 'verify' | 'complete'
  data?: any
}

export default function PasswordResetNationalId() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<PasswordResetStep>({ step: 'request' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Step 1: Request password reset
  const [requestData, setRequestData] = useState({
    email: '',
    phone: '',
    nationalId: ''
  })

  // Step 2: Verification
  const [verificationData, setVerificationData] = useState({
    email: '',
    resetToken: '',
    nationalId: '',
    verificationCode: ''
  })

  // Step 3: Complete
  const [completeData, setCompleteData] = useState({
    verificationToken: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/v1/auth/password-reset-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Password reset instructions have been sent to your registered contact methods.')
        setCurrentStep({ 
          step: 'verify', 
          data: { 
            email: requestData.email || result.contactMethods.email,
            resetToken: result.resetToken,
            nationalId: requestData.nationalId
          }
        })
        setVerificationData({
          email: requestData.email || result.contactMethods.email,
          resetToken: result.resetToken,
          nationalId: requestData.nationalId,
          verificationCode: ''
        })
      } else {
        setError(result.message || 'Failed to process password reset request')
      }
    } catch (err) {
      setError('An error occurred while processing your request')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/v1/auth/password-reset-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('National ID and reset token verified successfully.')
        setCurrentStep({ 
          step: 'complete', 
          data: result 
        })
        setCompleteData({
          verificationToken: result.verificationToken,
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setError(result.message || 'Failed to verify reset request')
      }
    } catch (err) {
      setError('An error occurred while verifying your request')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/v1/auth/password-reset-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Password has been reset successfully! You can now log in with your new password.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(result.message || 'Failed to reset password')
      }
    } catch (err) {
      setError('An error occurred while resetting your password')
    } finally {
      setLoading(false)
    }
  }

  const renderRequestStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Reset Password with National ID</CardTitle>
        <CardDescription>
          Enter your national ID and contact information to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <Label htmlFor="nationalId">National ID *</Label>
            <Input
              id="nationalId"
              type="text"
              value={requestData.nationalId}
              onChange={(e) => setRequestData({ ...requestData, nationalId: e.target.value })}
              placeholder="Enter your national ID"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={requestData.email}
              onChange={(e) => setRequestData({ ...requestData, email: e.target.value })}
              placeholder="Enter your email address"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={requestData.phone}
              onChange={(e) => setRequestData({ ...requestData, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="text-sm text-gray-600">
            <p>Note: You must provide either an email address or phone number (or both) to receive reset instructions.</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Request Password Reset
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  const renderVerifyStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle>Verify Your Identity</CardTitle>
        <CardDescription>
          Enter the verification code sent to your phone and confirm your national ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyReset} className="space-y-4">
          <div>
            <Label htmlFor="verifyEmail">Email Address</Label>
            <Input
              id="verifyEmail"
              type="email"
              value={verificationData.email}
              readOnly
              className="bg-gray-50"
            />
          </div>
          
          <div>
            <Label htmlFor="verifyNationalId">National ID</Label>
            <Input
              id="verifyNationalId"
              type="text"
              value={verificationData.nationalId}
              onChange={(e) => setVerificationData({ ...verificationData, nationalId: e.target.value })}
              placeholder="Re-enter your national ID"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="verificationCode">SMS Verification Code</Label>
            <Input
              id="verificationCode"
              type="text"
              value={verificationData.verificationCode}
              onChange={(e) => setVerificationData({ ...verificationData, verificationCode: e.target.value })}
              placeholder="Enter 6-digit code from SMS"
              maxLength={6}
            />
            <p className="text-sm text-gray-600 mt-1">
              Check your phone for the verification code sent via SMS
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCurrentStep({ step: 'request' })}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  const renderCompleteStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle>Set New Password</CardTitle>
        <CardDescription>
          Create a strong new password for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCompleteReset} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={completeData.newPassword}
              onChange={(e) => setCompleteData({ ...completeData, newPassword: e.target.value })}
              placeholder="Enter new password"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={completeData.confirmPassword}
              onChange={(e) => setCompleteData({ ...completeData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCurrentStep({ step: 'verify' })}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {currentStep.step === 'request' && renderRequestStep()}
        {currentStep.step === 'verify' && renderVerifyStep()}
        {currentStep.step === 'complete' && renderCompleteStep()}
        
        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            onClick={() => router.push('/login')}
            className="text-sm"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  )
}
