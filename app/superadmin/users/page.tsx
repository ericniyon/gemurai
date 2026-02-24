"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserPlus,
  Loader2,
  Filter,
  Download,
  Milk,
  Building2,
  Smartphone,
  Mail,
  Calendar,
  Shield,
  Users as UsersIcon,
} from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import styles from "../styles/superadmin.module.scss"

const pageBackgroundClasses = "bg-gradient-to-br from-slate-50 via-white to-blue-50/40"
const cardBaseClasses =
  "relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 backdrop-blur-md shadow-xl shadow-blue-100/60"
const statCardClasses =
  "relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 backdrop-blur-md shadow-lg shadow-blue-100/40 transition hover:shadow-blue-100/70 p-3 sm:p-4 md:p-5"
const formatDate = (value?: string) => {
  if (!value) return "N/A"
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? "N/A" : parsed.toLocaleDateString()
}

interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: string
  createdAt: string
  isActive: boolean
  updatedAt?: string
}

interface Role {
  id: string
  name: string
  userCount: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [createUserType, setCreateUserType] = useState<"individual" | "cooperative" | "company" | "ngo">("individual")
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "Login@Gemurai2025",
    gender: "",
    dateOfBirth: "",
    nationalId: "",
    alternatePhone: "",
    district: "",
    address: "",
    businessName: "",
    contactPerson: "",
    tin: "",
    businessSize: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSwalOpen, setIsSwalOpen] = useState(false)
  const [editUser, setEditUser] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "CUSTOMER",
    isActive: true,
  })
  const [editValidationErrors, setEditValidationErrors] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  })
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    businessName: "",
    contactPerson: "",
    tin: "",
    businessSize: "",
  })
  
  const { toast } = useToast()
  const router = useRouter()

  // Handle dialog close and reset
  const handleDialogClose = (open: boolean) => {
    // If a SweetAlert2 modal is currently open, ignore external attempts to close the dialog
    if (isSwalOpen && !open) {
      return
    }
    setIsCreateDialogOpen(open)
    if (!open) {
      setCreateUserType("individual")
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "",
        password: "Login@Gemurai2025",
        gender: "",
        dateOfBirth: "",
        nationalId: "",
        alternatePhone: "",
        district: "",
        address: "",
        businessName: "",
        contactPerson: "",
        tin: "",
        businessSize: "",
      })
      setValidationErrors({
        name: "",
        email: "",
        phone: "",
        role: "",
        password: "",
        businessName: "",
        contactPerson: "",
        tin: "",
        businessSize: "",
      })
    }
  }

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return "Name is required"
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    if (name.trim().length > 100) return "Name must be less than 100 characters"
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return "Name can only contain letters, spaces, hyphens, and apostrophes"
    return ""
  }

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) return "Please enter a valid email address"
    if (email.trim().length > 255) return "Email must be less than 255 characters"
    return ""
  }

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return "Phone number is required" // Phone is now required
    const cleanPhone = phone.trim().replace(/[\s-()]/g, '')
    
    // Check if it's a valid phone number format
    if (!/^\+?[1-9]\d{9,14}$/.test(cleanPhone)) {
      return "Please enter a valid phone number (e.g., +250700000000)"
    }
    
    // Check length after cleaning
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return "Phone number must be between 10-15 digits"
    }
    
    return ""
  }

  const validatePassword = (password: string) => {
    if (!password.trim()) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters"
    if (password.length > 128) return "Password must be less than 128 characters"
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number"
    if (!/(?=.*[@$!%*?&])/.test(password)) return "Password must contain at least one special character (@$!%*?&)"
    return ""
  }

  const validateRole = (role: string) => {
    if (!role || !role.trim()) return "Role is required"
    // Check if role matches any role ID or name (case-insensitive)
    const normalized = role.trim().toUpperCase()
    const matchesId = roles.some(r => r.id === role || r.id.toUpperCase() === normalized)
    const matchesName = roles.some(r => {
      const roleName = (r.name || "").toUpperCase()
      return roleName === normalized || roleName.replace(/\s+/g, "_") === normalized
    })
    // Also check against known MCC roles
    const mccRoles = ['MCC_MANAGER', 'AGENT', 'COOP_ADMIN', 'FARMER', 'ACCOUNTANT', 'REGULATOR']
    const matchesMccRole = mccRoles.includes(normalized)
    
    if (!matchesId && !matchesName && !matchesMccRole) return "Please select a valid role"
    return ""
  }

  const isOrgType = ["cooperative", "company", "ngo"].includes(createUserType)

  const validateAllFields = () => {
    const errors = {
      name: isOrgType ? validateName(newUser.contactPerson) : validateName(newUser.name),
      email: validateEmail(newUser.email),
      phone: validatePhone(newUser.phone),
      role: validateRole(newUser.role),
      password: validatePassword(newUser.password),
      businessName: isOrgType ? (newUser.businessName?.trim().length >= 2 ? "" : "Organization name is required (min 2 characters)") : "",
      contactPerson: isOrgType ? validateName(newUser.contactPerson) : "",
      tin: isOrgType ? ((newUser.tin?.trim().length ?? 0) >= 5 ? "" : "TIN is required (min 5 characters)") : "",
      businessSize: isOrgType ? (["SMALL", "MEDIUM", "LARGE"].includes(newUser.businessSize) ? "" : "Select business size") : "",
    }
    
    setValidationErrors(errors)
    return !Object.values(errors).some(error => error !== "")
  }

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/v1/roles", {
        credentials: "include"
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch roles")
      }
      
      const data = await response.json()
      if (data.success) {
        setRoles(data.roles)
      } else {
        throw new Error(data.message || "Failed to fetch roles")
      }
    } catch (err) {
      console.error("Error fetching roles:", err)
      // If roles fail to load, we'll use an empty array
      setRoles([])
    }
  }

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch("/api/v1/superadmin/users", {
        credentials: "include"
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      } else {
        throw new Error(data.message || "Failed to fetch users")
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
    fetchUsers()
  }, [])

  // Populate edit form when opening Edit dialog
  useEffect(() => {
    if (isEditDialogOpen && selectedUser) {
      setEditUser({
        id: selectedUser.id,
        name: selectedUser.name || "",
        email: selectedUser.email,
        phone: selectedUser.phone || "",
        role: selectedUser.role || "CUSTOMER",
        isActive: !!selectedUser.isActive,
      })
      setEditValidationErrors({ name: "", email: "", phone: "", role: "" })
    }
  }, [isEditDialogOpen, selectedUser])

  const validateAllEditFields = () => {
    const errors = {
      name: validateName(editUser.name),
      email: validateEmail(editUser.email),
      phone: validatePhone(editUser.phone),
      role: validateRole(editUser.role),
    }
    setEditValidationErrors(errors)
    return !Object.values(errors).some((e) => e !== "")
  }

  const handleCloseEditDialog = (open: boolean) => {
    console.log('handleCloseEditDialog called with:', open)
    setIsEditDialogOpen(open)
    if (!open) {
      setSelectedUser(null)
      setEditUser({ id: "", name: "", email: "", phone: "", role: "CUSTOMER", isActive: true })
      setEditValidationErrors({ name: "", email: "", phone: "", role: "" })
    }
  }

  // Update user
  const handleUpdateUser = async () => {
    if (!validateAllEditFields()) {
      await Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix all validation errors before submitting',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        showCloseButton: true,
        allowOutsideClick: true,
        allowEscapeKey: true
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Get role name from role ID if needed
      let roleToSend = editUser.role
      const selectedRole = roles.find(r => r.id === editUser.role || r.id.toUpperCase() === editUser.role.toUpperCase())
      if (selectedRole) {
        // Use role ID if it's a database ID, otherwise use role name
        roleToSend = selectedRole.id.length > 20 ? selectedRole.id : (selectedRole.name || selectedRole.id).toUpperCase()
      } else {
        // If not found in roles list, use as-is (might be a direct role name)
        roleToSend = editUser.role.toUpperCase()
      }

      const response = await fetch(`/api/v1/superadmin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          phone: editUser.phone,
          role: roleToSend,
          isActive: editUser.isActive,
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update user")
      }

      // Show SweetAlert2 first, then close Edit User dialog after user closes SweetAlert2
      setIsSwalOpen(true)
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'User updated successfully',
        confirmButtonColor: '#059669',
        confirmButtonText: 'Great!',
        showCloseButton: true,
        allowOutsideClick: true,
        allowEscapeKey: true
      })
      setIsSwalOpen(false)

      // Close the Edit User dialog after SweetAlert2 is closed
      handleCloseEditDialog(false)
      fetchUsers()
    } catch (err) {
      // Show SweetAlert2 first, then keep Edit User dialog open for retry
      setIsSwalOpen(true)
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'Failed to update user',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        showCloseButton: true,
        allowOutsideClick: true,
        allowEscapeKey: true
      })
      setIsSwalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }


  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Match role by either role ID or role name (uppercase)
    let matchesRole = roleFilter === "all"
    if (!matchesRole) {
      const userRoleUpper = user.role?.toUpperCase() || ""
      const roleFilterUpper = roleFilter.toUpperCase()
      
      // Check if roleFilter matches user.role directly
      if (userRoleUpper === roleFilterUpper) {
        matchesRole = true
      } else {
        // Check if roleFilter is a role ID and matches a role name
        const role = roles.find(r => r.id === roleFilter || r.id.toUpperCase() === roleFilterUpper)
        if (role) {
          const roleNameUpper = (role.name || "").toUpperCase()
          matchesRole = userRoleUpper === roleNameUpper || userRoleUpper === role.id.toUpperCase()
        }
      }
    }
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.isActive) ||
                         (statusFilter === "inactive" && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.isActive).length
  const agentCount = users.filter((u) => (u.role || "").toUpperCase() === "AGENT").length
  const mccManagerCount = users.filter((u) => (u.role || "").toUpperCase() === "MCC_MANAGER").length
  const farmerCount = users.filter((u) => (u.role || "").toUpperCase() === "FARMER").length
  const accountantCount = users.filter((u) => (u.role || "").toUpperCase() === "ACCOUNTANT").length

  const statCards = [
    {
      title: "Total Users",
      value: totalUsers,
      subtext: "All roles combined",
      iconBg: "from-blue-500 to-indigo-500",
      icon: UserPlus,
    },
    {
      title: "Active Users",
      value: activeUsers,
      subtext: "Currently enabled",
      iconBg: "from-emerald-500 to-teal-500",
      icon: Shield,
    },
    {
      title: "Agents",
      value: agentCount,
      subtext: "Sales & support",
      iconBg: "from-orange-500 to-amber-500",
      icon: UsersIcon,
    },
    {
      title: "MCC Managers",
      value: mccManagerCount,
      subtext: "Collection center leads",
      iconBg: "from-sky-500 to-blue-500",
      icon: Milk,
    },
    {
      title: "Field Agents",
      value: fieldAgentCount,
      subtext: "On-the-ground staff",
      iconBg: "from-green-500 to-lime-500",
      icon: Smartphone,
    },
    {
      title: "Farmers",
      value: farmerCount,
      subtext: "Registered suppliers",
      iconBg: "from-amber-500 to-yellow-500",
      icon: Calendar,
    },
  ]

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter, statusFilter])

  const totalItems = filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Create user
  const handleCreateUser = async () => {
    // Validate all fields
    if (!validateAllFields()) {
      setIsSwalOpen(true)
      await Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix all validation errors before submitting',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        showCloseButton: true,
        allowOutsideClick: true,
        allowEscapeKey: true
      })
      setIsSwalOpen(false)
      return
    }

    setIsSubmitting(true)
    try {
      // Get role name from role ID if needed
      let roleToSend = newUser.role
      const selectedRole = roles.find(r => r.id === newUser.role || r.id.toUpperCase() === newUser.role.toUpperCase())
      if (selectedRole) {
        // Use role ID if it's a database ID, otherwise use role name
        roleToSend = selectedRole.id.length > 20 ? selectedRole.id : (selectedRole.name || selectedRole.id).toUpperCase()
      } else {
        // If not found in roles list, use as-is (might be a direct role name)
        roleToSend = newUser.role.toUpperCase()
      }

      const response = await fetch("/api/v1/superadmin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          userType: createUserType,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone || undefined,
          role: roleToSend,
          password: newUser.password,
          gender: newUser.gender || undefined,
          dateOfBirth: newUser.dateOfBirth || undefined,
          nationalId: newUser.nationalId || undefined,
          alternatePhone: newUser.alternatePhone || undefined,
          district: newUser.district || undefined,
          address: newUser.address || undefined,
          businessName: newUser.businessName || undefined,
          contactPerson: newUser.contactPerson || undefined,
          tin: newUser.tin || undefined,
          businessSize: newUser.businessSize || undefined,
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create user")
      }

      const data = await response.json()
      if (data.success) {
        // Show SweetAlert2 first, then close Create User dialog after user closes SweetAlert2
        setIsSwalOpen(true)
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'User created successfully',
          confirmButtonColor: '#059669',
          confirmButtonText: 'Great!',
          showCloseButton: true,
          allowOutsideClick: true,
          allowEscapeKey: true
        })
        setIsSwalOpen(false)
        
        // Close the Create User dialog after SweetAlert2 is closed
        setIsCreateDialogOpen(false)
        handleDialogClose(false)
        fetchUsers()
      } else {
        throw new Error(data.message || "Failed to create user")
      }
    } catch (err) {
      console.error("Error creating user:", err)
      
      // Show SweetAlert2 first, then close Create User dialog after user closes SweetAlert2
      setIsSwalOpen(true)
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : "Failed to create user",
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        showCloseButton: true,
        allowOutsideClick: true,
        allowEscapeKey: true
      })
      setIsSwalOpen(false)
      
      setIsCreateDialogOpen(false)
      handleDialogClose(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      showCloseButton: true,
      allowOutsideClick: true,
      allowEscapeKey: true
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(`/api/v1/superadmin/users/${userId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to delete user")
      }

      const data = await response.json()
      if (data.success) {
        setIsSwalOpen(true)
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User has been deleted successfully',
          confirmButtonColor: '#059669',
          confirmButtonText: 'OK',
          showCloseButton: true,
          allowOutsideClick: true,
          allowEscapeKey: true
        })
        setIsSwalOpen(false)
        fetchUsers()
      } else {
        throw new Error(data.message || "Failed to delete user")
      }
    } catch (err) {
      console.error("Error deleting user:", err)
      setIsSwalOpen(true)
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : "Failed to delete user",
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        showCloseButton: true,
        allowOutsideClick: true,
        allowEscapeKey: true
      })
      setIsSwalOpen(false)
    }
  }

  // Export users
  const handleExportUsers = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Created At", "Last Updated", "Status"],
      ...filteredUsers.map(user => [
        user.name || "",
        user.email,
        user.role,
        formatDate(user.createdAt),
        formatDate(user.updatedAt),
        user.isActive ? "Active" : "Inactive"
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className={`relative min-h-screen overflow-hidden ${pageBackgroundClasses}`}>
        <div className="pointer-events-none absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
        <div className="relative z-10 flex-1 p-2 sm:p-4 md:p-6 lg:p-8 max-w-[2000px] mx-auto">
          <div className={styles.mainContent}>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-gray-600">Loading users...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`relative min-h-screen overflow-hidden ${pageBackgroundClasses}`}>
        <div className="pointer-events-none absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
        <div className="relative z-10 flex-1 p-2 sm:p-4 md:p-6 lg:p-8 max-w-[2000px] mx-auto">
          <div className={styles.mainContent}>
            <Card className={`${cardBaseClasses} max-w-md mx-auto`}>
              <CardContent className="p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchUsers} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative min-h-screen overflow-hidden ${pageBackgroundClasses}`}>
      <div className="pointer-events-none absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
      <div className="relative z-10 flex-1 p-2 sm:p-4 md:p-6 lg:p-8 max-w-[2000px] mx-auto">
    <div className={styles.mainContent}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 break-words">
            Users Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Manage system users and their roles
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportUsers}
            className="flex items-center justify-center gap-2 h-12 sm:h-9 px-3 sm:px-4"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center justify-center gap-2 h-12 sm:h-9 px-3 sm:px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add User</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className={statCardClasses}>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.subtext}</p>
                </div>
                <div
                  className={`p-3 rounded-2xl bg-gradient-to-br ${card.iconBg} text-white shadow-lg shadow-blue-500/20`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card className={`${cardBaseClasses} mb-4 sm:mb-6`}>
        <CardContent className="p-3 sm:p-4 md:p-5">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 sm:h-10 rounded-xl border border-blue-100 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-12 sm:h-10">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles
                    .filter(
                      (role) =>
                        !["DCC", "CONSUMER", "ADMIN"].includes(role.name?.toUpperCase() || "")
                    )
                    .map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  <SelectItem value="UMUCUNDA">UMUCUNDA</SelectItem>
                  <SelectItem value="FARMER">FARMER</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-12 sm:h-10">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{totalItems === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{totalItems}</span> users
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Rows per page</label>
          <select
            value={pageSize}
            onChange={(e) => {
              const next = Number(e.target.value) || 10
              setPageSize(next)
              setCurrentPage(1)
            }}
            className="border rounded-md px-2 py-1 text-sm"
          >
            {[5,10,20,50].map(sz => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
              Previous
            </Button>
            <div className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
            </div>
            <Button variant="outline" size="sm" className="h-8" disabled={currentPage === totalPages || totalItems === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className={cardBaseClasses}>
        <CardHeader className="p-3 sm:p-4 md:p-5">
          <CardTitle className="text-base sm:text-lg md:text-xl">Users ({filteredUsers.length})</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table className={styles.dataTable}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[240px]">Email</TableHead>
                  <TableHead className="w-[150px]">Phone</TableHead>
                  <TableHead className="w-[130px]">Role</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                  <TableHead className="w-[120px]">Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <UserPlus className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "N/A"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {user.phone || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role.replace("_", " ").toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border shadow-xl backdrop-blur-none opacity-100">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {paginatedUsers.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-500">No users found</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 sm:p-4">
                {paginatedUsers.map((user) => (
                  <Card key={user.id} className={`${cardBaseClasses} p-4`}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {user.name || "N/A"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 mt-1">
                              <Smartphone className="h-3 w-3 text-gray-400" />
                              <p className="text-sm text-gray-600 truncate">{user.phone}</p>
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border shadow-xl backdrop-blur-none opacity-100">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="capitalize">
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role.replace("_", " ").toLowerCase()}
                        </Badge>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                            <span>Created: {formatDate(user.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                            <span>Updated: {formatDate(user.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog} modal={false}>
        <DialogContent
          className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white border shadow-xl backdrop-blur-none opacity-100"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="sr-only">Edit user name, email, phone, role and active status.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={editUser.name}
                onChange={(e) => {
                  setEditUser({ ...editUser, name: e.target.value })
                  setEditValidationErrors({ ...editValidationErrors, name: validateName(e.target.value) })
                }}
                placeholder="Enter full name"
                className={`h-12 sm:h-10 ${editValidationErrors.name ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {editValidationErrors.name && <p className="text-xs text-red-500">{editValidationErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={editUser.email}
                onChange={(e) => {
                  setEditUser({ ...editUser, email: e.target.value })
                  setEditValidationErrors({ ...editValidationErrors, email: validateEmail(e.target.value) })
                }}
                placeholder="Enter email address"
                className={`h-12 sm:h-10 ${editValidationErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {editValidationErrors.email && <p className="text-xs text-red-500">{editValidationErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number *</label>
              <Input
                type="tel"
                value={editUser.phone}
                onChange={(e) => {
                  setEditUser({ ...editUser, phone: e.target.value })
                  setEditValidationErrors({ ...editValidationErrors, phone: validatePhone(e.target.value) })
                }}
                placeholder="e.g. +250700000000"
                className={`h-12 sm:h-10 ${editValidationErrors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {editValidationErrors.phone && <p className="text-xs text-red-500">{editValidationErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role *</label>
              <Select
                value={editUser.role}
                onValueChange={(value) => {
                  setEditUser({ ...editUser, role: value })
                  setEditValidationErrors({ ...editValidationErrors, role: validateRole(value) })
                }}
              >
                <SelectTrigger className={`h-12 sm:h-10 ${editValidationErrors.role ? 'border-red-500 focus:border-red-500' : ''}`}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editValidationErrors.role && <p className="text-xs text-red-500">{editValidationErrors.role}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="edit-active"
                type="checkbox"
                checked={editUser.isActive}
                onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })}
              />
              <label htmlFor="edit-active" className="text-sm">Active</label>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => handleCloseEditDialog(false)}
              disabled={isSubmitting}
              className="h-12 sm:h-10 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={isSubmitting}
              className="h-12 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogClose} modal={!isSwalOpen}>
        <DialogContent
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[28px] border border-white/60 bg-white/95 shadow-[0_25px_70px_rgba(15,23,42,0.2)] backdrop-blur-xl px-0 py-0"
          onInteractOutside={(e) => {
            if (!isSwalOpen) e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            if (!isSwalOpen) e.preventDefault()
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-3 space-y-1">
            <DialogTitle className="text-xl font-semibold text-gray-900">Create New User</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Invite a user and assign role. Choose type: Individual, Cooperative, Company, or NGO.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 px-6 pb-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">User type</Label>
              <Select
                value={createUserType}
                onValueChange={(v: "individual" | "cooperative" | "company" | "ngo") => setCreateUserType(v)}
              >
                <SelectTrigger className="h-10 rounded-xl border border-blue-100 bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="cooperative">Cooperative</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isOrgType ? (
              <>
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Organization name *</Label>
                      <Input
                        value={newUser.businessName}
                        onChange={(e) => setNewUser({ ...newUser, businessName: e.target.value })}
                        placeholder="e.g. ABC Cooperative"
                        className={`h-10 rounded-xl ${validationErrors.businessName ? "border-red-500" : ""}`}
                      />
                      {validationErrors.businessName && <p className="text-xs text-red-500">{validationErrors.businessName}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Contact person full name *</Label>
                      <Input
                        value={newUser.contactPerson}
                        onChange={(e) => setNewUser({ ...newUser, contactPerson: e.target.value })}
                        placeholder="Full name"
                        className={`h-10 rounded-xl ${validationErrors.contactPerson ? "border-red-500" : ""}`}
                      />
                      {validationErrors.contactPerson && <p className="text-xs text-red-500">{validationErrors.contactPerson}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>TIN (Tax ID) *</Label>
                      <Input
                        value={newUser.tin}
                        onChange={(e) => setNewUser({ ...newUser, tin: e.target.value })}
                        placeholder="9 digits"
                        maxLength={9}
                        className={`h-10 rounded-xl ${validationErrors.tin ? "border-red-500" : ""}`}
                      />
                      {validationErrors.tin && <p className="text-xs text-red-500">{validationErrors.tin}</p>}
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Business size *</Label>
                      <Select
                        value={newUser.businessSize}
                        onValueChange={(v) => setNewUser({ ...newUser, businessSize: v })}
                      >
                        <SelectTrigger className={`h-10 rounded-xl ${validationErrors.businessSize ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SMALL">Small</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LARGE">Large</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.businessSize && <p className="text-xs text-red-500">{validationErrors.businessSize}</p>}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact person details (optional)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Gender</Label>
                      <Select value={newUser.gender || "_"} onValueChange={(v) => setNewUser({ ...newUser, gender: v === "_" ? "" : v })}>
                        <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Optional" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_">—</SelectItem>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Date of birth</Label>
                      <Input
                        type="date"
                        value={newUser.dateOfBirth}
                        onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>National ID</Label>
                      <Input
                        value={newUser.nationalId}
                        onChange={(e) => setNewUser({ ...newUser, nationalId: e.target.value })}
                        placeholder="Optional"
                        className="h-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Full name *</Label>
                      <Input
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Full name"
                        className={`h-10 rounded-xl ${validationErrors.name ? "border-red-500" : ""}`}
                      />
                      {validationErrors.name && <p className="text-xs text-red-500">{validationErrors.name}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Gender</Label>
                      <Select value={newUser.gender || "_"} onValueChange={(v) => setNewUser({ ...newUser, gender: v === "_" ? "" : v })}>
                        <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Optional" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_">—</SelectItem>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Date of birth</Label>
                      <Input
                        type="date"
                        value={newUser.dateOfBirth}
                        onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                        className="h-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Identification</p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label>National ID</Label>
                      <Input
                        value={newUser.nationalId}
                        onChange={(e) => setNewUser({ ...newUser, nationalId: e.target.value })}
                        placeholder="Optional"
                        className="h-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@example.com"
                    className={`h-10 rounded-xl ${validationErrors.email ? "border-red-500" : ""}`}
                  />
                  {validationErrors.email && <p className="text-xs text-red-500">{validationErrors.email}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Phone *</Label>
                  <Input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="+250700000000"
                    className={`h-10 rounded-xl ${validationErrors.phone ? "border-red-500" : ""}`}
                  />
                  {validationErrors.phone && <p className="text-xs text-red-500">{validationErrors.phone}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Alternate phone</Label>
                  <Input
                    type="tel"
                    value={newUser.alternatePhone}
                    onChange={(e) => setNewUser({ ...newUser, alternatePhone: e.target.value })}
                    placeholder="Optional"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label>District</Label>
                  <Input
                    value={newUser.district}
                    onChange={(e) => setNewUser({ ...newUser, district: e.target.value })}
                    placeholder="Optional"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Address</Label>
                  <Input
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    placeholder="Street, sector, etc. (optional)"
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account & access</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(v) => setNewUser({ ...newUser, role: v })}
                  >
                    <SelectTrigger className={`h-10 rounded-xl ${validationErrors.role ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.role && <p className="text-xs text-red-500">{validationErrors.role}</p>}
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Min 8 chars, upper, lower, number, special"
                    className={`h-10 rounded-xl ${validationErrors.password ? "border-red-500" : ""}`}
                  />
                  {validationErrors.password && <p className="text-xs text-red-500">{validationErrors.password}</p>}
                  <p className="text-xs text-gray-500">Uppercase, lowercase, number, and special character (@$!%*?&)</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 px-6 pb-6 border-t border-white/60 pt-4">
            <Button
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isSubmitting}
              className="h-10 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={isSubmitting}
              className="h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </div>
    </div>
  )
} 