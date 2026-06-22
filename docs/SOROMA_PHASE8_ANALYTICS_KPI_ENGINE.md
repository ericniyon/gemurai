# SOROMA Phase 8 — Analytics & KPI Engine

Phase 8 introduces a centralized analytics layer for KPI computation, scoped trend filtering, and KPI drilldown exploration across tenant and platform workspaces.

## Delivered capabilities

1. **Centralized KPI engine**
   - Added `lib/soroma/kpi-engine.ts` as the single source for analytics KPI logic.
   - Supports normalized date scopes: `7d`, `30d`, `90d`, `ytd`.
   - Tenant KPI coverage:
     - Gross Margin
     - Yield Efficiency
     - Stock Accuracy
     - Supplier Reliability
     - Traceability Coverage
     - On-time Delivery
     - Digital PO Adoption
     - Compliance Score
   - Platform KPI coverage:
     - Ecosystem Trade Value
     - Value-chain analytics (avg trade/order)
     - Onboarding Metrics
     - M&E Analytics
     - Active Tenants

2. **KPI drilldown engine**
   - Added typed drilldown resolvers for tenant and platform KPI keys:
     - `getTenantKpiDrilldown(...)`
     - `getPlatformKpiDrilldown(...)`
   - Returns column metadata plus records to support tabular drilldown UIs.

3. **Analytics APIs**
   - Tenant APIs:
     - `GET /api/v1/soroma/tenant/[tenantId]/analytics/kpis?scope=...`
     - `GET /api/v1/soroma/tenant/[tenantId]/analytics/drilldown?kpi=...&scope=...`
   - Platform APIs:
     - `GET /api/v1/soroma/platform/analytics/kpis?scope=...`
     - `GET /api/v1/soroma/platform/analytics/drilldown?kpi=...&scope=...`
   - All endpoints enforce existing SOROMA auth and workspace/permission constraints.

4. **UI integration**
   - Tenant Overview now reads KPI data from centralized engine and supports URL-driven scope (`?scope=...`).
   - Platform Ecosystem Analytics and M&E pages now read KPI data from centralized engine with scope controls.
   - KPI cards now deep-link to dedicated drilldown pages.
   - Added new drilldown pages:
     - `app/soroma/tenant/[tenantId]/analytics/drilldown/page.tsx`
     - `app/soroma/platform/analytics/drilldown/page.tsx`

5. **Route authorization hardening**
   - Added explicit route permission rule for platform analytics drilldown in `lib/soroma/route-permissions.ts`.

## Outcome

Phase 8 delivers a reusable analytics foundation with:
- One KPI computation surface for tenant and platform analytics.
- Consistent time-scope filtering.
- Drilldown-ready navigation from KPI cards into operational records.
- A maintainable base for future trend lines, dimensional slicing, and export/reporting workflows.
