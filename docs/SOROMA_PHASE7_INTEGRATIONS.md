# SOROMA Phase 7 - Integration Framework & Sync Engine

## Implemented

### Connector framework service

- `lib/soroma/integrations.ts`
  - connector registry upsert
  - tenant connection lifecycle
  - sync queue enqueue/process
  - retry flow
  - dead-letter handling
  - webhook intake -> queued sync job

### Security hardening

- API key/secret are not stored as plain text.
- Connection credentials are hashed (`sha256`) and persisted under `config.credentials`.

### Platform integration APIs

- `GET/POST /api/v1/soroma/integrations/connectors`
- `GET/POST /api/v1/soroma/integrations/sync-jobs`
- `POST /api/v1/soroma/integrations/jobs/process`
- `POST /api/v1/soroma/integrations/jobs/:jobId/retry`
- `POST /api/v1/soroma/integrations/webhooks/:connectorCode`

### Tenant integration APIs

- `GET/POST /api/v1/soroma/tenant/:tenantId/integrations/connections`
- `POST /api/v1/soroma/tenant/:tenantId/integrations/connections/:connectionId/sync`
- `GET /api/v1/soroma/tenant/:tenantId/integrations/sync-jobs`

### Retry and DLQ behavior

- failed sync -> status `FAILED`
- retry creates new `RETRYING` job
- optional reason can move original job to `DEAD_LETTER`
- `soroma_sync_logs` capture job lifecycle logs

### Webhook processing

- Connector webhook endpoint accepts event payload
- Resolves tenant connection by connector + tenant/account identifiers
- Enqueues `WEBHOOK_{eventType}` sync jobs

### UI and operational dashboards

- `components/soroma/integration-sync-center.tsx`
  - trigger sync (tenant)
  - process queue (platform)
  - retry failed jobs
- Tenant integrations page now includes orchestration center.
- Platform integrations page now includes orchestration center.
- Integration health page includes dead-letter queue table.

### RBAC and routing

- Added integration API permission keys in guards:
  - `integrations:GET`
  - `integrations:POST`
  - `integrations:RETRY`
- Tenant alerts route/nav updates carried from prior phase:
  - `SOROMA_ROUTES.tenant(tenantId).alerts`
  - nav + route permission rule for `/alerts`

## Notes

- Existing models (`soroma_connector*`, `soroma_sync_*`) were extended behaviorally without destructive migration.
- Queue processing is currently in-app orchestration and can be moved to dedicated workers later.
