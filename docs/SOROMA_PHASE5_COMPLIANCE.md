# SOROMA Phase 5 - Compliance & Quality Management

## Implemented

### Compliance APIs (tenant scoped)

- `GET/POST /api/v1/soroma/tenant/:tenantId/compliance/certifications`
- `GET/POST /api/v1/soroma/tenant/:tenantId/compliance/audits`
- `GET/POST /api/v1/soroma/tenant/:tenantId/compliance/qc-tests`
- `GET/POST /api/v1/soroma/tenant/:tenantId/compliance/capas`
- `POST /api/v1/soroma/tenant/:tenantId/compliance/capas/:id/transition`

All routes are protected by:

- tenant-scope validation
- compliance permission guards (`soroma.compliance.view/manage`)

### CAPA workflow

Implemented stage engine:

`OPEN -> INVESTIGATION -> CORRECTIVE_ACTION -> VERIFICATION -> CLOSED`

Transitions are logged to:

- `soroma_workflow_events` (`entityType = SoromaCAPA`)
- `soroma_audit_logs` (`workflow.*`)

### Compliance operations service

- `lib/soroma/compliance.ts`
  - Compliance operational data aggregation
  - CAPA stage resolution from workflow events
  - Compliance alert generation

### Compliance alerts

Automatically creates tenant alerts for:

- expiring certifications (`CERTIFICATION_EXPIRING`)
- failed QC tests (`QC_FAILED`)

### UI upgrades

`app/soroma/tenant/[tenantId]/compliance/page.tsx` now includes:

- operational CAPA workflow board + timeline
- supplier compliance ranking table
- QC analytics table
- compliance action permissions on quick actions
