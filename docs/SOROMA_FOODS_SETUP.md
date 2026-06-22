# SOROMA FOODS — Setup Guide

SOROMA FOODS is built **on top of Gemurai/HarvestPlus**, sharing the same database and auth (`Gemurai_token`), with its own routes, branding, and data model (`soroma_*` tables).

## URLs

| Area | Path |
|------|------|
| Login | `/soroma/login` |
| Platform admin | `/soroma/platform/overview` |
| Tenant workspace | `/soroma/tenant/{tenantId}/overview` |
| APIs | `/api/v1/soroma/...` |

## Database

Apply the new Prisma models (safe: only adds `soroma_*` tables when migration is run on a DB in sync with schema):

```bash
npx prisma migrate dev --name soroma_foods
```

If your local DB has schema drift, coordinate with your team before `db push`. Do **not** use `--accept-data-loss` on production.

## Seed demo data

```bash
npx tsx scripts/seed-soroma.ts
npx tsx scripts/seed-soroma-users.ts
npx tsx scripts/seed-soroma-rbac.ts
```

Apply RBAC + workflow migration (Phase 2.1 / 3):

```bash
npx prisma migrate deploy
# or locally: npx prisma migrate dev
npx tsx scripts/seed-soroma-rbac.ts
```

### SOROMA test accounts (password: `Soroma2026!`)

**Platform** — sign in at `/soroma/login` → Platform workspace

| Email | Role |
|-------|------|
| platform.superadmin@soroma.rw | PLATFORM_SUPER_ADMIN |
| platform.operator@soroma.rw | PLATFORM_OPERATOR |
| platform.compliance@soroma.rw | PLATFORM_COMPLIANCE_OFFICER |
| platform.integrations@soroma.rw | INTEGRATION_MANAGER |
| platform.me@soroma.rw | ME_OFFICER |
| platform.support@soroma.rw | SUPPORT_AGENT |

**Tenant (GreenFoods Ltd)** — Tenant workspace

| Email | Role |
|-------|------|
| greenfoods.admin@soroma.rw | TENANT_ADMIN |
| greenfoods.suppliers@soroma.rw | SUPPLIER_MANAGER |
| greenfoods.procurement@soroma.rw | PROCUREMENT_OFFICER |
| greenfoods.production@soroma.rw | PRODUCTION_LEAD |
| greenfoods.warehouse@soroma.rw | WAREHOUSE_MANAGER |
| greenfoods.sales@soroma.rw | SALES_ORDERS_OFFICER |
| greenfoods.logistics@soroma.rw | LOGISTICS_COORDINATOR |
| greenfoods.finance@soroma.rw | FINANCE_MANAGER |
| greenfoods.qa@soroma.rw | QA_COMPLIANCE_OFFICER |
| greenfoods.reports@soroma.rw | REPORTS_VIEWER |

**Existing super admin:** `superadmin@DJYH.rw` (platform + tenant admin) — uses your existing password, not `Soroma2026!`.

This creates:

- **GreenFoods Ltd** tenant (slug: `greenfoods-ltd`)
- Connectors (RwandaMart, eHaHo, etc.)
- Sample suppliers, POs, batches, orders, passport, finance, alerts
- Links the first `admin*` user as platform + tenant admin (if found)

## Access

1. Sign in at `/soroma/login` with a user that has:
   - `SoromaPlatformMembership`, and/or
   - `SoromaTenantMembership`, or
   - `SUPER_ADMIN` role (auto platform access)
2. Platform users see cross-tenant modules (P-01 … P-10).
3. Tenant users see operational modules (T-01 … T-10).

## Modules implemented

### Tenant (T-01 – T-10)

- Suppliers, Procurement, Production, Inventory, Buyers & Orders
- Logistics, Traceability, Compliance, Integrations, Finance, Settings

### Platform (P-01 – P-10)

- Overview, Tenants, Onboarding, Program Targets, M&E
- Ecosystem Analytics, Compliance Oversight, Alerts
- Integrations Hub, Integration Health

## APIs (CRUD samples)

- `GET/POST /api/v1/soroma/tenant/:tenantId/suppliers`
- `GET/POST /api/v1/soroma/tenant/:tenantId/purchase-orders`
- `GET/POST /api/v1/soroma/tenant/:tenantId/passports`
- `PATCH /api/v1/soroma/alerts/:id`
- `GET /api/v1/soroma/context`

## Next phases (roadmap)

- Interactive forms/modals for all quick actions
- Charts/maps (Recharts + map widgets)
- Webhook receiver + sync job runner
- Event bus consumers for traceability chain
- Async export pipeline with audit

HarvestPlus routes and data are **unchanged**.
