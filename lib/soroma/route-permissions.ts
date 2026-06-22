import { SOROMA_PERMISSIONS as P } from "./permissions"

export type RoutePermissionRule = {
  /** Path prefix match (longest wins) */
  prefix: string
  workspace: "platform" | "tenant"
  /** Any one of these permissions grants access */
  permissions: string[]
}

const PLATFORM_RULES: RoutePermissionRule[] = [
  { prefix: "/soroma/platform/overview", workspace: "platform", permissions: [P.PLATFORM_VIEW] },
  { prefix: "/soroma/platform/tenants", workspace: "platform", permissions: [P.TENANTS_VIEW, P.TENANTS_MANAGE] },
  { prefix: "/soroma/platform/onboarding", workspace: "platform", permissions: [P.ONBOARDING_MANAGE] },
  { prefix: "/soroma/platform/program-targets", workspace: "platform", permissions: [P.PROGRAM_VIEW, P.PROGRAM_MANAGE] },
  { prefix: "/soroma/platform/me", workspace: "platform", permissions: [P.ME_VIEW] },
  { prefix: "/soroma/platform/ecosystem-analytics", workspace: "platform", permissions: [P.PLATFORM_VIEW] },
  { prefix: "/soroma/platform/analytics/drilldown", workspace: "platform", permissions: [P.PLATFORM_VIEW] },
  { prefix: "/soroma/platform/compliance", workspace: "platform", permissions: [P.COMPLIANCE_VIEW] },
  { prefix: "/soroma/platform/alerts", workspace: "platform", permissions: [P.ALERTS_VIEW, P.ALERTS_MANAGE] },
  { prefix: "/soroma/platform/integrations", workspace: "platform", permissions: [P.INTEGRATIONS_MANAGE] },
  { prefix: "/soroma/platform/integration-health", workspace: "platform", permissions: [P.INTEGRATION_HEALTH_VIEW] },
  { prefix: "/soroma/platform/users-roles", workspace: "platform", permissions: [P.USERS_ROLES_VIEW, P.USERS_ROLES_MANAGE] },
  { prefix: "/soroma/platform/billing", workspace: "platform", permissions: [P.BILLING_VIEW, P.BILLING_MANAGE] },
  { prefix: "/soroma/platform/reports", workspace: "platform", permissions: [P.REPORTS_VIEW, P.REPORTS_MANAGE] },
  { prefix: "/soroma/platform/audit", workspace: "platform", permissions: [P.AUDIT_VIEW] },
]

const TENANT_RULES: RoutePermissionRule[] = [
  { prefix: "/soroma/tenant", workspace: "tenant", permissions: [P.TENANT_VIEW] },
  { prefix: "/overview", workspace: "tenant", permissions: [P.TENANT_VIEW] },
  { prefix: "/suppliers", workspace: "tenant", permissions: [P.SUPPLIERS_VIEW, P.SUPPLIERS_MANAGE] },
  { prefix: "/procurement", workspace: "tenant", permissions: [P.PROCUREMENT_VIEW, P.PROCUREMENT_MANAGE] },
  { prefix: "/production", workspace: "tenant", permissions: [P.PRODUCTION_VIEW, P.PRODUCTION_MANAGE] },
  { prefix: "/inventory", workspace: "tenant", permissions: [P.INVENTORY_VIEW, P.INVENTORY_MANAGE] },
  { prefix: "/orders", workspace: "tenant", permissions: [P.ORDERS_VIEW, P.ORDERS_MANAGE] },
  { prefix: "/logistics", workspace: "tenant", permissions: [P.LOGISTICS_VIEW, P.LOGISTICS_MANAGE] },
  { prefix: "/alerts", workspace: "tenant", permissions: [P.ALERTS_VIEW, P.ALERTS_MANAGE] },
  { prefix: "/traceability", workspace: "tenant", permissions: [P.TRACEABILITY_VIEW, P.TRACEABILITY_MANAGE] },
  { prefix: "/compliance", workspace: "tenant", permissions: [P.COMPLIANCE_VIEW, P.COMPLIANCE_MANAGE] },
  { prefix: "/integrations", workspace: "tenant", permissions: [P.INTEGRATIONS_VIEW, P.INTEGRATIONS_MANAGE] },
  { prefix: "/finance", workspace: "tenant", permissions: [P.FINANCE_VIEW, P.FINANCE_MANAGE] },
  { prefix: "/reports", workspace: "tenant", permissions: [P.REPORTS_VIEW, P.REPORTS_MANAGE] },
  { prefix: "/audit", workspace: "tenant", permissions: [P.AUDIT_VIEW] },
  { prefix: "/settings", workspace: "tenant", permissions: [P.TENANT_MANAGE] },
]

/** Resolve required permissions for a pathname */
export function getRoutePermissionRule(pathname: string): RoutePermissionRule | null {
  if (pathname.startsWith("/soroma/platform")) {
    const sorted = [...PLATFORM_RULES].sort((a, b) => b.prefix.length - a.prefix.length)
    return sorted.find((r) => pathname.startsWith(r.prefix)) ?? null
  }

  const tenantMatch = pathname.match(/^\/soroma\/tenant\/[^/]+(\/.*)?$/)
  if (tenantMatch) {
    const suffix = tenantMatch[1] ?? "/overview"
    const sorted = [...TENANT_RULES].sort((a, b) => b.prefix.length - a.prefix.length)
    return sorted.find((r) => suffix.startsWith(r.prefix)) ?? TENANT_RULES[0]
  }

  return null
}
