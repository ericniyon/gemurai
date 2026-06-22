import { unstable_cache } from "next/cache"
import {
  getPlatformAlertsDashboard,
  getPlatformOverviewCharts,
  getPlatformOverviewKpis,
  getPlatformRecentAlerts,
  getTenantAlertsDashboard,
  getTenantOverviewCharts,
  getTenantRecentAlerts,
} from "./dashboard-data"

export const getCachedPlatformOverviewKpis = unstable_cache(
  async () => getPlatformOverviewKpis(),
  ["soroma:platform:overview:kpis"],
  { revalidate: 120, tags: ["soroma-platform-overview"] }
)

export const getCachedPlatformOverviewCharts = unstable_cache(
  async () => getPlatformOverviewCharts(),
  ["soroma:platform:overview:charts"],
  { revalidate: 120, tags: ["soroma-platform-overview"] }
)

export const getCachedPlatformRecentAlerts = unstable_cache(
  async (limit = 5) => getPlatformRecentAlerts(limit),
  ["soroma:platform:recent-alerts"],
  { revalidate: 60, tags: ["soroma-alerts"] }
)

export const getCachedTenantOverviewCharts = unstable_cache(
  async (tenantId: string) => getTenantOverviewCharts(tenantId),
  ["soroma:tenant:overview:charts"],
  { revalidate: 120, tags: ["soroma-tenant-overview"] }
)

export const getCachedTenantRecentAlerts = unstable_cache(
  async (tenantId: string, limit = 5) => getTenantRecentAlerts(tenantId, limit),
  ["soroma:tenant:recent-alerts"],
  { revalidate: 60, tags: ["soroma-alerts"] }
)

export const getCachedPlatformAlertsDashboard = unstable_cache(
  async () => getPlatformAlertsDashboard(),
  ["soroma:platform:alerts:dashboard"],
  { revalidate: 45, tags: ["soroma-alerts"] }
)

export const getCachedTenantAlertsDashboard = unstable_cache(
  async (tenantId: string) => getTenantAlertsDashboard(tenantId),
  ["soroma:tenant:alerts:dashboard"],
  { revalidate: 45, tags: ["soroma-alerts"] }
)
