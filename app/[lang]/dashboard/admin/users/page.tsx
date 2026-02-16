"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  XCircle,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  Loader2,
  CheckCircle,
  X,
  KeyRound,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { format } from "date-fns"

const PHONE_COUNTRIES: { code: string; flag: string }[] = [
  { code: "+250", flag: "🇷🇼" }, // Rwanda
  { code: "+256", flag: "🇺🇬" }, // Uganda
  { code: "+254", flag: "🇰🇪" }, // Kenya
  { code: "+255", flag: "🇹🇿" }, // Tanzania
  { code: "+257", flag: "🇧🇮" }, // Burundi
  { code: "+243", flag: "🇨🇩" }, // Democratic Republic of the Congo
  { code: "+211", flag: "🇸🇸" }, // South Sudan
  { code: "+252", flag: "🇸🇴" }, // Somalia
]

const EAC_COUNTRIES = [
  "Burundi",
  "Democratic Republic of the Congo",
  "Kenya",
  "Rwanda",
  "South Sudan",
  "Somalia",
  "Tanzania",
  "Uganda",
]

const EAC_CITIES: Record<string, string[]> = {
  Burundi: ["Bujumbura", "Gitega", "Ngozi", "Rumonge", "Muyinga", "Kayanza", "Bururi", "Rutana", "Makamba", "Cibitoke"],
  "Democratic Republic of the Congo": ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani", "Bukavu", "Goma", "Matadi", "Kolwezi", "Likasi"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale", "Garissa", "Kakamega"],
  Rwanda: ["Kigali", "Butare", "Gisenyi", "Gitarama", "Ruhengeri", "Byumba", "Cyangugu", "Kibuye", "Kibungo", "Nyagatare"],
  "South Sudan": ["Juba", "Malakal", "Wau", "Yambio", "Rumbek", "Bor", "Torit", "Aweil", "Bentiu", "Yei"],
  Somalia: ["Mogadishu", "Hargeisa", "Bosaso", "Kismayo", "Garoowe", "Merca", "Berbera", "Baidoa", "Beledweyne", "Galkayo"],
  Tanzania: ["Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya", "Morogoro", "Tanga", "Kahama", "Tabora", "Zanzibar City"],
  Uganda: ["Kampala", "Gulu", "Lira", "Mbarara", "Jinja", "Mbale", "Entebbe", "Fort Portal", "Kasese", "Masaka"],
}

const LANGUAGE_OPTIONS = [
  "English",
  "French",
  "Kinyarwanda",
  "Kiswahili",
  "Other",
]

function parsePhoneWithCountry(phone: string | null | undefined): { code: string; national: string } {
  const raw = (phone || "").trim().replace(/\s/g, "")
  if (!raw) return { code: "+250", national: "" }
  const digits = raw.replace(/\D/g, "")
  const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.code.length - a.code.length)
  for (const { code } of sorted) {
    const prefix = code.replace("+", "")
    if (raw.startsWith(code) || raw.startsWith(prefix) || digits.startsWith(prefix)) {
      const national = (raw.startsWith("+") || raw.startsWith(prefix) ? raw.slice(prefix.length) : digits.slice(prefix.length)).replace(/\D/g, "")
      return { code, national }
    }
  }
  return { code: "+250", national: digits }
}

interface User {
  id: string
  displayId?: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  nationalId?: string
  gender?: string
  dateOfBirth?: string
  alternatePhone?: string
  district?: string
  country?: string
  city?: string
  address?: string
  postalCode?: string
  languagePreference?: string
  organizationType?: string
  businessName?: string
  tin?: string
  businessSize?: string
  contactPerson?: string
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)

  const generatePassword = () => {
    const length = 14
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
    const lower = "abcdefghjkmnpqrstuvwxyz"
    const digits = "23456789"
    const symbols = "!@#$%&*"
    const all = upper + lower + digits + symbols
    const getRandom = (str: string) => str[Math.floor(Math.random() * str.length)]
    let pass = getRandom(upper) + getRandom(lower) + getRandom(digits) + getRandom(symbols)
    for (let i = pass.length; i < length; i++) pass += getRandom(all)
    pass = pass.split("").sort(() => Math.random() - 0.5).join("")
    setFormData((prev) => ({ ...prev, password: pass }))
    setShowPassword(true)
    toast.success("Password generated. Copy it to share with the user.")
  }

  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+250",
    role: "",
    password: "",
    isActive: true,
    nationalId: "",
    gender: "",
    dateOfBirth: "",
      alternatePhone: "",
      alternatePhoneCountryCode: "+250",
      district: "",
      country: "",
      city: "",
      address: "",
      postalCode: "",
      languagePreference: "",
      userType: "",
      businessName: "",
    tin: "",
    businessSize: "",
    contactPerson: "",
  })

  const parseFullName = (full: string) => {
    const parts = (full || "").trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return { firstName: "", middleName: "", lastName: "" }
    if (parts.length === 1) return { firstName: parts[0], middleName: "", lastName: "" }
    if (parts.length === 2) return { firstName: parts[0], middleName: "", lastName: parts[1] }
    return { firstName: parts[0], middleName: parts.slice(1, -1).join(" "), lastName: parts[parts.length - 1] }
  }

  const individualDisplayName = () =>
    [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ").trim()

  useEffect(() => {
    if (currentUser && (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN")) {
      fetchUsers()
    }
  }, [currentUser])

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false
    if (statusFilter !== "all" && (statusFilter === "active" ? !user.isActive : user.isActive)) return false
    return true
  })

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        const transformedUsers = result.users.map((u: any) => ({
          id: u.id,
          displayId: u.displayId,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.currentRole || u.role || "No Role",
          isActive: u.isActive !== false,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        }))
        setUsers(transformedUsers)
      } else {
        toast.error(result.message || "Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setShowPassword(false)
    setStep(1)
    setFormData({
      name: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      phoneCountryCode: "+250",
      role: "",
      password: "",
      isActive: true,
      nationalId: "",
      gender: "",
      dateOfBirth: "",
      alternatePhone: "",
      alternatePhoneCountryCode: "+250",
      district: "",
      country: "",
      city: "",
      address: "",
      postalCode: "",
      languagePreference: "",
      userType: "",
      businessName: "",
      tin: "",
      businessSize: "",
      contactPerson: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditUser = async (user: User) => {
    const parsed = parseFullName(user.name)
    const phoneParsed = parsePhoneWithCountry(user.phone)
    const altPhoneParsed = parsePhoneWithCountry(user.alternatePhone)
    setEditingUser(user)
    setStep(1)
    setFormData({
      name: user.name,
      firstName: parsed.firstName,
      middleName: parsed.middleName,
      lastName: parsed.lastName,
      email: user.email,
      phone: phoneParsed.national,
      phoneCountryCode: phoneParsed.code,
      role: user.role,
      password: "",
      isActive: user.isActive,
      nationalId: user.nationalId ?? "",
      gender: user.gender ?? "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
      alternatePhone: altPhoneParsed.national,
      alternatePhoneCountryCode: altPhoneParsed.code,
      district: user.district ?? "",
      country: user.country ?? "",
      city: user.city ?? "",
      address: user.address ?? "",
      postalCode: user.postalCode ?? "",
      languagePreference: user.languagePreference ?? "",
      userType: user.organizationType ?? "",
      businessName: user.businessName ?? "",
      tin: user.tin ?? "",
      businessSize: user.businessSize ?? "",
      contactPerson: user.contactPerson ?? "",
    })
    setIsDialogOpen(true)
    if (user.id) {
      try {
        const token = localStorage.getItem("Gemurai_token")
        const res = await fetch(`/api/v1/superadmin/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success && data.user) {
          const u = data.user
          const fullParsed = parseFullName(u.name ?? user.name)
          setEditingUser({ ...user, ...u })
          setFormData((prev) => ({
            ...prev,
            name: u.name ?? prev.name,
            firstName: fullParsed.firstName,
            middleName: fullParsed.middleName,
            lastName: fullParsed.lastName,
            nationalId: u.nationalId ?? prev.nationalId,
            gender: u.gender ?? prev.gender,
            dateOfBirth: u.dateOfBirth ? String(u.dateOfBirth).slice(0, 10) : prev.dateOfBirth,
            alternatePhone: parsePhoneWithCountry(u.alternatePhone).national,
            alternatePhoneCountryCode: parsePhoneWithCountry(u.alternatePhone).code,
            phone: parsePhoneWithCountry(u.phone).national,
            phoneCountryCode: parsePhoneWithCountry(u.phone).code,
            district: u.district ?? prev.district,
            country: u.country ?? prev.country,
            city: u.city ?? prev.city,
            address: u.address ?? prev.address,
            postalCode: u.postalCode ?? prev.postalCode,
            languagePreference: u.languagePreference ?? prev.languagePreference,
            userType: u.organizationType ?? prev.userType,
            businessName: u.businessName ?? prev.businessName,
            tin: u.tin ?? prev.tin,
            businessSize: u.businessSize ?? prev.businessSize,
            contactPerson: u.contactPerson ?? prev.contactPerson,
          }))
        }
      } catch (_) {
        // keep form as-is from list data
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/superadmin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        toast.success("User deleted successfully")
        fetchUsers()
      } else {
        toast.error(result.message || "Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const displayName = isOrganization ? (formData.contactPerson || "").trim() : individualDisplayName()
    if (!displayName || displayName.length < 2) {
      toast.error(isOrganization ? "Contact person name is required (min 2 characters)" : "First name and last name are required")
      return
    }
    if (!(formData.email || "").trim()) {
      toast.error("Email is required")
      return
    }
    // Role is optional; can be assigned later from user management
    if (!editingUser && !(formData.password || "").trim()) {
      toast.error("Password is required")
      return
    }
    if (isOrganization && !editingUser) {
      if ((formData.businessName || "").trim().length < 2) {
        toast.error("Organization name is required (min 2 characters)")
        return
      }
      if ((formData.tin || "").trim().length < 5) {
        toast.error("TIN is required (min 5 characters)")
        return
      }
      if (!["SMALL", "MEDIUM", "LARGE"].includes((formData.businessSize || "").toUpperCase())) {
        toast.error("Business size is required (SMALL, MEDIUM, or LARGE)")
        return
      }
    }
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      const url = editingUser
        ? `/api/v1/superadmin/users/${editingUser.id}`
        : "/api/v1/superadmin/users"
      const method = editingUser ? "PUT" : "POST"

      const fullPhone = formData.phone ? `${formData.phoneCountryCode}${formData.phone.replace(/\D/g, "")}` : ""
      const fullAlternatePhone = formData.alternatePhone ? `${formData.alternatePhoneCountryCode}${formData.alternatePhone.replace(/\D/g, "")}` : ""
      const payload: any = {
        name: isOrganization ? formData.contactPerson : individualDisplayName(),
        email: formData.email,
        phone: fullPhone || undefined,
        role: formData.role || undefined,
        isActive: formData.isActive,
        nationalId: formData.nationalId || undefined,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        alternatePhone: fullAlternatePhone || undefined,
        district: formData.district || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        address: formData.address || undefined,
        postalCode: formData.postalCode || undefined,
        languagePreference: formData.languagePreference || undefined,
        userType: formData.userType || undefined,
        businessName: formData.businessName || undefined,
        tin: formData.tin || undefined,
        businessSize: formData.businessSize || undefined,
        contactPerson: formData.contactPerson || undefined,
      }

      if (!editingUser && formData.password) {
        payload.password = formData.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success || response.ok) {
        toast.success(editingUser ? "User updated successfully" : "User created successfully")
        setIsDialogOpen(false)
        fetchUsers()
      } else {
        toast.error(result.message || "Failed to save user")
      }
    } catch (error) {
      console.error("Error saving user:", error)
      toast.error("Failed to save user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleUserStatus = async (user: User) => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/superadmin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...user,
          isActive: !user.isActive,
        }),
      })

      const result = await response.json()

      if (result.success || response.ok) {
        toast.success(`User ${user.isActive ? "deactivated" : "activated"} successfully`)
        fetchUsers()
      } else {
        toast.error(result.message || "Failed to update user status")
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Failed to update user status")
    }
  }

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-2 border-red-100">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
              <p className="text-gray-600">You need admin privileges to access this page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const availableRoles = [
    "ADMIN",
    "SUPER_ADMIN",
    "MCC_MANAGER",
    "FIELD_AGENT",
    "AGENT",
    "EXTENSION_AGENT",
    "DCC",
    "CONSUMER",
  ]

  const registrationTypes = [
    { value: "", label: "Individual" },
    { value: "COOPERATIVE", label: "Cooperative" },
    { value: "COMPANY", label: "Company" },
    { value: "NGO", label: "NGO" },
  ] as const

  const isOrganization = !!formData.userType && ["COOPERATIVE", "COMPANY", "NGO"].includes(formData.userType)

  const setRegistrationType = (value: string) => {
    const next = value === "_" ? "" : value
    setFormData((prev) => {
      const nextData = { ...prev, userType: next }
      if (!next) {
        nextData.businessName = ""
        nextData.tin = ""
        nextData.businessSize = ""
        nextData.contactPerson = ""
      } else {
        nextData.firstName = ""
        nextData.middleName = ""
        nextData.lastName = ""
        nextData.name = ""
      }
      return nextData
    })
  }

  const maxStep = editingUser ? 2 : 3
  const stepLabels = editingUser
    ? ["Basic info", "Details & status"]
    : ["Registration & identity", "Details", "Password & finish"]
  const goNext = () => setStep((s) => Math.min(s + 1, maxStep))
  const goBack = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage system users, roles, and permissions</p>
            </div>
            <Button
              onClick={handleCreateUser}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{users.length}</div>
              <p className="text-xs text-gray-500 mt-1">All registered users</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {users.filter((u) => u.isActive).length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Inactive Users</CardTitle>
                <X className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {users.filter((u) => !u.isActive).length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Deactivated accounts</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Admin Users</CardTitle>
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Administrators</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => { setRoleFilter("all"); setStatusFilter("all") }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users DataTable */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900">
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    accessorKey: "displayId",
                    header: "ID",
                    cell: ({ row }) => (
                      <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                        {row.original.displayId || "—"}
                      </span>
                    ),
                  },
                  { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
                  {
                    accessorKey: "phone",
                    header: "Phone",
                    cell: ({ row }) => (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {row.original.phone || "-"}
                      </div>
                    ),
                  },
                  {
                    accessorKey: "role",
                    header: "Role",
                    cell: ({ row }) => (
                      <Badge
                        variant="outline"
                        className={
                          row.original.role === "ADMIN" || row.original.role === "SUPER_ADMIN"
                            ? "border-purple-300 text-purple-700"
                            : "border-blue-300 text-blue-700"
                        }
                      >
                        {row.original.role}
                      </Badge>
                    ),
                  },
                  {
                    accessorKey: "isActive",
                    header: "Status",
                    cell: ({ row }) => (
                      <Badge
                        variant={row.original.isActive ? "default" : "secondary"}
                        className={
                          row.original.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {row.original.isActive ? "Active" : "Inactive"}
                      </Badge>
                    ),
                  },
                  {
                    id: "actions",
                    header: () => <span className="text-right w-full block">Actions</span>,
                    cell: ({ row }) => (
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => toggleUserStatus(row.original)} className="h-8 w-8 p-0">
                          {row.original.isActive ? <X className="h-4 w-4 text-orange-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(row.original)} className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(row.original.id)} className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={filteredUsers}
                searchKey="search"
                searchPlaceholder="Search users..."
                emptyMessage="No users found"
                emptyDescription="Try adjusting your search or filters"
                entityName="users"
                pageSize={10}
                defaultSorting={[{ id: "name", desc: false }]}
                onRowClick={(row) => handleEditUser(row)}
              />
            )}
          </CardContent>
        </Card>

        {/* Create/Edit User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="overflow-hidden border-0 bg-slate-50 p-0 shadow-xl max-w-2xl opacity-100 dark:bg-slate-950">
            <div className="border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {editingUser ? "Edit User" : "Create New User"}
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {editingUser
                      ? "Update user information and permissions"
                      : "Add a new user in a few steps"}
                  </DialogDescription>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              {/* Step progress */}
              <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-0">
                  {stepLabels.map((label, i) => (
                    <div key={i} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-all ${
                            step === i + 1
                              ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                              : step > i + 1
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                          }`}
                        >
                          {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className={`text-xs font-medium ${step === i + 1 ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}`}>
                          {label}
                        </span>
                      </div>
                      {i < stepLabels.length - 1 && (
                        <div className={`mx-1 h-0.5 flex-1 rounded-full transition-colors ${step > i + 1 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 overflow-y-auto px-6 py-5 max-h-[55vh]">
                {/* Step 1: Registration type + Identity (Create) or Basic info (Edit) */}
                {step === 1 && (
                  <>
                    {!editingUser && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Registration type</Label>
                        <SearchableSelect
                          value={formData.userType || "_"}
                          onValueChange={(v) => setRegistrationType(v === "_" ? "" : v)}
                          options={registrationTypes.map((t) => ({ value: t.value || "_", label: t.label }))}
                          placeholder="Select registration type"
                          searchPlaceholder="Search type..."
                          className="h-10 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    )}

                    {isOrganization ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactPerson" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Contact person <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contactPerson"
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            placeholder="Full name of contact person"
                            required
                            className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              First name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              placeholder="Given name"
                              className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="middleName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Middle name
                            </Label>
                            <Input
                              id="middleName"
                              value={formData.middleName}
                              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                              placeholder="Optional"
                              className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Last name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              placeholder="Family name"
                              className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                          />
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Phone Number
                        </Label>
                        <div className="flex h-10 w-full overflow-hidden rounded-md border border-slate-200 bg-white ring-offset-background focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-0 dark:border-slate-700 dark:bg-slate-800 dark:ring-slate-500">
                          <div className="w-[110px] shrink-0 [&_.relative]:h-full [&_button]:h-full [&_button]:rounded-none [&_button]:border-0 [&_button]:border-r [&_button]:border-slate-200 [&_button]:dark:border-slate-600">
                            <SearchableSelect
                              value={formData.phoneCountryCode}
                              onValueChange={(v) => setFormData({ ...formData, phoneCountryCode: v })}
                              options={PHONE_COUNTRIES.map((c) => ({ value: c.code, label: `${c.flag} ${c.code}` }))}
                              placeholder="Country"
                              searchPlaceholder="Search..."
                              className="h-full min-h-0 w-full rounded-none border-0 border-r border-slate-200 bg-transparent dark:border-slate-600 dark:bg-transparent"
                            />
                          </div>
                          <div className="h-full w-px bg-slate-200 dark:bg-slate-600" />
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="788 123 456"
                            className="h-full flex-1 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 dark:bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Role <span className="text-slate-400 font-normal">(optional — assign later)</span>
                        </Label>
                        <SearchableSelect
                          value={formData.role || "_"}
                          onValueChange={(value) => setFormData({ ...formData, role: value === "_" ? "" : value })}
                          options={[{ value: "_", label: "No role yet" }, ...availableRoles.map((r) => ({ value: r, label: r }))]}
                          placeholder="Assign later"
                          searchPlaceholder="Search role..."
                          className="h-10 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Personal & contact OR Organization details */}
                {step === 2 && !isOrganization && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/50">
                    <h4 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Personal & contact</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nationalId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          National ID
                        </Label>
                        <Input
                          id="nationalId"
                          value={formData.nationalId}
                          onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                          placeholder="National identification"
                          className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Gender
                        </Label>
                        <SearchableSelect
                          value={formData.gender || "_"}
                          onValueChange={(v) => setFormData({ ...formData, gender: v === "_" ? "" : v })}
                          options={[{ value: "_", label: "—" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }]}
                          placeholder="Select gender"
                          searchPlaceholder="Search..."
                          className="h-10 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Date of birth
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Country
                        </Label>
                        <SearchableSelect
                          value={formData.country || "_"}
                          onValueChange={(v) => {
                            const newCountry = v === "_" ? "" : v
                            setFormData((prev) => ({ ...prev, country: newCountry, city: "" }))
                          }}
                          options={[{ value: "_", label: "—" }, ...EAC_COUNTRIES.map((c) => ({ value: c, label: c }))]}
                          placeholder="Select country"
                          searchPlaceholder="Search country..."
                          className="h-10 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          City
                        </Label>
                        {formData.country && formData.country !== "_" ? (
                          (() => {
                            const countryCities = EAC_CITIES[formData.country] ?? []
                            const options = countryCities.map((c) => ({ value: c, label: c }))
                            if (formData.city && !countryCities.includes(formData.city)) {
                              options.unshift({ value: formData.city, label: formData.city })
                            }
                            return (
                              <SearchableSelect
                                value={formData.city}
                                onValueChange={(v) => setFormData({ ...formData, city: v })}
                                options={options}
                                placeholder="Select city"
                                searchPlaceholder="Search city..."
                                className="h-10 border-slate-200 dark:border-slate-700"
                              />
                            )
                          })()
                        ) : (
                          <Input
                            id="city"
                            disabled
                            placeholder="Select country first"
                            className="border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Alternate phone
                        </Label>
                        <div className="flex h-10 w-full overflow-hidden rounded-md border border-slate-200 bg-white ring-offset-background focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-0 dark:border-slate-700 dark:bg-slate-800 dark:ring-slate-500">
                          <div className="w-[110px] shrink-0 [&_.relative]:h-full [&_button]:h-full [&_button]:rounded-none [&_button]:border-0 [&_button]:border-r [&_button]:border-slate-200 [&_button]:dark:border-slate-600">
                            <SearchableSelect
                              value={formData.alternatePhoneCountryCode}
                              onValueChange={(v) => setFormData({ ...formData, alternatePhoneCountryCode: v })}
                              options={PHONE_COUNTRIES.map((c) => ({ value: c.code, label: `${c.flag} ${c.code}` }))}
                              placeholder="Country"
                              searchPlaceholder="Search..."
                              className="h-full min-h-0 w-full rounded-none border-0 border-r border-slate-200 bg-transparent dark:border-slate-600 dark:bg-transparent"
                            />
                          </div>
                          <div className="h-full w-px bg-slate-200 dark:bg-slate-600" />
                          <Input
                            id="alternatePhone"
                            value={formData.alternatePhone}
                            onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                            placeholder="788 123 456"
                            className="h-full flex-1 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 dark:bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="address" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Address
                        </Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Street address"
                          className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Postal code
                        </Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          placeholder="Postal / ZIP code"
                          className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="languagePreference" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Language preference
                        </Label>
                        <SearchableSelect
                          value={formData.languagePreference || "_"}
                          onValueChange={(v) => setFormData({ ...formData, languagePreference: v === "_" ? "" : v })}
                          options={[{ value: "_", label: "—" }, ...LANGUAGE_OPTIONS.map((l) => ({ value: l, label: l }))]}
                          placeholder="Select language"
                          searchPlaceholder="Search language..."
                          className="h-10 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    {editingUser && (
                      <div className="flex items-center space-x-2 border-t border-slate-200 pt-4 mt-4 dark:border-slate-700">
                        <input
                          type="checkbox"
                          id="isActiveEditIndividual"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600 dark:text-slate-100"
                        />
                        <Label htmlFor="isActiveEditIndividual" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Active User
                        </Label>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (isOrganization || editingUser) && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/50">
                    <h4 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isOrganization ? "Organization details" : "Organization (optional)"}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {!editingUser && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</Label>
                          <Input
                            value={registrationTypes.find((t) => t.value === formData.userType)?.label ?? formData.userType}
                            readOnly
                            className="border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          />
                        </div>
                      )}
                      {editingUser && (
                        <div className="space-y-2">
                          <Label htmlFor="userType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Type
                          </Label>
                          <SearchableSelect
                            value={formData.userType || "_"}
                            onValueChange={(v) => setFormData({ ...formData, userType: v === "_" ? "" : v })}
                            options={[{ value: "_", label: "—" }, { value: "COOPERATIVE", label: "Cooperative" }, { value: "COMPANY", label: "Company" }, { value: "NGO", label: "NGO" }]}
                            placeholder="Organization type"
                            searchPlaceholder="Search..."
                            className="h-10 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="businessName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Business name {isOrganization && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          placeholder="Organization name"
                          required={isOrganization}
                          className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tin" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          TIN {isOrganization && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          id="tin"
                          value={formData.tin}
                          onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                          placeholder="Tax ID (min 5 characters)"
                          required={isOrganization}
                          className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessSize" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Business size {isOrganization && <span className="text-red-500">*</span>}
                        </Label>
                        <SearchableSelect
                          value={formData.businessSize || "_"}
                          onValueChange={(v) => setFormData({ ...formData, businessSize: v === "_" ? "" : v })}
                          options={[{ value: "_", label: "—" }, { value: "SMALL", label: "Small" }, { value: "MEDIUM", label: "Medium" }, { value: "LARGE", label: "Large" }]}
                          placeholder="Size"
                          searchPlaceholder="Search..."
                          className="h-10 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      {editingUser && (
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="contactPerson" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Contact person
                          </Label>
                          <Input
                            id="contactPerson"
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            placeholder="Name of contact person"
                            className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                          />
                        </div>
                      )}
                    </div>
                    {(isOrganization || formData.address) && !editingUser && (
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="orgAddress" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Address
                        </Label>
                        <Input
                          id="orgAddress"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Organization address"
                          className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                    )}
                    {editingUser && (
                      <div className="flex items-center space-x-2 border-t border-slate-200 pt-4 mt-4 dark:border-slate-700">
                        <input
                          type="checkbox"
                          id="isActiveEdit"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600 dark:text-slate-100"
                        />
                        <Label htmlFor="isActiveEdit" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Active User
                        </Label>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Password & finish (Create only) */}
                {step === 3 && !editingUser && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Password
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          placeholder="Enter or generate a password"
                          className="flex-1 border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={generatePassword}
                          title="Generate secure password"
                          className="shrink-0"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowPassword((s) => !s)}
                          title={showPassword ? "Hide password" : "Show password"}
                          className="shrink-0"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600 dark:text-slate-100"
                      />
                      <Label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Active User
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                        className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <ChevronLeft className="mr-1.5 h-4 w-4" />
                        Back
                      </Button>
                    )}
                  </div>
                  {step < maxStep ? (
                    <Button
                      type="button"
                      onClick={goNext}
                      className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      Next
                      <ChevronRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : editingUser ? (
                        "Update User"
                      ) : (
                        "Create User"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
