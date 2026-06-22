import { SOROMA_ROUTES } from "@/lib/soroma/constants"
import { SOROMA_PERMISSIONS as P } from "@/lib/soroma/permissions"
import { hasAnyPermission } from "@/lib/soroma/permissions"

export type SoromaNavItem = {
  label: string
  href: string
  icon: string
  /** User needs any one of these permissions (view or manage) */
  permissions?: string[]
  workspace: "platform" | "tenant"
  badge?: string
  children?: SoromaNavItem[]
}

export function getPlatformNavItems(): SoromaNavItem[] {
  return [
    {
      label: "Overview",
      href: SOROMA_ROUTES.platform.overview,
      icon: "LayoutDashboard",
      permissions: [P.PLATFORM_VIEW],
      workspace: "platform",
    },
    {
      label: "Tenants",
      href: SOROMA_ROUTES.platform.tenants,
      icon: "Building2",
      permissions: [P.TENANTS_VIEW, P.TENANTS_MANAGE],
      workspace: "platform",
    },
    {
      label: "Onboarding",
      href: SOROMA_ROUTES.platform.onboarding,
      icon: "UserPlus",
      permissions: [P.ONBOARDING_MANAGE],
      workspace: "platform",
    },
    {
      label: "Program Targets",
      href: SOROMA_ROUTES.platform.programTargets,
      icon: "Target",
      permissions: [P.PROGRAM_VIEW, P.PROGRAM_MANAGE],
      workspace: "platform",
    },
    {
      label: "M&E Dashboard",
      href: SOROMA_ROUTES.platform.me,
      icon: "BarChart3",
      permissions: [P.ME_VIEW],
      workspace: "platform",
    },
    {
      label: "Ecosystem Analytics",
      href: SOROMA_ROUTES.platform.ecosystemAnalytics,
      icon: "Globe",
      permissions: [P.PLATFORM_VIEW],
      workspace: "platform",
    },
    {
      label: "Compliance Oversight",
      href: SOROMA_ROUTES.platform.compliance,
      icon: "ShieldCheck",
      permissions: [P.COMPLIANCE_VIEW],
      workspace: "platform",
    },
    {
      label: "Alerts & Issues",
      href: SOROMA_ROUTES.platform.alerts,
      icon: "Bell",
      permissions: [P.ALERTS_VIEW, P.ALERTS_MANAGE],
      workspace: "platform",
    },
    {
      label: "Integrations Hub",
      href: SOROMA_ROUTES.platform.integrations,
      icon: "Plug",
      permissions: [P.INTEGRATIONS_MANAGE],
      workspace: "platform",
    },
    {
      label: "Integration Health",
      href: SOROMA_ROUTES.platform.integrationHealth,
      icon: "Activity",
      permissions: [P.INTEGRATION_HEALTH_VIEW],
      workspace: "platform",
    },
    {
      label: "Users & Roles",
      href: SOROMA_ROUTES.platform.usersRoles,
      icon: "UserCog",
      permissions: [P.USERS_ROLES_VIEW, P.USERS_ROLES_MANAGE],
      workspace: "platform",
    },
    {
      label: "Billing",
      href: SOROMA_ROUTES.platform.billing,
      icon: "CreditCard",
      permissions: [P.BILLING_VIEW, P.BILLING_MANAGE],
      workspace: "platform",
    },
    {
      label: "Reports",
      href: SOROMA_ROUTES.platform.reports,
      icon: "FileBarChart",
      permissions: [P.REPORTS_VIEW, P.REPORTS_MANAGE],
      workspace: "platform",
    },
    {
      label: "Audit Logs",
      href: SOROMA_ROUTES.platform.audit,
      icon: "ClipboardCheck",
      permissions: [P.AUDIT_VIEW],
      workspace: "platform",
    },
  ]
}

export function getTenantNavItems(tenantId: string): SoromaNavItem[] {
  const r = SOROMA_ROUTES.tenant(tenantId)
  return [
    {
      label: "Overview",
      href: r.overview,
      icon: "LayoutDashboard",
      permissions: [P.TENANT_VIEW],
      workspace: "tenant",
    },
    {
      label: "Suppliers",
      href: r.suppliers,
      icon: "Users",
      permissions: [P.SUPPLIERS_VIEW, P.SUPPLIERS_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Procurement",
      href: r.procurement,
      icon: "ShoppingCart",
      permissions: [P.PROCUREMENT_VIEW, P.PROCUREMENT_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Production",
      href: r.production,
      icon: "Factory",
      permissions: [P.PRODUCTION_VIEW, P.PRODUCTION_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Inventory",
      href: r.inventory,
      icon: "Warehouse",
      permissions: [P.INVENTORY_VIEW, P.INVENTORY_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Buyers & Orders",
      href: r.orders,
      icon: "Package",
      permissions: [P.ORDERS_VIEW, P.ORDERS_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Logistics",
      href: r.logistics,
      icon: "Truck",
      permissions: [P.LOGISTICS_VIEW, P.LOGISTICS_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Alerts",
      href: r.alerts,
      icon: "Bell",
      permissions: [P.ALERTS_VIEW, P.ALERTS_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Traceability",
      href: r.traceability,
      icon: "QrCode",
      permissions: [P.TRACEABILITY_VIEW, P.TRACEABILITY_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Compliance",
      href: r.compliance,
      icon: "ShieldCheck",
      permissions: [P.COMPLIANCE_VIEW, P.COMPLIANCE_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Integrations",
      href: r.integrations,
      icon: "Plug",
      permissions: [P.INTEGRATIONS_VIEW, P.INTEGRATIONS_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Finance",
      href: r.finance,
      icon: "Wallet",
      permissions: [P.FINANCE_VIEW, P.FINANCE_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Analytics",
      href: r.analyticsDrilldown,
      icon: "BarChart3",
      permissions: [P.TENANT_VIEW],
      workspace: "tenant",
    },
    {
      label: "Reports",
      href: r.reports,
      icon: "FileBarChart",
      permissions: [P.REPORTS_VIEW, P.REPORTS_MANAGE],
      workspace: "tenant",
    },
    {
      label: "Audit Logs",
      href: r.audit,
      icon: "ClipboardCheck",
      permissions: [P.AUDIT_VIEW],
      workspace: "tenant",
    },
    {
      label: "Settings",
      href: r.settings,
      icon: "Settings",
      permissions: [P.TENANT_MANAGE],
      workspace: "tenant",
    },
  ]
}

export function filterNavByPermissions(
  items: SoromaNavItem[],
  granted: string[]
): SoromaNavItem[] {
  return items.filter((item) => {
    if (!item.permissions?.length) return true
    return hasAnyPermission(granted, item.permissions)
  })
}
