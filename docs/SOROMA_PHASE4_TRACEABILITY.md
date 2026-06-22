# SOROMA Phase 4 - Traceability & Product Passport Engine

## Implemented

### Genealogy service

- `lib/soroma/traceability.ts`
  - `getPassportGenealogy(tenantId, passportId)`
  - `verifyPassportScan(...)`

Genealogy chain now resolves:

Supplier -> Purchase Order -> Raw Material Lot -> Production Batch -> Finished SKU ->
Stock Lot/Warehouse -> Orders -> Shipments -> Passport

### Verification and lineage APIs

- `GET /api/v1/soroma/tenant/:tenantId/traceability/passports/:passportId/genealogy`
- `POST /api/v1/soroma/tenant/:tenantId/traceability/passports/:passportId/verify`
- `GET /api/v1/soroma/verify/:passportNo?tenantId=...` (public QR verification)

### Traceability events and scans

QR verification writes:

- `soroma_passport_scans`
- `soroma_traceability_events` (`passport.qr_verified`)
- `soroma_audit_logs` (`passport.qr_verified`)

### Tenant traceability UI

- `app/soroma/tenant/[tenantId]/traceability/page.tsx`
  - Passport registry includes QR verification URL
  - Genealogy explorer card
  - Verification timeline panel

## Notes

- Existing data is preserved; this phase extends behavior only.
- Verification endpoints remain tenant-scoped by default; public endpoint requires `tenantId`.
