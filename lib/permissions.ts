import { sendEmail } from "@/lib/email-service.server"
import type { NextRequest } from "next/server"
import { UserRole } from "@/lib/auth"


export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  level: number
}

export const PERMISSIONS: Permission[] = [
  // Dashboard
  {
    id: "dashboard.view",
    name: "View Dashboard",
    description: "Access to view dashboard",
    category: "Dashboard",
  },
  {
    id: "dashboard.analytics",
    name: "View Analytics",
    description: "Access to analytics data",
    category: "Dashboard",
  },

  // Users
  {
    id: "users.view",
    name: "View Users",
    description: "View user information",
    category: "Users",
  },
  {
    id: "users.edit",
    name: "Edit Users",
    description: "Edit user information",
    category: "Users",
  },

  // Products
  {
    id: "products.view",
    name: "View Products",
    description: "View product listings",
    category: "Products",
  },
  {
    id: "products.create",
    name: "Create Products",
    description: "Create new products",
    category: "Products",
  },
  {
    id: "products.edit",
    name: "Edit Products",
    description: "Edit existing products",
    category: "Products",
  },
  {
    id: "products.delete",
    name: "Delete Products",
    description: "Delete products",
    category: "Products",
  },
  {
    id: "products.manage",
    name: "Manage Products",
    description: "Full product management",
    category: "Products",
  },
  {
    id: "products.purchase",
    name: "Purchase Products",
    description: "Ability to purchase products",
    category: "Products",
  },

  // Stock
  {
    id: "stock.create",
    name: "Create Stock",
    description: "Create stock entries",
    category: "Stock",
  },

  // Inventory
  {
    id: "inventory.manage",
    name: "Manage Inventory",
    description: "Full inventory management including warehouses, locations, and stock moves",
    category: "Inventory",
  },
  {
    id: "inventory.warehouse.create",
    name: "Create Warehouses",
    description: "Create new warehouses",
    category: "Inventory",
  },
  {
    id: "inventory.warehouse.edit",
    name: "Edit Warehouses",
    description: "Edit existing warehouses",
    category: "Inventory",
  },
  {
    id: "inventory.location.create",
    name: "Create Locations",
    description: "Create new locations within warehouses",
    category: "Inventory",
  },
  {
    id: "inventory.location.edit",
    name: "Edit Locations",
    description: "Edit existing locations",
    category: "Inventory",
  },
  {
    id: "inventory.move.create",
    name: "Create Stock Moves",
    description: "Create stock movement transactions",
    category: "Inventory",
  },
  {
    id: "inventory.move.confirm",
    name: "Confirm Stock Moves",
    description: "Confirm and process stock movements",
    category: "Inventory",
  },
  {
    id: "inventory.adjustment.create",
    name: "Create Adjustments",
    description: "Create inventory adjustments",
    category: "Inventory",
  },
  {
    id: "inventory.adjustment.approve",
    name: "Approve Adjustments",
    description: "Approve inventory adjustments",
    category: "Inventory",
  },
  {
    id: "inventory.cyclecount.create",
    name: "Create Cycle Counts",
    description: "Create cycle count operations",
    category: "Inventory",
  },

  // Orders
  {
    id: "orders.view",
    name: "View Orders",
    description: "View order information",
    category: "Orders",
  },
  {
    id: "orders.create",
    name: "Create Orders",
    description: "Create new orders",
    category: "Orders",
  },
  {
    id: "orders.manage",
    name: "Manage Orders",
    description: "Full order management",
    category: "Orders",
  },

  // Learning
  {
    id: "learning.view",
    name: "View Learning",
    description: "Access learning materials",
    category: "Learning",
  },
  {
    id: "learning.enroll",
    name: "Enroll in Courses",
    description: "Enroll in learning courses",
    category: "Learning",
  },
  {
    id: "learning.manage",
    name: "Manage Learning",
    description: "Manage learning content",
    category: "Learning",
  },

  // Jobs
  {
    id: "jobs.view",
    name: "View Jobs",
    description: "View job listings",
    category: "Jobs",
  },
  {
    id: "jobs.post",
    name: "Post Jobs",
    description: "Post new job listings",
    category: "Jobs",
  },
  {
    id: "jobs.manage",
    name: "Manage Jobs",
    description: "Full job management",
    category: "Jobs",
  },
  {
    id: "jobs.apply",
    name: "Apply to Jobs",
    description: "Apply to job listings",
    category: "Jobs",
  },

  // Finance
  {
    id: "finance.view",
    name: "View Finance",
    description: "View financial information",
    category: "Finance",
  },
  {
    id: "finance.request",
    name: "Request Finance",
    description: "Make financial requests",
    category: "Finance",
  },
  {
    id: "finance.manage",
    name: "Manage Finance",
    description: "Full finance management",
    category: "Finance",
  },

  // Applications
  {
    id: "applications.view",
    name: "View Applications",
    description: "View application information",
    category: "Applications",
  },
  {
    id: "applications.review",
    name: "Review Applications",
    description: "Review submitted applications",
    category: "Applications",
  },
  {
    id: "applications.manage",
    name: "Manage Applications",
    description: "Full application management",
    category: "Applications",
  },

  // Wallet Management
  {
    id: "wallet.view",
    name: "View Wallet",
    description: "View wallet information",
    category: "Wallet",
  },
  {
    id: "wallet.withdraw",
    name: "Withdraw Funds",
    description: "Withdraw funds from wallet",
    category: "Wallet",
  },
  {
    id: "wallet.manage",
    name: "Manage Wallet",
    description: "Full wallet management",
    category: "Wallet",
  },
]

export const ROLES: Role[] = [
  {
    id: "dcc",
    name: "Digital Community Champion",
    description: "Community champion with full product management capabilities",
    level: 40,
    permissions: [
      "dashboard.view",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.purchase",
      "products.manage",
      "stock.create",
      "orders.view",
      "orders.create",
      "learning.view",
      "learning.enroll",
      "jobs.view",
      "jobs.apply",
      "finance.view",
      "finance.request",
      "wallet.view",
      "wallet.withdraw",
      "wallet.manage",
      "sales.create",
      "sales.view"
    ],
  },
  {
    id: "employer",
    name: "Employer",
    description: "Employer access with job and application management",
    level: 50,
    permissions: [
      "dashboard.view",
      "jobs.view",
      "jobs.post",
      "jobs.manage",
      "applications.view",
      "applications.review",
      "applications.manage",
      "users.view",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.manage",
      "orders.view",
      "orders.manage",
      "learning.view",
      "learning.enroll",
      "wallet.view",
      "wallet.withdraw"
    ],
  },
  {
    id: "consumer",
    name: "Consumer",
    description: "Basic user with limited access",
    level: 10,
    permissions: ["products.view", "products.purchase", "orders.view", "orders.create"],
  },
]

export function hasPermission(userPermissions: string[], requiredPermission: string | Permission): boolean {
  const permissionId = typeof requiredPermission === 'string' ? requiredPermission : requiredPermission.id;
  return userPermissions.includes(permissionId);
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: (string | Permission)[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: (string | Permission)[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
}

export function getRoleByName(roleName: string): Role | undefined {
  return ROLES.find((role) => role.name === roleName);
}

export function getPermissionsByRole(roleId: string): Permission[] {
  const role = ROLES.find((r) => r.id === roleId);
  if (!role) return [];
  return PERMISSIONS.filter((permission) => role.permissions.includes(permission.id));
}

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM"
]

const envStatus: { [key: string]: string } = {}
for (const envVar of requiredEnvVars) {
  envStatus[envVar] = process.env[envVar] ? "✅ Set" : "❌ Missing"
}

export async function POST(request: NextRequest) {
  // Implementation of the POST function
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    // Dashboard
    "dashboard.view",
    "dashboard.analytics",
    
    // Users
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    
    // Products
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "products.manage",
    "products.purchase",
    
    // Orders
    "orders.view",
    "orders.create",
    "orders.manage",
    
    // Learning
    "learning.view",
    "learning.enroll",
    "learning.manage",
    
    // Jobs
    "jobs.view",
    "jobs.apply",
    "jobs.post",
    "jobs.manage",
    
    // Finance
    "finance.view",
    "finance.request",
    "finance.manage",
    
    // Applications
    "applications.view",
    "applications.review",
    "applications.manage",
    
    // Admin
    "admin.users",
    "admin.system",
    "admin.reports",
    "admin.forms",
    
    // Other
    "profile.view",
    "profile.edit",
    "files.upload",
    "wallet.view",
    "wallet.manage",
  ],
  ADMIN: [
    // Dashboard
    "dashboard.view",
    "dashboard.analytics",
    
    // Users
    "users.view",
    "users.create",
    "users.edit",
    
    // Products
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "products.manage",
    
    // Orders
    "orders.view",
    "orders.manage",
    
    // Learning
    "learning.view",
    "learning.manage",
    
    // Jobs
    "jobs.view",
    "jobs.manage",
    
    // Finance
    "finance.view",
    "finance.manage",
    
    // Applications
    "applications.view",
    "applications.review",
    "applications.manage",
    
    // MCC Management
    "mcc.view",
    "mcc.manage",
    "mcc.create",
    "mcc.edit",
    "mcc.farmers.view",
    "mcc.farmers.create",
    "mcc.farmers.edit",
    "mcc.farmers.manage",
    "mcc.collections.view",
    "mcc.collections.create",
    "mcc.collections.edit",
    "mcc.collections.approve",
    "mcc.collections.reject",
    "mcc.collections.manage",
    "mcc.payments.view",
    "mcc.payments.create",
    "mcc.payments.process",
    "mcc.payments.manage",
    "mcc.sales.view",
    "mcc.sales.create",
    "mcc.sales.manage",
    "mcc.staff.view",
    "mcc.staff.create",
    "mcc.staff.edit",
    "mcc.staff.manage",
    "mcc.inventory.view",
    "mcc.inventory.manage",
    "mcc.procurements.view",
    "mcc.procurements.create",
    "mcc.procurements.manage",
    "mcc.assets.view",
    "mcc.assets.manage",
    "mcc.rentals.view",
    "mcc.rentals.create",
    "mcc.rentals.manage",
    "mcc.reports.view",
    "mcc.reports.generate",
    "mcc.capacity.view",
    "mcc.capacity.assess",
    
    // Admin
    "admin.users",
    "admin.system",
    "admin.reports",
    "admin.forms",
    
    // Other
    "profile.view",
    "profile.edit",
    "files.upload",
    "wallet.view",
    "reports.view",
    "reports.generate",
  ],
  DCC: [
    // Dashboard
    "dashboard.view",
    
    // Products
    "products.view",
    "products.purchase",
    
    // Orders
    "orders.view",
    "orders.create",
    
    // Learning
    "learning.view",
    "learning.enroll",
    
    // Jobs
    "jobs.view",
    "jobs.apply",
    
    // Finance
    "finance.view",
    "finance.request",
    
    // Other
    "profile.view",
    "profile.edit",
    "dcc.dashboard",
    "dcc.services",
  ],
  EMPLOYER: [
    // Dashboard
    "dashboard.view",
    
    // Jobs
    "jobs.view",
    "jobs.post",
    "jobs.manage",
    
    // Applications
    "applications.view",
    "applications.review",
    
    // Users
    "users.view",
    
    // Other
    "profile.view",
    "profile.edit",
    "files.upload",
  ],
  CONSUMER: [
    // Products
    "products.view",
    "products.purchase",
    
    // Orders
    "orders.view",
    "orders.create",
    
    // Learning
    "learning.view",
    "learning.enroll",
    
    // Jobs
    "jobs.view",
    "jobs.apply",
    
    // Other
    "profile.view",
    "profile.edit",
  ],
} as const

// Permission type and permission check functions are defined above
