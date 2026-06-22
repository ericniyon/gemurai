/**
 * SOROMA permission catalog — single source of truth for RBAC (Phase 2).
 * Keys align with UI/UX handoff module/action/widget scopes.
 */

export const SOROMA_PERMISSIONS = {
  // Workspace
  PLATFORM_VIEW: "soroma.platform.view",
  PLATFORM_MANAGE: "soroma.platform.manage",
  TENANT_VIEW: "soroma.tenant.view",
  TENANT_MANAGE: "soroma.tenant.manage",
  AUDIT_VIEW: "soroma.audit.view",
  AUDIT_MANAGE: "soroma.audit.manage",

  // Platform modules
  TENANTS_VIEW: "soroma.tenants.view",
  TENANTS_MANAGE: "soroma.tenants.manage",
  ONBOARDING_MANAGE: "soroma.onboarding.manage",
  PROGRAM_VIEW: "soroma.program.view",
  PROGRAM_MANAGE: "soroma.program.manage",
  ME_VIEW: "soroma.me.view",
  COMPLIANCE_VIEW: "soroma.compliance.view",
  ALERTS_VIEW: "soroma.alerts.view",
  ALERTS_MANAGE: "soroma.alerts.manage",
  INTEGRATIONS_MANAGE: "soroma.integrations.manage",
  INTEGRATION_HEALTH_VIEW: "soroma.integration_health.view",
  REPORTS_MANAGE: "soroma.reports.manage",
  USERS_ROLES_VIEW: "soroma.users_roles.view",
  USERS_ROLES_MANAGE: "soroma.users_roles.manage",
  BILLING_VIEW: "soroma.billing.view",
  BILLING_MANAGE: "soroma.billing.manage",

  // Tenant modules (view + manage)
  SUPPLIERS_VIEW: "soroma.suppliers.view",
  SUPPLIERS_MANAGE: "soroma.suppliers.manage",
  PROCUREMENT_VIEW: "soroma.procurement.view",
  PROCUREMENT_MANAGE: "soroma.procurement.manage",
  PRODUCTION_VIEW: "soroma.production.view",
  PRODUCTION_MANAGE: "soroma.production.manage",
  INVENTORY_VIEW: "soroma.inventory.view",
  INVENTORY_MANAGE: "soroma.inventory.manage",
  ORDERS_VIEW: "soroma.orders.view",
  ORDERS_MANAGE: "soroma.orders.manage",
  LOGISTICS_VIEW: "soroma.logistics.view",
  LOGISTICS_MANAGE: "soroma.logistics.manage",
  TRACEABILITY_VIEW: "soroma.traceability.view",
  TRACEABILITY_MANAGE: "soroma.traceability.manage",
  COMPLIANCE_MANAGE: "soroma.compliance.manage",
  INTEGRATIONS_VIEW: "soroma.integrations.view",
  FINANCE_VIEW: "soroma.finance.view",
  FINANCE_MANAGE: "soroma.finance.manage",
  FINANCE_EXPORT: "soroma.finance.export",
  REPORTS_VIEW: "soroma.reports.view",
  EXPORTS_MANAGE: "soroma.exports.manage",

  // Actions
  PO_APPROVE: "soroma.po.approve",
  USERS_MANAGE: "soroma.users.manage",
  INTEGRATIONS_RETRY: "soroma.integrations.retry",

  // Widgets
  WIDGET_EXECUTIVE: "soroma.dashboard.executive",
  WIDGET_COMPLIANCE: "soroma.dashboard.compliance",
  WIDGET_FINANCIALS: "soroma.analytics.financials",
} as const

export type SoromaPermissionKey =
  (typeof SOROMA_PERMISSIONS)[keyof typeof SOROMA_PERMISSIONS]

/** View permission implies read access; manage implies view for nav filtering */
export function permissionSatisfies(
  granted: string[],
  required: string
): boolean {
  if (granted.includes(required)) return true
  if (required.endsWith(".view")) {
    const manage = required.replace(/\.view$/, ".manage")
    if (granted.includes(manage)) return true
  }
  if (required.endsWith(".manage")) {
    const view = required.replace(/\.manage$/, ".view")
    if (granted.includes(view)) return true
  }
  return false
}

export function hasAnyPermission(
  granted: string[],
  required: string | string[]
): boolean {
  const list = Array.isArray(required) ? required : [required]
  return list.some((p) => permissionSatisfies(granted, p))
}

export function hasAllPermissions(
  granted: string[],
  required: string[]
): boolean {
  return required.every((p) => permissionSatisfies(granted, p))
}
