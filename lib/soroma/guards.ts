import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import type { SoromaSession } from "./auth"
import { assertTenantAccess } from "./auth"
import { sessionHasPermission } from "./rbac"
import { soromaError } from "./api-handler"

export async function requireTenantScope(
  session: SoromaSession,
  tenantId: string
): Promise<NextResponse | null> {
  const tenant = await prisma.soromaTenant.findUnique({
    where: { id: tenantId },
    select: { id: true, status: true },
  })
  if (!tenant) {
    return soromaError("Tenant not found", 404, undefined, "TENANT_NOT_FOUND")
  }

  const isPlatform =
    session.workspaceType === "platform" ||
    !!session.platformRole ||
    !!session.isTenantImpersonation
  const ok = await assertTenantAccess(session.userId, tenantId, isPlatform)
  if (!ok) {
    return soromaError("Forbidden: no access to this tenant", 403, undefined, "FORBIDDEN")
  }

  return null
}

export function requirePermission(
  session: SoromaSession,
  permission: string | string[],
  mode: "any" | "all" = "any"
): NextResponse | null {
  if (!sessionHasPermission(session.permissions, permission, mode)) {
    return soromaError(
      "Forbidden: insufficient permissions",
      403,
      { required: permission },
      "PERMISSION_DENIED"
    )
  }
  return null
}

/** Map API method to permission for tenant suppliers */
export const API_PERMISSIONS = {
  "alerts:GET": ["soroma.alerts.view", "soroma.alerts.manage"],
  "suppliers:GET": ["soroma.suppliers.view", "soroma.suppliers.manage"],
  "suppliers:POST": ["soroma.suppliers.manage"],
  "purchase-orders:GET": ["soroma.procurement.view", "soroma.procurement.manage"],
  "purchase-orders:POST": ["soroma.procurement.manage"],
  "passports:GET": ["soroma.traceability.view", "soroma.traceability.manage"],
  "passports:POST": ["soroma.traceability.manage"],
  "traceability:GET": ["soroma.traceability.view", "soroma.traceability.manage"],
  "traceability:POST": ["soroma.traceability.manage"],
  "compliance:GET": ["soroma.compliance.view", "soroma.compliance.manage"],
  "compliance:POST": ["soroma.compliance.manage"],
  "capa:TRANSITION": ["soroma.compliance.manage"],
  "integrations:GET": ["soroma.integrations.view", "soroma.integrations.manage"],
  "integrations:POST": ["soroma.integrations.manage"],
  "integrations:RETRY": ["soroma.integrations.retry", "soroma.integrations.manage"],
  "reports:GET": ["soroma.reports.view", "soroma.reports.manage"],
  "reports:POST": ["soroma.reports.manage", "soroma.exports.manage"],
  "audit:GET": ["soroma.audit.view", "soroma.audit.manage"],
  "alerts:PATCH": ["soroma.alerts.view", "soroma.alerts.manage"],
  "inventory:GET": ["soroma.inventory.view", "soroma.inventory.manage"],
  "inventory:POST": ["soroma.inventory.manage"],
  "orders:GET": ["soroma.orders.view", "soroma.orders.manage"],
  "orders:POST": ["soroma.orders.manage"],
  "finance:GET": ["soroma.finance.view", "soroma.finance.manage"],
  "finance:POST": ["soroma.finance.manage"],
  "production:GET": ["soroma.production.view", "soroma.production.manage"],
  "production:POST": ["soroma.production.manage"],
  "logistics:GET": ["soroma.logistics.view", "soroma.logistics.manage"],
  "logistics:POST": ["soroma.logistics.manage"],
} as const

export function checkApiPermission(
  session: SoromaSession,
  key: keyof typeof API_PERMISSIONS
): NextResponse | null {
  return requirePermission(session, [...API_PERMISSIONS[key]])
}
