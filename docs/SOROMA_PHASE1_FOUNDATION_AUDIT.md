# SOROMA FOODS - Phase 1 Foundation Audit

This document captures the baseline architecture and hardening outcomes completed
during Phase 1.

## Architecture Inventory

- Product routes: `app/soroma`
- API surface: `app/api/v1/soroma`
- Reusable UI system: `components/soroma`
- Domain services/utilities: `lib/soroma`
- Data models: `prisma/schema.prisma` (`soroma_*` tables)
- Session/auth source: `Gemurai_token` + `verifyAuthToken`

## Reusable Component Inventory

- Shell: `soroma-shell`
- Dashboard composition: `module-dashboard`, `dashboard-card`, `page-header`
- Data display: `kpi-card`, `chart-card`, `data-table`, `status-badge`
- Context UX: `scope-banner`, `date-range-picker`, `alert-strip`, `quick-actions`
- New Phase 1 primitives:
  - `empty-state`
  - `loading-skeleton`
  - `filter-bar`
  - `action-modal`

## API Inventory

- `GET /api/v1/soroma/context`
- `GET/POST /api/v1/soroma/tenant/:tenantId/suppliers`
- `GET/POST /api/v1/soroma/tenant/:tenantId/purchase-orders`
- `GET/POST /api/v1/soroma/tenant/:tenantId/passports`
- `PATCH /api/v1/soroma/alerts/:id`

## Dashboard Inventory

- Platform modules P-01 to P-10 under `app/soroma/platform/*`
- Tenant modules T-01 to T-10 under `app/soroma/tenant/[tenantId]/*`
- Aggregation layer: `lib/soroma/dashboard-data.ts`

## RBAC Flow Review (Current)

- Membership based access:
  - `SoromaPlatformMembership`
  - `SoromaTenantMembership`
- Permission map currently in code (`lib/soroma/auth.ts`)
- Menu visibility filtered by permission (`lib/soroma/navigation.ts`)

## Tenant Isolation Review (Current)

- Tenant-scoped query patterns are used in SOROMA APIs.
- `assertTenantAccess` enforces membership/tenant checks.
- Layout guards:
  - `requirePlatformSession`
  - `requireTenantSession`

## Schema Review (Current)

- Comprehensive SOROMA domain schema exists:
  supplier -> procurement -> production -> inventory -> orders -> logistics ->
  passports -> traceability events + compliance + integrations + finance + alerts.

## Phase 1 Hardening Implemented

### API Standards and Validation

- Added `lib/soroma/validators.ts` (Zod request contracts).
- Extended `lib/soroma/api-handler.ts` with:
  - consistent success/error payload helpers
  - validation error shaping
  - centralized API exception handling
  - JSON body parsing + schema validation helper
- Updated all SOROMA API routes to use shared validation/error handling.

### UI Standardization

- Added reusable empty/loading/filter/modal primitives.
- Integrated reusable loading and empty states in `data-table`.

### Error Boundaries and Loading UX

- Added segment boundaries:
  - `app/soroma/error.tsx`
  - `app/soroma/platform/error.tsx`
  - `app/soroma/tenant/[tenantId]/error.tsx`
- Added loading states:
  - `app/soroma/loading.tsx`
  - `app/soroma/platform/loading.tsx`
  - `app/soroma/tenant/[tenantId]/loading.tsx`

## Remaining Phase 1 Work

- Standardize naming and service split for `dashboard-data.ts`.
- Add request/response contract tests for SOROMA APIs.
- Add app-level structured logging destination and correlation IDs.
- Add route-level guard components (`RoleGuard`, `PermissionGuard`) for Phase 2.
