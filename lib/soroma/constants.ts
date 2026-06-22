/** SOROMA FOODS platform constants — UI/UX handoff v1.0 */

export const SOROMA_PRODUCT = "SOROMA_FOODS" as const

export const SOROMA_ROUTES = {
  login: "/soroma/login",
  platform: {
    overview: "/soroma/platform/overview",
    tenants: "/soroma/platform/tenants",
    onboarding: "/soroma/platform/onboarding",
    programTargets: "/soroma/platform/program-targets",
    me: "/soroma/platform/me",
    ecosystemAnalytics: "/soroma/platform/ecosystem-analytics",
    compliance: "/soroma/platform/compliance",
    alerts: "/soroma/platform/alerts",
    integrations: "/soroma/platform/integrations",
    integrationHealth: "/soroma/platform/integration-health",
    reports: "/soroma/platform/reports",
    audit: "/soroma/platform/audit",
    usersRoles: "/soroma/platform/users-roles",
    billing: "/soroma/platform/billing",
  },
  tenant: (tenantId: string) => ({
    overview: `/soroma/tenant/${tenantId}/overview`,
    suppliers: `/soroma/tenant/${tenantId}/suppliers`,
    procurement: `/soroma/tenant/${tenantId}/procurement`,
    production: `/soroma/tenant/${tenantId}/production`,
    inventory: `/soroma/tenant/${tenantId}/inventory`,
    orders: `/soroma/tenant/${tenantId}/orders`,
    logistics: `/soroma/tenant/${tenantId}/logistics`,
    alerts: `/soroma/tenant/${tenantId}/alerts`,
    traceability: `/soroma/tenant/${tenantId}/traceability`,
    compliance: `/soroma/tenant/${tenantId}/compliance`,
    integrations: `/soroma/tenant/${tenantId}/integrations`,
    finance: `/soroma/tenant/${tenantId}/finance`,
    analyticsDrilldown: `/soroma/tenant/${tenantId}/analytics/drilldown`,
    reports: `/soroma/tenant/${tenantId}/reports`,
    audit: `/soroma/tenant/${tenantId}/audit`,
    settings: `/soroma/tenant/${tenantId}/settings`,
  }),
} as const

export const PLATFORM_ROLES = [
  "PLATFORM_SUPER_ADMIN",
  "PLATFORM_OPERATOR",
  "PLATFORM_COMPLIANCE_OFFICER",
  "INTEGRATION_MANAGER",
  "ME_OFFICER",
  "SUPPORT_AGENT",
] as const

export const TENANT_ROLES = [
  "TENANT_ADMIN",
  "SUPPLIER_MANAGER",
  "PROCUREMENT_OFFICER",
  "PRODUCTION_LEAD",
  "WAREHOUSE_MANAGER",
  "SALES_ORDERS_OFFICER",
  "LOGISTICS_COORDINATOR",
  "FINANCE_MANAGER",
  "QA_COMPLIANCE_OFFICER",
  "REPORTS_VIEWER",
] as const

export type PlatformRole = (typeof PLATFORM_ROLES)[number]
export type TenantRole = (typeof TENANT_ROLES)[number]

export const SOROMA_CONNECTORS = [
  { code: "rwandamart", name: "RwandaMart", type: "MARKETPLACE" },
  { code: "ehaho", name: "eHaHo", type: "MARKETPLACE" },
  { code: "murukali", name: "Murukali", type: "MARKETPLACE" },
  { code: "vubavuba", name: "VubaVuba", type: "MARKETPLACE" },
  { code: "export_portal", name: "Export Portal", type: "EXPORT" },
  { code: "direct_b2b", name: "Direct B2B", type: "B2B" },
  { code: "logistics_api", name: "Logistics API", type: "LOGISTICS" },
  { code: "payment_gateway", name: "Payment Gateway", type: "PAYMENT" },
] as const

export const DEFAULT_CURRENCY = "RWF"
export const DEFAULT_TIMEZONE = "Africa/Kigali"
export const DEFAULT_COUNTRY = "RW"
