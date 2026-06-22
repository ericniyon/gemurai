# SOROMA Phase 9 — Exports, Reporting & Audit System

Phase 9 delivers enterprise reporting governance with export orchestration, scheduled reporting, and searchable audit history.

## Delivered capabilities

1. **Export engine (CSV / XLSX / PDF)**
   - Added `lib/soroma/reporting.ts` and `lib/soroma/export-pdf-template.tsx`.
   - Supports filter-aware dataset exports for:
     - `alerts`
     - `audit_logs`
     - `workflows`
     - `integrations`
     - `orders`
     - `finance`
   - Supports on-demand export responses and asynchronous queued jobs.

2. **Scheduled reports + async export orchestration**
   - Added new persistence models:
     - `SoromaExportJob`
     - `SoromaReportSchedule`
   - Added migration:
     - `prisma/migrations/20260525120000_soroma_reporting_audit/migration.sql`
   - Added scheduling cadence support:
     - `DAILY`
     - `WEEKLY`
     - `MONTHLY`
   - Added queue processing and due-schedule execution flows.

3. **Audit governance APIs**
   - Platform:
     - `GET /api/v1/soroma/platform/audit/logs`
     - `GET /api/v1/soroma/platform/audit/history`
   - Tenant:
     - `GET /api/v1/soroma/tenant/[tenantId]/audit/logs`
     - `GET /api/v1/soroma/tenant/[tenantId]/audit/history`
   - Supports:
     - search
     - action filtering
     - entity history (`entityType`, `entityId`)
     - date range filtering

4. **Reporting/export APIs**
   - Platform:
     - `GET/POST /api/v1/soroma/platform/reports/exports`
     - `POST /api/v1/soroma/platform/reports/exports/process`
     - `GET/POST /api/v1/soroma/platform/reports/schedules`
     - `POST /api/v1/soroma/platform/reports/schedules/run`
   - Tenant:
     - `GET/POST /api/v1/soroma/tenant/[tenantId]/reports/exports`
     - `POST /api/v1/soroma/tenant/[tenantId]/reports/exports/process`
     - `GET/POST /api/v1/soroma/tenant/[tenantId]/reports/schedules`
     - `POST /api/v1/soroma/tenant/[tenantId]/reports/schedules/run`

5. **UI and route-level governance surface**
   - Added new pages:
     - `app/soroma/platform/reports/page.tsx`
     - `app/soroma/platform/audit/page.tsx`
     - `app/soroma/tenant/[tenantId]/reports/page.tsx`
     - `app/soroma/tenant/[tenantId]/audit/page.tsx`
   - Added route constants/navigation entries/route guards for Reports and Audit across platform + tenant workspaces.
   - Added Phase 9 permissions into RBAC and API permission map.

## Outcome

At the end of Phase 9:
- enterprise-grade export and reporting operations are available
- async and scheduled reporting workflows exist
- governance is enforceable through searchable audit logs and entity-level change history
