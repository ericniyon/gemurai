# SOROMA Phase 3 — Operational Workflow Engine

## Procurement

`REQUESTED → RFQ_SENT → AWAITING_APPROVAL → APPROVED → PARTIALLY_RECEIVED → CLOSED`

| Action | Permission |
|--------|------------|
| Approve / Reject | `soroma.po.approve` |
| Other transitions | `soroma.procurement.manage` |

API: `POST /api/v1/soroma/tenant/:tenantId/purchase-orders/:id/transition`

## Production

`PLANNED → STARTED → IN_PROGRESS → QC_REVIEW → COMPLETED → ARCHIVED`

API: `POST /api/v1/soroma/tenant/:tenantId/batches/:id/transition`

## Logistics

`PLANNED → ASSIGNED → IN_TRANSIT → DELIVERED → POD_RECEIVED → CLOSED`

API: `POST /api/v1/soroma/tenant/:tenantId/shipments/:id/transition`

## UI

- Procurement, Production, and Logistics pages include **Workflow Board** + **Timeline**
- Actions are permission-filtered server-side and re-validated on API

## Audit

Each transition writes:

- `soroma_workflow_events` (timeline)
- `soroma_audit_logs` (`workflow.{action}`)
