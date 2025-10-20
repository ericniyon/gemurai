"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Save, Bell, BellOff, Mail, MessageSquare, Smartphone } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface NotificationPreferences {
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  types: Record<string, boolean>
  frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY'
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface NotificationPreferencesProps {
  userId: string
}

const notificationTypes = [
  { key: 'ORDER_CREATED', label: 'Order Created', category: 'Orders' },
  { key: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed', category: 'Orders' },
  { key: 'ORDER_APPROVED', label: 'Order Approved', category: 'Orders' },
  { key: 'ORDER_REJECTED', label: 'Order Rejected', category: 'Orders' },
  { key: 'ORDER_COMPLETED', label: 'Order Completed', category: 'Orders' },
  { key: 'ORDER_CANCELLED', label: 'Order Cancelled', category: 'Orders' },
  
  { key: 'NEW_ORDER_RECEIVED', label: 'New Order Received', category: 'Employer' },
  { key: 'PAYMENT_PENDING', label: 'Payment Pending', category: 'Employer' },
  { key: 'ORDER_REQUIRES_APPROVAL', label: 'Order Requires Approval', category: 'Employer' },
  { key: 'ORDER_COMPLETED_EMPLOYER', label: 'Order Completed', category: 'Employer' },
  
  { key: 'LOW_STOCK_ALERT', label: 'Low Stock Alert', category: 'Inventory' },
  { key: 'OUT_OF_STOCK_ALERT', label: 'Out of Stock Alert', category: 'Inventory' },
  { key: 'STOCK_DEDUCTED', label: 'Stock Deducted', category: 'Inventory' },
  { key: 'STOCK_ADDED_TO_DCC', label: 'Stock Added to DCC', category: 'Inventory' },
  { key: 'STOCK_RESTORED', label: 'Stock Restored', category: 'Inventory' },
  
  { key: 'VOUCHER_USED', label: 'Voucher Used', category: 'Vouchers' },
  { key: 'VOUCHER_EXPIRED', label: 'Voucher Expired', category: 'Vouchers' },
  { key: 'INSUFFICIENT_VOUCHER_BALANCE', label: 'Insufficient Voucher Balance', category: 'Vouchers' },
  
  { key: 'ORDER_SHIPPED', label: 'Order Shipped', category: 'Delivery' },
  { key: 'ORDER_DELIVERED', label: 'Order Delivered', category: 'Delivery' },
  { key: 'DELIVERY_FAILED', label: 'Delivery Failed', category: 'Delivery' },
  
  { key: 'PAYMENT_RECEIVED', label: 'Payment Received', category: 'Financial' },
  { key: 'COMMISSION_CALCULATED', label: 'Commission Calculated', category: 'Financial' },
  { key: 'WALLET_UPDATED', label: 'Wallet Updated', category: 'Financial' },
  
  { key: 'ORDER_PROCESSING_ERROR', label: 'Order Processing Error', category: 'Errors' },
  { key: 'PAYMENT_FAILED', label: 'Payment Failed', category: 'Errors' },
  { key: 'DATABASE_ERROR', label: 'Database Error', category: 'Errors' },
  { key: 'TRANSACTION_TIMEOUT', label: 'Transaction Timeout', category: 'Errors' },
  { key: 'VALIDATION_ERROR', label: 'Validation Error', category: 'Errors' },
  { key: 'NETWORK_ERROR', label: 'Network Error', category: 'Errors' }
]

const categories = ['Orders', 'Employer', 'Inventory', 'Vouchers', 'Delivery', 'Financial', 'Errors']

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    types: {},
    frequency: 'IMMEDIATE',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [userId])

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications/preferences')
      const data = await response.json()
      
      if (data.success) {
        setPreferences(data.data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Notification preferences updated successfully"
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateChannelPreference = (channel: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: value
    }))
  }

  const updateTypePreference = (type: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: value
      }
    }))
  }

  const updateFrequency = (frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY') => {
    setPreferences(prev => ({
      ...prev,
      frequency
    }))
  }

  const updateQuietHours = (field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }))
  }

  const toggleAllInCategory = (category: string, enabled: boolean) => {
    const categoryTypes = notificationTypes.filter(nt => nt.category === category)
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        ...categoryTypes.reduce((acc, nt) => ({ ...acc, [nt.key]: enabled }), {})
      }
    }))
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Loading preferences...
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Notification Settings</h3>
        <Button
          size="sm"
          onClick={savePreferences}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Channel Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="in-app">In-App Notifications</Label>
            </div>
            <Switch
              id="in-app"
              checked={preferences.inAppEnabled}
              onCheckedChange={(value) => updateChannelPreference('inAppEnabled', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <Label htmlFor="email">Email Notifications</Label>
            </div>
            <Switch
              id="email"
              checked={preferences.emailEnabled}
              onCheckedChange={(value) => updateChannelPreference('emailEnabled', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <Label htmlFor="sms">SMS Notifications</Label>
            </div>
            <Switch
              id="sms"
              checked={preferences.smsEnabled}
              onCheckedChange={(value) => updateChannelPreference('smsEnabled', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <Label htmlFor="push">Push Notifications</Label>
            </div>
            <Switch
              id="push"
              checked={preferences.pushEnabled}
              onCheckedChange={(value) => updateChannelPreference('pushEnabled', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Frequency */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Notification Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={preferences.frequency} onValueChange={updateFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IMMEDIATE">Immediate</SelectItem>
              <SelectItem value="DAILY">Daily Digest</SelectItem>
              <SelectItem value="WEEKLY">Weekly Digest</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quiet Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
            <Switch
              id="quiet-hours"
              checked={preferences.quietHours.enabled}
              onCheckedChange={(value) => updateQuietHours('enabled', value)}
            />
          </div>
          
          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start-time" className="text-xs">Start Time</Label>
                <Select 
                  value={preferences.quietHours.start} 
                  onValueChange={(value) => updateQuietHours('start', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="end-time" className="text-xs">End Time</Label>
                <Select 
                  value={preferences.quietHours.end} 
                  onValueChange={(value) => updateQuietHours('end', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map(category => {
            const categoryTypes = notificationTypes.filter(nt => nt.category === category)
            const enabledCount = categoryTypes.filter(nt => preferences.types[nt.key]).length
            
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{category}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {enabledCount}/{categoryTypes.length}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleAllInCategory(category, true)}
                      className="text-xs h-6 px-2"
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleAllInCategory(category, false)}
                      className="text-xs h-6 px-2"
                    >
                      None
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {categoryTypes.map(type => (
                    <div key={type.key} className="flex items-center justify-between">
                      <Label htmlFor={type.key} className="text-sm">
                        {type.label}
                      </Label>
                      <Switch
                        id={type.key}
                        checked={preferences.types[type.key] || false}
                        onCheckedChange={(value) => updateTypePreference(type.key, value)}
                      />
                    </div>
                  ))}
                </div>
                
                {category !== categories[categories.length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
