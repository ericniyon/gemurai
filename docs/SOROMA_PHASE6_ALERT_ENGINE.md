# SOROMA Phase 6 - Alert Engine & Notification Orchestration

## Implemented

### Central alert engine

- `lib/soroma/alerts.ts`
  - `runTenantAlertRules(tenantId)`:
    - low stock
    - integration failures
    - traceability gaps
    - overdue invoices
  - `runPlatformAlertRules()`:
    - delayed onboarding
  - deduplicated open/in-progress alerts (`createAlertIfMissing`)

### Alert workflow features

Added action workflow on alerts:

- assign
- set SLA
- escalate
- in progress
- resolve
- reopen

Implemented via:

- `applyAlertAction(...)` in `lib/soroma/alerts.ts`
- `POST /api/v1/soroma/alerts/:id/actions`
- `POST /api/v1/soroma/tenant/:tenantId/alerts/:id/actions`

### Comments & evidence

- `POST /api/v1/soroma/alerts/:id/comments`
- `POST /api/v1/soroma/alerts/:id/evidence`
- tenant-scoped equivalents under `/tenant/:tenantId/alerts/:id/...`

All comments/evidence are stored in `SoromaAlert.metadata` and audited.

### Triggering rules

- `POST /api/v1/soroma/alerts/rules` (platform-wide rule run)
- `POST /api/v1/soroma/tenant/:tenantId/alerts/refresh` (tenant rule run)

### UI

- New reusable `components/soroma/alert-center.tsx`
  - action buttons (in-progress, resolve, reopen, escalate)
  - comment and evidence submission
  - rule-run button
- Platform page upgraded:
  - `app/soroma/platform/alerts/page.tsx`
- New tenant page:
  - `app/soroma/tenant/[tenantId]/alerts/page.tsx`
- Tenant navigation now includes Alerts.

### RBAC & route protection updates

- Added tenant alerts route and nav:
  - `SOROMA_ROUTES.tenant(tenantId).alerts`
  - `config/navigation/soroma.ts`
  - `lib/soroma/route-permissions.ts`
- Added guard permission keys:
  - `alerts:GET`
  - `alerts:PATCH` (existing)
- Tenant roles updated with alert visibility/management where relevant.

## Notes

- Existing data is preserved (additive behavior).
- Alert comments/evidence currently use JSON metadata for speed and compatibility.
