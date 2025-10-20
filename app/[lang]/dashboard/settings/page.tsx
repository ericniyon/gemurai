"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Bell, Shield, CreditCard, Eye, EyeOff, CheckCircle, XCircle, Loader2, Settings, Save, RotateCcw, Camera, Palette, Globe, Smartphone, Lock, DollarSign, Calendar, Mail, Phone, MapPin, Building2, Briefcase, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ThemeSwitch } from "@/components/theme-switch"
import { useAuth } from "@/hooks/use-auth"
import { useAuthStore } from "@/lib/stores/auth-store"
import "./settings.css"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar: string | null
  role: string
  permissions: string[]
  bio: string
  location: string
  commission: number
  mobileMoney: string
  bankAccount: string
  bankName: string
  createdAt: string
  updatedAt: string
}

export default function DCCSettings() {
  const { user: authUser } = useAuth()
  const { refreshUser } = useAuthStore()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  })
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    dateOfBirth: "",
    gender: "",
    occupation: "",
    company: "",
    website: "",
    mobileMoney: "",
    bankAccount: "",
    bankName: ""
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    jobAlerts: true,
    trainingReminders: true,
    paymentNotifications: true,
    twoFactorAuth: false,
    loginAlerts: true
  })

  // Preference settings state
  const [preferenceSettings, setPreferenceSettings] = useState({
    language: "en",
    timezone: "africa-kigali",
    darkMode: false,
    autoSync: true
  })

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    mobileMoney: "",
    bankAccount: "",
    bankName: ""
  })

  // Loading states for different sections
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [savingPayments, setSavingPayments] = useState(false)
  
  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("No authentication token found")
        return
      }

      console.log("Fetching user profile with token:", token.substring(0, 20) + "...")

      const response = await fetch("/api/v1/users/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      console.log("Profile API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Profile API error response:", errorText)
        throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Profile API response data:", data)
      
      if (data.success) {
        setUserProfile(data.data)
              setFormData({
        name: data.data.name || "",
        email: data.data.email || "",
        phone: data.data.phone || "",
        bio: data.data.bio || "",
        location: data.data.location || "",
        dateOfBirth: data.data.dateOfBirth || "",
        gender: data.data.gender || "",
        occupation: data.data.occupation || "",
        company: data.data.company || "",
        website: data.data.website || "",
        mobileMoney: data.data.mobileMoney || "",
        bankAccount: data.data.bankAccount || "",
        bankName: data.data.bankName || ""
      })
      } else {
        throw new Error(data.message || "Failed to fetch user profile")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast.error(error instanceof Error ? error.message : "Failed to load user profile")
    } finally {
      setLoading(false)
    }
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    // Validate form data
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error("Please enter a valid full name (at least 2 characters)")
      return
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (!formData.phone || formData.phone.trim().length < 10) {
      toast.error("Please enter a valid phone number (at least 10 digits)")
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("No authentication token found")
        return
      }

      console.log("Saving profile data:", formData)

      const response = await fetch("/api/v1/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          bio: formData.bio.trim(),
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          occupation: formData.occupation.trim(),
          company: formData.company.trim(),
          website: formData.website.trim()
        })
      })

      console.log("Profile update response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Profile update error response:", errorText)
        throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Profile update response data:", data)
      
      if (data.success) {
        setUserProfile(data.data)
        
        // Update the auth store user data directly instead of refreshing
        try {
          const { setUser } = useAuthStore.getState()
          if (setUser) {
            // Update the user data in the auth store with the new profile data
            const currentUser = useAuthStore.getState().user
            if (currentUser) {
              setUser({
                ...currentUser,
                name: data.data.name,
                email: data.data.email,
                phone: data.data.phone,
                avatar: data.data.avatar
              })
            }
          }
        } catch (error) {
          console.warn("Failed to update auth store, but profile was updated:", error)
          // Don't throw error here as the profile update was successful
        }
        
        toast.success("Profile updated successfully!")
      } else {
        throw new Error(data.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    }
  }

  const passwordValidation = validatePassword(passwordData.newPassword)
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword.length > 0

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    setPasswordError("")
    setPasswordSuccess("")
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All password fields are required")
      return
    }

    if (!passwordValidation.isValid) {
      setPasswordError("Please ensure your new password meets all requirements")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirmation do not match")
      return
    }

    setPasswordLoading(true)
    setPasswordError("")
    setPasswordSuccess("")

    try {
      const response = await fetch("/api/v1/users/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPasswordSuccess("Password updated successfully!")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        toast.success("Password updated successfully!")
      } else {
        setPasswordError(data.message || "Failed to update password")
      }
    } catch (error) {
      setPasswordError("An error occurred while updating your password")
      console.error("Password update error:", error)
    } finally {
      setPasswordLoading(false)
    }
  }

  // Validation functions
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 2) {
          return "Name must be at least 2 characters long"
        }
        break
      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address"
        }
        break
      case 'phone':
        if (!value || value.trim().length < 10) {
          return "Phone number must be at least 10 digits"
        }
        break
    }
    return ""
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    const error = validateField(field, value)
    setFormErrors(prev => ({ ...prev, [field]: error }))
  }

  // Update notification settings
  const handleUpdateNotifications = async () => {
    setSavingNotifications(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("No authentication token found")
        return
      }

      const response = await fetch("/api/v1/users/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(notificationSettings)
      })

      if (!response.ok) {
        throw new Error("Failed to update notification settings")
      }

      const data = await response.json()
      if (data.success) {
        toast.success("Notification settings updated successfully!")
      } else {
        throw new Error(data.message || "Failed to update notification settings")
      }
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update notification settings")
    } finally {
      setSavingNotifications(false)
    }
  }

  // Update preference settings
  const handleUpdatePreferences = async () => {
    setSavingPreferences(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("No authentication token found")
        return
      }

      const response = await fetch("/api/v1/users/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(preferenceSettings)
      })

      if (!response.ok) {
        throw new Error("Failed to update preference settings")
      }

      const data = await response.json()
      if (data.success) {
        toast.success("Preference settings updated successfully!")
      } else {
        throw new Error(data.message || "Failed to update preference settings")
      }
    } catch (error) {
      console.error("Error updating preference settings:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update preference settings")
    } finally {
      setSavingPreferences(false)
    }
  }

  // Update payment settings
  const handleUpdatePayments = async () => {
    setSavingPayments(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("No authentication token found")
        return
      }

      const response = await fetch("/api/v1/users/payments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(paymentSettings)
      })

      if (!response.ok) {
        throw new Error("Failed to update payment settings")
      }

      const data = await response.json()
      if (data.success) {
        toast.success("Payment settings updated successfully!")
      } else {
        throw new Error(data.message || "Failed to update payment settings")
      }
    } catch (error) {
      console.error("Error updating payment settings:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update payment settings")
    } finally {
      setSavingPayments(false)
    }
  }

  // Avatar upload functions
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, or GIF)")
      return
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 2MB")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload avatar
    uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    setUploadingAvatar(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("No authentication token found")
        return
      }

      console.log("Uploading avatar:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      const formData = new FormData()
      formData.append('avatar', file)

      console.log("FormData created, sending request...")

      const response = await fetch("/api/v1/users/avatar", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Upload failed with status:", response.status)
        console.error("Error response:", errorText)
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Upload response data:", data)
      
      if (data.success) {
        setUserProfile(prev => prev ? { ...prev, avatar: data.data.avatar } : null)
        setAvatarPreview(null)
        
        // Update the auth store user data directly instead of refreshing
        try {
          const { setUser } = useAuthStore.getState()
          if (setUser) {
            // Update the user data in the auth store with the new avatar
            const currentUser = useAuthStore.getState().user
            if (currentUser) {
              setUser({
                ...currentUser,
                avatar: data.data.avatar
              })
            }
          }
        } catch (error) {
          console.warn("Failed to update auth store, but avatar was updated:", error)
          // Don't throw error here as the avatar update was successful
        }
        
        toast.success("Avatar updated successfully!")
      } else {
        throw new Error(data.message || "Failed to upload avatar")
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar")
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const removeAvatar = async () => {
    setUploadingAvatar(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("No authentication token found")
        return
      }

      const response = await fetch("/api/v1/users/avatar", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to remove avatar")
      }

      const data = await response.json()
      if (data.success) {
        setUserProfile(prev => prev ? { ...prev, avatar: null } : null)
        setAvatarPreview(null)
        
        // Update the auth store user data directly instead of refreshing
        try {
          const { setUser } = useAuthStore.getState()
          if (setUser) {
            // Update the user data in the auth store with the removed avatar
            const currentUser = useAuthStore.getState().user
            if (currentUser) {
              setUser({
                ...currentUser,
                avatar: null
              })
            }
          }
        } catch (error) {
          console.warn("Failed to update auth store, but avatar was removed:", error)
          // Don't throw error here as the avatar removal was successful
        }
        
        toast.success("Avatar removed successfully!")
      } else {
        throw new Error(data.message || "Failed to remove avatar")
      }
    } catch (error) {
      console.error("Error removing avatar:", error)
      toast.error(error instanceof Error ? error.message : "Failed to remove avatar")
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Load user profile and settings on component mount
  useEffect(() => {
    if (authUser) {
      fetchUserProfile()
      fetchSettings()
    }
  }, [authUser])

  // Fetch all settings data
  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) return

      // Fetch notification settings
      const notificationsResponse = await fetch("/api/v1/users/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        if (notificationsData.success) {
          setNotificationSettings(notificationsData.data)
        }
      }

      // Fetch preference settings
      const preferencesResponse = await fetch("/api/v1/users/preferences", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json()
        if (preferencesData.success) {
          setPreferenceSettings(preferencesData.data)
        }
      }

      // Fetch payment settings
      const paymentsResponse = await fetch("/api/v1/users/payments", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        if (paymentsData.success) {
          setPaymentSettings(paymentsData.data)
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  if (loading) {
  return (
      <div className="settings-dashboard">
        <div className="settings-header">
          <div className="settings-header-content">
            <h1 className="settings-title">Settings Dashboard</h1>
            <p className="settings-subtitle">Loading your profile information...</p>
        </div>
        </div>
        <div className="settings-tabs">
          <div className="settings-tab-content">
            <div className="settings-card">
              <div className="settings-card-content">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading profile...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-dashboard">
      {/* Enhanced Header */}
      <div className="settings-header">
        <div className="settings-header-content">
          <h1 className="settings-title">Settings Dashboard</h1>
          <p className="settings-subtitle">
            Welcome back, {userProfile?.name || authUser?.name || "User"}! Manage your account preferences, security, and personal information
          </p>
          <div className="settings-actions">
            <button className="settings-button secondary">
              <RotateCcw className="h-4 w-4" />
            Reset to Defaults
            </button>
            <button 
              className="settings-button primary" 
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 loading-spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
            Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="settings-tabs">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="settings-tabs-list">
            <TabsTrigger value="profile" className="settings-tab-trigger">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="settings-tab-trigger">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="settings-tab-trigger">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="payments" className="settings-tab-trigger">
              <DollarSign className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="preferences" className="settings-tab-trigger">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
        </TabsList>

          <TabsContent value="profile" className="settings-tab-content">
            <div className="settings-card">
              <div className="settings-card-header">
                <h2 className="settings-card-title">
                <User className="h-5 w-5" />
                Personal Information
                </h2>
                <p className="settings-card-description">Update your personal details and contact information</p>
              </div>
              <div className="settings-card-content">
                {/* Enhanced Avatar Section */}
                <div className="profile-avatar-section">
                  <Avatar className="profile-avatar">
                    <AvatarImage 
                      src={avatarPreview || userProfile?.avatar || "/placeholder-avatar.jpg"} 
                      alt="Profile" 
                    />
                    <AvatarFallback>
                      {userProfile?.name?.charAt(0) || authUser?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                </Avatar>
                  <div className="avatar-actions">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    <label 
                      htmlFor="avatar-upload" 
                      className={`settings-button secondary cursor-pointer ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 className="h-4 w-4 loading-spinner" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                    Change Avatar
                        </>
                      )}
                    </label>
                    {userProfile?.avatar && (
                      <button 
                        onClick={removeAvatar}
                        disabled={uploadingAvatar}
                        className={`settings-button secondary mt-2 ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Avatar
                      </button>
                    )}
                  <p className="text-sm text-muted-foreground">
                    JPG, GIF or PNG. Max size of 2MB.
                  </p>
                </div>
              </div>

                {/* User Role Info */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Account Information</span>
                </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium">{userProfile?.role || "N/A"}</span>
                </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="font-medium">
                        {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : "N/A"}
                      </span>
              </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">
                        {userProfile?.updatedAt ? new Date(userProfile.updatedAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                  </div>
              </div>

                {/* Enhanced Form Grid */}
                <div className="form-grid">
                  <div className="form-field">
                    <Label htmlFor="full-name" className="form-label">
                      <User className="h-4 w-4 inline mr-2" />
                      Full Name
                    </Label>
                    <Input 
                      id="full-name" 
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className={`form-input ${formErrors.name ? 'border-red-500' : ''}`}
                      required
                      minLength={2}
                      maxLength={100}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="form-field">
                    <Label htmlFor="email" className="form-label">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className={`form-input ${formErrors.email ? 'border-red-500' : ''}`}
                      required
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div className="form-field">
                    <Label htmlFor="phone" className="form-label">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number
                    </Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className={`form-input ${formErrors.phone ? 'border-red-500' : ''}`}
                      required
                      pattern="[\+]?[0-9\s\-\(\)]+"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  <div className="form-field">
                    <Label htmlFor="location" className="form-label">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Location
                    </Label>
                    <Input 
                      id="location" 
                      type="text"
                      placeholder="Enter your location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="form-input" 
                      maxLength={200}
                    />
              </div>

              </div>

                <div className="form-field">
                  <Label htmlFor="bio" className="form-label">
                    <User className="h-4 w-4 inline mr-2" />
                    Bio
                  </Label>
                <Textarea
                  id="bio"
                    placeholder="Tell us about yourself, your experience, and what you do..."
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="form-input form-textarea"
                    maxLength={500}
                    rows={4}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Share a brief description about yourself
                    </p>
                    <span className="text-xs text-gray-400">
                      {formData.bio.length}/500
                    </span>
              </div>
                </div>

                {/* Additional Information Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Additional Information
                  </h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <Label htmlFor="date-of-birth" className="form-label">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Date of Birth
                      </Label>
                      <Input 
                        id="date-of-birth" 
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="form-input" 
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="gender" className="form-label">
                        <User className="h-4 w-4 inline mr-2" />
                        Gender
                      </Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-field">
                      <Label htmlFor="occupation" className="form-label">
                        <Briefcase className="h-4 w-4 inline mr-2" />
                        Occupation
                      </Label>
                      <Input 
                        id="occupation" 
                        type="text"
                        placeholder="Enter your occupation"
                        value={formData.occupation}
                        onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                        className="form-input" 
                        maxLength={100}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="company" className="form-label">
                        <Building2 className="h-4 w-4 inline mr-2" />
                        Company
                      </Label>
                      <Input 
                        id="company" 
                        type="text"
                        placeholder="Enter your company name"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="form-input" 
                        maxLength={100}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="website" className="form-label">
                        <Globe className="h-4 w-4 inline mr-2" />
                        Website
                      </Label>
                      <Input 
                        id="website" 
                        type="url"
                        placeholder="https://your-website.com"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="form-input" 
                        maxLength={200}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </TabsContent>

          <TabsContent value="notifications" className="settings-tab-content">
            <div className="settings-card">
              <div className="settings-card-header">
                <h2 className="settings-card-title">
                <Bell className="h-5 w-5" />
                Notification Preferences
                </h2>
                <p className="settings-card-description">Choose how you want to receive notifications</p>
                </div>
              <div className="settings-card-content">
                <div className="switch-container">
                  <div>
                    <div className="switch-label">Email Notifications</div>
                    <div className="switch-description">Receive notifications via email</div>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
              </div>

                <div className="switch-container">
                  <div>
                    <div className="switch-label">SMS Notifications</div>
                    <div className="switch-description">Receive important updates via SMS</div>
                </div>
                  <Switch 
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
              </div>

                <div className="switch-container">
                  <div>
                    <div className="switch-label">Job Alerts</div>
                    <div className="switch-description">Get notified about new job opportunities</div>
                </div>
                  <Switch 
                    checked={notificationSettings.jobAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, jobAlerts: checked }))}
                  />
              </div>

                <div className="switch-container">
                  <div>
                    <div className="switch-label">Training Reminders</div>
                    <div className="switch-description">Reminders about upcoming training</div>
                </div>
                  <Switch 
                    checked={notificationSettings.trainingReminders}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, trainingReminders: checked }))}
                  />
              </div>

                <div className="switch-container">
                  <div>
                    <div className="switch-label">Payment Notifications</div>
                    <div className="switch-description">Updates about commissions and payments</div>
                </div>
                  <Switch 
                    checked={notificationSettings.paymentNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, paymentNotifications: checked }))}
                  />
              </div>

                <div className="switch-container">
                  <div>
                    <div className="switch-label">Two-Factor Authentication</div>
                    <div className="switch-description">Add an extra layer of security</div>
                </div>
                  <Switch 
                    checked={notificationSettings.twoFactorAuth}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                  />
              </div>

                <div className="switch-container">
                  <div>
                    <div className="switch-label">Login Alerts</div>
                    <div className="switch-description">Get notified of new login attempts</div>
                  </div>
                  <Switch 
                    checked={notificationSettings.loginAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, loginAlerts: checked }))}
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end mt-6 pt-6 border-t">
                  <button 
                    onClick={handleUpdateNotifications}
                    disabled={savingNotifications}
                    className="settings-button primary"
                  >
                    {savingNotifications ? (
                      <>
                        <Loader2 className="h-4 w-4 loading-spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Notification Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
        </TabsContent>

          <TabsContent value="security" className="settings-tab-content">
            <div className="settings-card">
              <div className="settings-card-header">
                <h2 className="settings-card-title">
                <Shield className="h-5 w-5" />
                Security Settings
                </h2>
                <p className="settings-card-description">Manage your account security and privacy</p>
              </div>
              <div className="settings-card-content">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="form-field">
                    <Label htmlFor="current-password" className="form-label">Current Password</Label>
                    <div className="password-field">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      placeholder="Enter your current password"
                        className="form-input"
                    />
                      <button
                      type="button"
                        className="password-toggle"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                      ) : (
                          <Eye className="h-4 w-4" />
                      )}
                      </button>
                  </div>
                </div>

                  <div className="form-field">
                    <Label htmlFor="new-password" className="form-label">New Password</Label>
                    <div className="password-field">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      placeholder="Enter your new password"
                        className="form-input"
                    />
                      <button
                      type="button"
                        className="password-toggle"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                      ) : (
                          <Eye className="h-4 w-4" />
                      )}
                      </button>
                  </div>
                </div>

                  <div className="form-field">
                    <Label htmlFor="confirm-password" className="form-label">Confirm New Password</Label>
                    <div className="password-field">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      placeholder="Confirm your new password"
                        className="form-input"
                    />
                      <button
                      type="button"
                        className="password-toggle"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                      ) : (
                          <Eye className="h-4 w-4" />
                      )}
                      </button>
                  </div>
                </div>

                {passwordData.newPassword && (
                    <div className="password-requirements">
                      <p className="font-medium text-gray-700 mb-3">Password Requirements:</p>
                      <div className="requirement-item" className={`requirement-item ${passwordValidation.minLength ? 'valid' : 'invalid'}`}>
                        {passwordValidation.minLength ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        At least 8 characters long
                      </div>
                      <div className="requirement-item" className={`requirement-item ${passwordValidation.hasUpperCase ? 'valid' : 'invalid'}`}>
                        {passwordValidation.hasUpperCase ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Contains at least one uppercase letter
                      </div>
                      <div className="requirement-item" className={`requirement-item ${passwordValidation.hasLowerCase ? 'valid' : 'invalid'}`}>
                        {passwordValidation.hasLowerCase ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Contains at least one lowercase letter
                      </div>
                      <div className="requirement-item" className={`requirement-item ${passwordValidation.hasNumbers ? 'valid' : 'invalid'}`}>
                        {passwordValidation.hasNumbers ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Contains at least one number
                      </div>
                      <div className="requirement-item" className={`requirement-item ${passwordValidation.hasSpecialChar ? 'valid' : 'invalid'}`}>
                        {passwordValidation.hasSpecialChar ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Contains at least one special character
                      </div>
                      <div className="requirement-item" className={`requirement-item ${passwordsMatch ? 'valid' : 'invalid'}`}>
                        {passwordsMatch ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Passwords match
                      </div>
                  </div>
                )}

                {passwordError && (
                    <div className="alert error">
                      <XCircle className="h-4 w-4" />
                      <span>{passwordError}</span>
                    </div>
                )}

                {passwordSuccess && (
                    <div className="alert success">
                      <CheckCircle className="h-4 w-4" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <button type="submit" className="settings-button primary" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 loading-spinner" />
                      Updating Password...
                    </>
                  ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Update Password
                      </>
                  )}
                  </button>
              </form>

                <div className="pt-6 border-t mt-6">
                  <div className="switch-container">
                    <div>
                      <div className="switch-label">Two-Factor Authentication</div>
                      <div className="switch-description">Add an extra layer of security</div>
                  </div>
                  <Switch />
              </div>

                  <div className="switch-container">
                    <div>
                      <div className="switch-label">Login Alerts</div>
                      <div className="switch-description">Get notified of new login attempts</div>
                </div>
                <Switch defaultChecked />
              </div>
                </div>
              </div>
            </div>
        </TabsContent>

          <TabsContent value="payments" className="settings-tab-content">
            <div className="settings-card">
              <div className="settings-card-header">
                <h2 className="settings-card-title">
                  <DollarSign className="h-5 w-5" />
                Payment Information
                </h2>
                <p className="settings-card-description">Manage your payment methods and commission settings</p>
              </div>
              <div className="settings-card-content">
                <div className="form-grid">
                  <div className="form-field">
                    <Label htmlFor="mobile-money" className="form-label">
                      <Smartphone className="h-4 w-4 inline mr-2" />
                      Mobile Money Number
                    </Label>
                    <Input 
                      id="mobile-money" 
                      placeholder="Enter your mobile money number"
                      value={paymentSettings.mobileMoney}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, mobileMoney: e.target.value }))}
                      className="form-input" 
                    />
              </div>
                  <div className="form-field">
                    <Label htmlFor="bank-account" className="form-label">
                      <CreditCard className="h-4 w-4 inline mr-2" />
                      Bank Account Number
                    </Label>
                    <Input 
                      id="bank-account" 
                      placeholder="Enter your bank account number" 
                      value={paymentSettings.bankAccount}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, bankAccount: e.target.value }))}
                      className="form-input" 
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="bank-name" className="form-label">
                      <Building2 className="h-4 w-4 inline mr-2" />
                      Bank Name
                    </Label>
                    <Select value={paymentSettings.bankName} onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, bankName: value }))}>
                      <SelectTrigger className="form-input">
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                        <SelectItem value="Bank of Kigali">Bank of Kigali</SelectItem>
                        <SelectItem value="Equity Bank">Equity Bank</SelectItem>
                        <SelectItem value="GT Bank">GT Bank</SelectItem>
                        <SelectItem value="Cogebanque">Cogebanque</SelectItem>
                  </SelectContent>
                </Select>
                  </div>
              </div>

                {/* Save Button */}
                <div className="flex justify-end mt-6 pt-6 border-t">
                  <button 
                    onClick={handleUpdatePayments}
                    disabled={savingPayments}
                    className="settings-button primary"
                  >
                    {savingPayments ? (
                      <>
                        <Loader2 className="h-4 w-4 loading-spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Payment Settings
                      </>
                    )}
                  </button>
                  </div>

                <div className="commission-info">
                  <h4 className="font-semibold text-lg mb-3">Commission Settings</h4>
                  <div className="commission-item">
                    <span className="commission-label">Current Commission Rate</span>
                    <span className="commission-value">{userProfile?.commission || 0}%</span>
                  </div>
                  <div className="commission-item">
                    <span className="commission-label">Payment Frequency</span>
                    <span className="commission-value">Monthly</span>
                  </div>
                  <div className="commission-item">
                    <span className="commission-label">Next Payment Date</span>
                    <span className="commission-value">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                </div>
              </div>
              </div>
            </div>
        </TabsContent>

          <TabsContent value="preferences" className="settings-tab-content">
            <div className="settings-card">
              <div className="settings-card-header">
                <h2 className="settings-card-title">
                  <Settings className="h-5 w-5" />
                  App Preferences
                </h2>
                <p className="settings-card-description">Customize your app experience</p>
              </div>
              <div className="settings-card-content">
                <div className="form-grid">
                  <div className="form-field">
                    <Label htmlFor="language" className="form-label">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Language
                    </Label>
                    <Select 
                      value={preferenceSettings.language} 
                      onValueChange={(value) => setPreferenceSettings(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="rw">Kinyarwanda</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                  <div className="form-field">
                    <Label htmlFor="timezone" className="form-label">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Timezone
                    </Label>
                    <Select 
                      value={preferenceSettings.timezone} 
                      onValueChange={(value) => setPreferenceSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger className="form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="africa-kigali">Africa/Kigali (CAT)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
                  </div>
              </div>

                <div className="switch-container">
                  <div>
                    <div className="switch-label">Dark Mode</div>
                    <div className="switch-description">Toggle between light and dark themes</div>
                  </div>
              <ThemeSwitch />
                </div>

                <div className="switch-container">
                  <div>
                    <div className="switch-label">Auto-sync Data</div>
                    <div className="switch-description">Automatically sync your data</div>
                </div>
                  <Switch 
                    checked={preferenceSettings.autoSync}
                    onCheckedChange={(checked) => setPreferenceSettings(prev => ({ ...prev, autoSync: checked }))}
                  />
              </div>

                <div className="switch-container">
                  <div>
                    <div className="switch-label">Offline Mode</div>
                    <div className="switch-description">Enable offline functionality</div>
                </div>
                  <Switch 
                    checked={preferenceSettings.darkMode}
                    onCheckedChange={(checked) => setPreferenceSettings(prev => ({ ...prev, darkMode: checked }))}
                  />
              </div>

                {/* Save Button */}
                <div className="flex justify-end mt-6 pt-6 border-t">
                  <button 
                    onClick={handleUpdatePreferences}
                    disabled={savingPreferences}
                    className="settings-button primary"
                  >
                    {savingPreferences ? (
                      <>
                        <Loader2 className="h-4 w-4 loading-spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
