import { Role } from "./permissions"

export const ROLES: Role[] = [
  {
    id: "SUPER_ADMIN",
    name: "Super Admin",
    description: "Full system access with highest level privileges - ONLY system user",
    permissions: ["*"], // All permissions
    level: 100,
  },
  {
    id: "ADMIN",
    name: "Admin",
    description: "Administrative access with limited permissions - NOT a system user",
    permissions: [
      "dashboard.view",
      "dashboard.analytics",
      "users.view",
      "applications.view",
      "applications.review",
      "applications.manage",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.manage",
      "orders.view",
      "orders.manage",
      "learning.view",
      "learning.manage",
      "jobs.view",
      "jobs.manage",
      "finance.view",
      "profile.view",
      "profile.edit",
      "files.upload",
      "wallet.view",
      // REMOVED: System-level permissions (users.create, users.edit, users.delete, admin.system, admin.users, admin.reports, admin.forms, inventory.*, finance.manage, wallet.manage)
    ],
    level: 60, // Reduced level to reflect non-system status
  },
  {
    id: "EMPLOYER",
    name: "Employer",
    description: "Business owner or employer",
    permissions: [
      "dashboard.view",
      "applications.view",
      "applications.create",
      "applications.evaluate",
      "applications.manage",
      "applications.review",
      "applications.delete",
      "applications.update",
      "applications.process",
      "applications.approve",
      "applications.reject",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.manage",
      "orders.view",
      "orders.create",
      "orders.manage",
      "learning.view",
      "learning.enroll",
      "jobs.view",
      "jobs.post",
      "jobs.manage",
      "finance.view",
      "finance.request",
      "stock.create",
      "stock.view",
      "stock.manage",
      "stock.edit",
      "stock.delete",
      "stock.orders.view",
      "stock.orders.create",
      "stock.orders.manage",
    ],
    level: 70,
  },
  {
    id: "BRANCH_MANAGER",
    name: "Branch Manager",
    description: "Branch manager with access to applications, vouchers, and inventory view",
    permissions: [
      "dashboard.view",
      "applications.view",
      "products.view",
      "stock.view",
      "wallet.view"
    ],
    level: 55,
  },
  {
    id: "EMPLOYEE",
    name: "Employee",
    description: "Company employee with inventory management capabilities",
    permissions: [
      "dashboard.view",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.manage",
      "stock.view",
      "stock.create",
      "stock.manage",
      "stock.edit",
      "stock.orders.view",
      "stock.orders.create",
      "stock.orders.manage",
      "profile.view",
      "profile.edit",
      "inventory.view",
      "inventory.warehouse.view",
      "inventory.location.view",
      "inventory.move.view",
      "inventory.move.create",
      "inventory.move.confirm",
      "inventory.adjustment.view",
      "inventory.adjustment.create",
      "inventory.cyclecount.view",
      "inventory.cyclecount.create",
    ],
    level: 50,
  },
  {
    id: "TEAM_LEADER",
    name: "Team Leader",
    description: "Team management and oversight capabilities",
    permissions: [
      "dashboard.view",
      "dashboard.analytics",
      "users.view",
      "applications.view",
      "applications.review",
      "applications.manage",
      "products.view",
      "products.manage",
      "orders.view",
      "orders.manage",
      "learning.view",
      "learning.manage",
      "jobs.view",
      "jobs.manage",
      "finance.view",
      "profile.view",
      "profile.edit",
      "team.manage",
      "team.view",
      "reports.view",
    ],
    level: 60,
  },
  {
    id: "DCC",
    name: "DCC",
    description: "Digital Commerce Company representative",
    permissions: [
      "dashboard.view",
      "applications.view",
      "applications.review",
      "applications.manage",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.manage",
      "learning.view",
      "learning.enroll",
      "learning.manage",
      "jobs.view",
      "jobs.post",
      "jobs.manage",
      "jobs.apply",
      "finance.view",
      "finance.request",
      "dcc.dashboard",
      "dcc.services",
      "stock.create",
      "sales.create",
      "sales.view",
    ],
    level: 40,
  },
  {
    id: "AGENT",
    name: "Agent",
    description: "Service agent with customer support capabilities",
    permissions: [
      "dashboard.view",
      "applications.view.own",
      "applications.create",
      "products.view",
      "orders.view",
      "learning.view",
      "learning.enroll",
      "jobs.view",
      "jobs.apply",
      "profile.view",
      "profile.edit",
      "customer.support",
      "customer.chat",
    ],
    level: 20,
  },
  {
    id: "CUSTOMER",
    name: "Customer",
    description: "Regular customer/consumer",
    permissions: [
      "dashboard.view",
      "products.view",
      "products.purchase",
      "orders.view",
      "orders.create",
      "learning.view",
      "learning.enroll",
      "jobs.view",
      "jobs.apply",
      "finance.view",
      "finance.request",
      "profile.view",
      "profile.edit",
    ],
    level: 10,
  },
  {
    id: "DIGITAL_SERVICE",
    name: "Digital Service",
    description: "Digital service provider for Irembo, Mobile Money, Canal packages, and other digital solutions",
    permissions: [
      "dashboard.view",
      "dashboard.analytics",
      "digital.services.view",
      "digital.services.create",
      "digital.services.edit",
      "digital.services.delete",
      "digital.services.manage",
      "irembo.services.view",
      "irembo.services.create",
      "irembo.services.edit",
      "irembo.services.delete",
      "irembo.services.manage",
      "mobile.money.view",
      "mobile.money.create",
      "mobile.money.edit",
      "mobile.money.delete",
      "mobile.money.manage",
      "mobile.money.transactions.view",
      "mobile.money.transactions.create",
      "mobile.money.transactions.edit",
      "canal.packages.view",
      "canal.packages.create",
      "canal.packages.edit",
      "canal.packages.delete",
      "canal.packages.manage",
      "canal.packages.subscriptions.view",
      "canal.packages.subscriptions.create",
      "canal.packages.subscriptions.edit",
      "digital.payments.view",
      "digital.payments.create",
      "digital.payments.edit",
      "digital.payments.delete",
      "digital.payments.manage",
      "digital.payments.transactions.view",
      "digital.payments.transactions.create",
      "digital.payments.transactions.edit",
      "digital.payments.refunds.view",
      "digital.payments.refunds.create",
      "digital.payments.refunds.edit",
      "customer.support",
      "customer.chat",
      "profile.view",
      "profile.edit",
      "reports.view",
      "reports.generate",
      "finance.view",
      "finance.request",
      "wallet.view",
      "wallet.manage",
      "wallet.transactions.view",
      "wallet.transactions.create",
      "wallet.transactions.edit",
    ],
    level: 45,
  },
]

// Define all available permissions
export const PERMISSIONS = {
  // Application permissions
  VIEW_APPLICATIONS: "applications.view",
  CREATE_APPLICATION: "applications.create",
  EVALUATE_APPLICATION: "applications.evaluate",
  MANAGE_APPLICATIONS: "applications.manage",
  REVIEW_APPLICATIONS: "applications.review",
  DELETE_APPLICATIONS: "applications.delete",
  UPDATE_APPLICATIONS: "applications.update",
  PROCESS_APPLICATIONS: "applications.process",
  APPROVE_APPLICATIONS: "applications.approve",
  REJECT_APPLICATIONS: "applications.reject",

  // User permissions (ONLY for SUPER_ADMIN)
  VIEW_USERS: "users.view",
  CREATE_USER: "users.create",
  EDIT_USER: "users.edit",
  DELETE_USER: "users.delete",
  MANAGE_USERS: "users.manage",

  // System permissions (ONLY for SUPER_ADMIN)
  MANAGE_SYSTEM: "system.manage",
  ADMIN_SYSTEM: "admin.system",
  ADMIN_USERS: "admin.users",
  ADMIN_REPORTS: "admin.reports",
  ADMIN_FORMS: "admin.forms",
  VIEW_REPORTS: "reports.view",
  GENERATE_REPORTS: "reports.generate",

  // Inventory permissions (ONLY for SUPER_ADMIN)
  INVENTORY_MANAGE: "inventory.manage",
  INVENTORY_WAREHOUSE_CREATE: "inventory.warehouse.create",
  INVENTORY_WAREHOUSE_EDIT: "inventory.warehouse.edit",
  INVENTORY_WAREHOUSE_DELETE: "inventory.warehouse.delete",
  INVENTORY_LOCATION_CREATE: "inventory.location.create",
  INVENTORY_LOCATION_EDIT: "inventory.location.edit",
  INVENTORY_MOVE_CREATE: "inventory.move.create",
  INVENTORY_MOVE_CONFIRM: "inventory.move.confirm",
  INVENTORY_ADJUSTMENT_CREATE: "inventory.adjustment.create",
  INVENTORY_ADJUSTMENT_APPROVE: "inventory.adjustment.approve",
  INVENTORY_CYCLECOUNT_CREATE: "inventory.cyclecount.create",

  // Stock permissions
  VIEW_STOCK: "stock.view",
  CREATE_STOCK: "stock.create",
  MANAGE_STOCK: "stock.manage",
  EDIT_STOCK: "stock.edit",
  DELETE_STOCK: "stock.delete",
  VIEW_STOCK_ORDERS: "stock.orders.view",
  CREATE_STOCK_ORDERS: "stock.orders.create",
  MANAGE_STOCK_ORDERS: "stock.orders.manage",

  // New permissions for AGENT role
  VIEW_OWN_APPLICATIONS: "applications.view.own",

  // Digital Service permissions
  DIGITAL_SERVICES_VIEW: "digital.services.view",
  DIGITAL_SERVICES_CREATE: "digital.services.create",
  DIGITAL_SERVICES_EDIT: "digital.services.edit",
  DIGITAL_SERVICES_DELETE: "digital.services.delete",
  DIGITAL_SERVICES_MANAGE: "digital.services.manage",

  // Irembo Service permissions
  IREMBO_SERVICES_VIEW: "irembo.services.view",
  IREMBO_SERVICES_CREATE: "irembo.services.create",
  IREMBO_SERVICES_EDIT: "irembo.services.edit",
  IREMBO_SERVICES_DELETE: "irembo.services.delete",
  IREMBO_SERVICES_MANAGE: "irembo.services.manage",

  // Mobile Money permissions
  MOBILE_MONEY_VIEW: "mobile.money.view",
  MOBILE_MONEY_CREATE: "mobile.money.create",
  MOBILE_MONEY_EDIT: "mobile.money.edit",
  MOBILE_MONEY_DELETE: "mobile.money.delete",
  MOBILE_MONEY_MANAGE: "mobile.money.manage",
  MOBILE_MONEY_TRANSACTIONS_VIEW: "mobile.money.transactions.view",
  MOBILE_MONEY_TRANSACTIONS_CREATE: "mobile.money.transactions.create",
  MOBILE_MONEY_TRANSACTIONS_EDIT: "mobile.money.transactions.edit",

  // Canal Packages permissions
  CANAL_PACKAGES_VIEW: "canal.packages.view",
  CANAL_PACKAGES_CREATE: "canal.packages.create",
  CANAL_PACKAGES_EDIT: "canal.packages.edit",
  CANAL_PACKAGES_DELETE: "canal.packages.delete",
  CANAL_PACKAGES_MANAGE: "canal.packages.manage",
  CANAL_PACKAGES_SUBSCRIPTIONS_VIEW: "canal.packages.subscriptions.view",
  CANAL_PACKAGES_SUBSCRIPTIONS_CREATE: "canal.packages.subscriptions.create",
  CANAL_PACKAGES_SUBSCRIPTIONS_EDIT: "canal.packages.subscriptions.edit",

  // Digital Payments permissions
  DIGITAL_PAYMENTS_VIEW: "digital.payments.view",
  DIGITAL_PAYMENTS_CREATE: "digital.payments.create",
  DIGITAL_PAYMENTS_EDIT: "digital.payments.edit",
  DIGITAL_PAYMENTS_DELETE: "digital.payments.delete",
  DIGITAL_PAYMENTS_MANAGE: "digital.payments.manage",
  DIGITAL_PAYMENTS_TRANSACTIONS_VIEW: "digital.payments.transactions.view",
  DIGITAL_PAYMENTS_TRANSACTIONS_CREATE: "digital.payments.transactions.create",
  DIGITAL_PAYMENTS_TRANSACTIONS_EDIT: "digital.payments.transactions.edit",
  DIGITAL_PAYMENTS_REFUNDS_VIEW: "digital.payments.refunds.view",
  DIGITAL_PAYMENTS_REFUNDS_CREATE: "digital.payments.refunds.create",
  DIGITAL_PAYMENTS_REFUNDS_EDIT: "digital.payments.refunds.edit",

  // Wallet permissions for Digital Service
  WALLET_VIEW: "wallet.view",
  WALLET_MANAGE: "wallet.manage",
  WALLET_TRANSACTIONS_VIEW: "wallet.transactions.view",
  WALLET_TRANSACTIONS_CREATE: "wallet.transactions.create",
  WALLET_TRANSACTIONS_EDIT: "wallet.transactions.edit",
} as const

// Define role-based permissions - ONLY SUPER_ADMIN gets system permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [
    // ALL PERMISSIONS for SUPER_ADMIN
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.CREATE_APPLICATION,
    PERMISSIONS.EVALUATE_APPLICATION,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.REVIEW_APPLICATIONS,
    PERMISSIONS.DELETE_APPLICATIONS,
    PERMISSIONS.UPDATE_APPLICATIONS,
    PERMISSIONS.PROCESS_APPLICATIONS,
    PERMISSIONS.APPROVE_APPLICATIONS,
    PERMISSIONS.REJECT_APPLICATIONS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SYSTEM,
    PERMISSIONS.ADMIN_SYSTEM,
    PERMISSIONS.ADMIN_USERS,
    PERMISSIONS.ADMIN_REPORTS,
    PERMISSIONS.ADMIN_FORMS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.INVENTORY_WAREHOUSE_CREATE,
    PERMISSIONS.INVENTORY_WAREHOUSE_EDIT,
    PERMISSIONS.INVENTORY_WAREHOUSE_DELETE,
    PERMISSIONS.INVENTORY_LOCATION_CREATE,
    PERMISSIONS.INVENTORY_LOCATION_EDIT,
    PERMISSIONS.INVENTORY_MOVE_CREATE,
    PERMISSIONS.INVENTORY_MOVE_CONFIRM,
    PERMISSIONS.INVENTORY_ADJUSTMENT_CREATE,
    PERMISSIONS.INVENTORY_ADJUSTMENT_APPROVE,
    PERMISSIONS.INVENTORY_CYCLECOUNT_CREATE,
    PERMISSIONS.VIEW_STOCK,
    PERMISSIONS.CREATE_STOCK,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.EDIT_STOCK,
    PERMISSIONS.DELETE_STOCK,
    PERMISSIONS.VIEW_STOCK_ORDERS,
    PERMISSIONS.CREATE_STOCK_ORDERS,
    PERMISSIONS.MANAGE_STOCK_ORDERS
  ],
  ADMIN: [
    // LIMITED permissions for ADMIN - NO system-level access
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.CREATE_APPLICATION,
    PERMISSIONS.EVALUATE_APPLICATION,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.REVIEW_APPLICATIONS,
    PERMISSIONS.DELETE_APPLICATIONS,
    PERMISSIONS.UPDATE_APPLICATIONS,
    PERMISSIONS.PROCESS_APPLICATIONS,
    PERMISSIONS.APPROVE_APPLICATIONS,
    PERMISSIONS.REJECT_APPLICATIONS,
    PERMISSIONS.VIEW_USERS, // Can view but not manage users
    PERMISSIONS.VIEW_REPORTS,
    // REMOVED: All system-level permissions
  ],
  DCC: [
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.CREATE_APPLICATION,
    PERMISSIONS.EVALUATE_APPLICATION,
    PERMISSIONS.REVIEW_APPLICATIONS,
    PERMISSIONS.VIEW_REPORTS
  ],
  EMPLOYER: [
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.CREATE_APPLICATION,
    PERMISSIONS.EVALUATE_APPLICATION,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.REVIEW_APPLICATIONS,
    PERMISSIONS.DELETE_APPLICATIONS,
    PERMISSIONS.UPDATE_APPLICATIONS,
    PERMISSIONS.PROCESS_APPLICATIONS,
    PERMISSIONS.APPROVE_APPLICATIONS,
    PERMISSIONS.REJECT_APPLICATIONS,
    PERMISSIONS.VIEW_REPORTS,
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "products.manage",
    PERMISSIONS.VIEW_STOCK,
    PERMISSIONS.CREATE_STOCK,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.EDIT_STOCK,
    PERMISSIONS.DELETE_STOCK,
    PERMISSIONS.VIEW_STOCK_ORDERS,
    PERMISSIONS.CREATE_STOCK_ORDERS,
    PERMISSIONS.MANAGE_STOCK_ORDERS
  ],
  EMPLOYEE: [
    PERMISSIONS.VIEW_STOCK,
    PERMISSIONS.CREATE_STOCK,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.EDIT_STOCK,
    PERMISSIONS.VIEW_STOCK_ORDERS,
    PERMISSIONS.CREATE_STOCK_ORDERS,
    PERMISSIONS.MANAGE_STOCK_ORDERS,
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "products.manage",
    "inventory.view",
    "inventory.warehouse.view",
    "inventory.location.view",
    "inventory.move.view",
    "inventory.move.create",
    "inventory.move.confirm",
    "inventory.adjustment.view",
    "inventory.adjustment.create",
    "inventory.cyclecount.view",
    "inventory.cyclecount.create"
  ],
  CONSUMER: [
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.CREATE_APPLICATION
  ],
  AGENT: [
    PERMISSIONS.VIEW_OWN_APPLICATIONS,
    PERMISSIONS.CREATE_APPLICATION,
    "dashboard.view",
    "applications.create",
    "applications.view.own",
    "profile.view",
    "profile.edit"
  ],
  DIGITAL_SERVICE: [
    // Digital Service permissions
    PERMISSIONS.DIGITAL_SERVICES_VIEW,
    PERMISSIONS.DIGITAL_SERVICES_CREATE,
    PERMISSIONS.DIGITAL_SERVICES_EDIT,
    PERMISSIONS.DIGITAL_SERVICES_DELETE,
    PERMISSIONS.DIGITAL_SERVICES_MANAGE,
    
    // Irembo Service permissions
    PERMISSIONS.IREMBO_SERVICES_VIEW,
    PERMISSIONS.IREMBO_SERVICES_CREATE,
    PERMISSIONS.IREMBO_SERVICES_EDIT,
    PERMISSIONS.IREMBO_SERVICES_DELETE,
    PERMISSIONS.IREMBO_SERVICES_MANAGE,
    
    // Mobile Money permissions
    PERMISSIONS.MOBILE_MONEY_VIEW,
    PERMISSIONS.MOBILE_MONEY_CREATE,
    PERMISSIONS.MOBILE_MONEY_EDIT,
    PERMISSIONS.MOBILE_MONEY_DELETE,
    PERMISSIONS.MOBILE_MONEY_MANAGE,
    PERMISSIONS.MOBILE_MONEY_TRANSACTIONS_VIEW,
    PERMISSIONS.MOBILE_MONEY_TRANSACTIONS_CREATE,
    PERMISSIONS.MOBILE_MONEY_TRANSACTIONS_EDIT,
    
    // Canal Packages permissions
    PERMISSIONS.CANAL_PACKAGES_VIEW,
    PERMISSIONS.CANAL_PACKAGES_CREATE,
    PERMISSIONS.CANAL_PACKAGES_EDIT,
    PERMISSIONS.CANAL_PACKAGES_DELETE,
    PERMISSIONS.CANAL_PACKAGES_MANAGE,
    PERMISSIONS.CANAL_PACKAGES_SUBSCRIPTIONS_VIEW,
    PERMISSIONS.CANAL_PACKAGES_SUBSCRIPTIONS_CREATE,
    PERMISSIONS.CANAL_PACKAGES_SUBSCRIPTIONS_EDIT,
    
    // Digital Payments permissions
    PERMISSIONS.DIGITAL_PAYMENTS_VIEW,
    PERMISSIONS.DIGITAL_PAYMENTS_CREATE,
    PERMISSIONS.DIGITAL_PAYMENTS_EDIT,
    PERMISSIONS.DIGITAL_PAYMENTS_DELETE,
    PERMISSIONS.DIGITAL_PAYMENTS_MANAGE,
    PERMISSIONS.DIGITAL_PAYMENTS_TRANSACTIONS_VIEW,
    PERMISSIONS.DIGITAL_PAYMENTS_TRANSACTIONS_CREATE,
    PERMISSIONS.DIGITAL_PAYMENTS_TRANSACTIONS_EDIT,
    PERMISSIONS.DIGITAL_PAYMENTS_REFUNDS_VIEW,
    PERMISSIONS.DIGITAL_PAYMENTS_REFUNDS_CREATE,
    PERMISSIONS.DIGITAL_PAYMENTS_REFUNDS_EDIT,
    
    // Wallet permissions
    PERMISSIONS.WALLET_VIEW,
    PERMISSIONS.WALLET_MANAGE,
    PERMISSIONS.WALLET_TRANSACTIONS_VIEW,
    PERMISSIONS.WALLET_TRANSACTIONS_CREATE,
    PERMISSIONS.WALLET_TRANSACTIONS_EDIT,
    
    // Other permissions
    "dashboard.view",
    "dashboard.analytics",
    "customer.support",
    "customer.chat",
    "profile.view",
    "profile.edit",
    "reports.view",
    "reports.generate",
    "finance.view",
    "finance.request"
  ]
}

export function getRolePermissions(role: string): string[] {
  const foundRole = ROLES.find(r => r.id === role)
  return foundRole?.permissions || []
}

export function hasPermission(userRole: string, permission: string): boolean {
  const rolePermissions = getRolePermissions(userRole)
  return rolePermissions.includes("*") || rolePermissions.includes(permission)
}

export function hasRequiredPermissions(userRole: string, requiredPermissions: string[]): boolean {
  const rolePermissions = getRolePermissions(userRole)
  if (rolePermissions.includes("*")) return true // Super admin has all permissions
  return requiredPermissions.every(permission => rolePermissions.includes(permission))
}

// Helper function to check if user is system user (only SUPER_ADMIN)
export function isSystemUser(userRole: string): boolean {
  return userRole === "SUPER_ADMIN"
}

// Helper function to check if user can manage system
export function canManageSystem(userRole: string): boolean {
  return userRole === "SUPER_ADMIN"
}

// Helper function to check if user can manage users
export function canManageUsers(userRole: string): boolean {
  return userRole === "SUPER_ADMIN"
}

// Helper function to check if user can manage inventory
export function canManageInventory(userRole: string): boolean {
  return userRole === "SUPER_ADMIN"
}

export function isValidRole(role: string): boolean {
  return ROLES.some(r => r.id === role.toUpperCase())
}

export function getRoleLevel(role: string): number {
  const foundRole = ROLES.find(r => r.id === role.toUpperCase())
  return foundRole ? foundRole.level : 0
}

export function canAccessResource(userRole: string, targetRole: string): boolean {
  const userLevel = getRoleLevel(userRole)
  const targetLevel = getRoleLevel(targetRole)
  return userLevel >= targetLevel
}

export function isRoleHigherOrEqual(role1: string, role2: string): boolean {
  const level1 = getRoleLevel(role1)
  const level2 = getRoleLevel(role2)
  return level1 >= level2
}

export function getRolesBelow(role: string): Role[] {
  const roleLevel = getRoleLevel(role)
  return ROLES.filter(r => r.level < roleLevel)
}

export function getRoleById(roleId: string): Role | undefined {
  return ROLES.find(r => r.id === roleId.toUpperCase())
} 