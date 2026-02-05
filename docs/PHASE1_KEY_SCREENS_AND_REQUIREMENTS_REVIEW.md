# Phase 1: Key Screens, Non-Functional Requirements & Outcomes – Review

## 8. Key Screens to Implement (Phase 1) – Implementation Status

### Admin

| Screen | Status | Location / Notes |
|--------|--------|------------------|
| **Commodity Studio – Categories** | ✅ Implemented | `/[lang]/dashboard/admin/commodity-studio?tab=categories`; `CommodityCategoriesManager`; API `GET/POST /api/v1/admin/commodity-studio/categories` |
| **Commodity Studio – Define Commodity** | ✅ Implemented | Same app, tab `commodities`; `CommoditiesManager`; API `GET/POST/PUT /api/v1/admin/commodity-studio/commodities` |
| **Quality Schema Builder** | ✅ Implemented | Tab `quality`; `QualitySchemaBuilder`; quality fields + rules per commodity; API quality-fields, quality-rules |
| **Frequency & Season Manager** | ✅ Implemented | Tab `frequency`; `FrequencySeasonManager`; default collection frequency + season templates per commodity |
| **Inputs Catalog Manager** | ✅ Implemented | Tab `input-catalog`; `InputCatalogManager`; inputs per commodity (category, unit, pricing reference) |

### Operations

| Screen | Status | Location / Notes |
|--------|--------|------------------|
| **Agent Collection App (commodity-aware)** | ⚠️ Partial | **MCC-side:** `CommodityCollectionForm` used on MCC dashboard and `/[lang]/dashboard/mcc/commodities/collections` – commodity-aware, dynamic quality, agent selection. **Gap:** No dedicated “Agent Collection App” (e.g. agent-facing mobile or simplified UI for field agents to record collections). Agents can be selected in the form; collection API accepts `agentId`. |
| **MCC Intake Screen (dynamic quality forms)** | ✅ Implemented | `CommodityCollectionForm`: step 4 loads quality fields from selected commodity; form posts `qualityData`; validation via `CommodityStudioService.validateQuality`. |
| **Quality Review Screen** | ✅ Implemented | Collections list at `/[lang]/dashboard/mcc/commodities/collections` has “Quality” column (score) and “Review” button opening a dialog that shows quality score + dynamic quality fields (from `commodity.qualityFields` + `qualityData`). |
| **Inventory / Storage Screen** | ✅ Implemented | MCC: `/[lang]/dashboard/mcc/inventory-rentals` (warehouse hub, stock). Schema: `inventory_batches` is commodity-aware (`commodityId`); `commodity_collections` can link `warehouseId`, `locationId`, `productId`, `stockMoveId`. |

### Finance

| Screen | Status | Location / Notes |
|--------|--------|------------------|
| **Payout Review (with advance deduction)** | ✅ Implemented | `/[lang]/dashboard/payments` – “Farmers Payouts” tab; payouts computed as `totalAmount - deductions - advances - agentAdvance`; table shows volume, totalAmount, deductions, advances, agentAdvance, netPayout per collection. |
| **Payment Approval & Execution** | ✅ Implemented | Same page: “Approve payout” calls `POST /api/v1/payments/approve-payout`; API verifies all farmers’ IDs, updates collection status to PAID, creates `mcc_payments`, updates farmer account. |

---

## 9. Non-Functional Requirements – Status

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Offline-first for agents** | ❌ Not implemented | No PWA, service worker, or offline queue found. Roles define `mcc.offline.sync` but no sync/offline logic. **Gap:** Requires design (e.g. PWA + IndexedDB queue + sync API). |
| **Config-driven UI (no hard-coded commodities)** | ✅ Implemented | Commodities from `GET /api/v1/admin/commodity-studio/commodities`; quality fields/rules from commodity config; collection form and quality review render from schema. |
| **Audit logs for payments & quality changes** | ⚠️ Partial | **Payments/prepayments:** `agent_prepayment_audit` (CREATED, SETTLED, etc.); prepayment UI shows audit trail. **Quality:** No dedicated audit table for “quality schema change” or “quality result override”; general admin audit at `/[lang]/dashboard/settings/audit` and API `admin/settings/audit-logs`. |
| **Role-based access control** | ✅ Implemented | `lib/roles.ts` + permissions; routes guarded by role (e.g. ADMIN, SUPER_ADMIN, MCC_MANAGER); API uses `verifyAuthToken` and role checks. |
| **Multi-tenant ready (future scale)** | ✅ Implemented | Tenant = MCC: `mccId` on collections, farmers, agents, payouts; APIs filter by `user.mccId` for MCC_MANAGER; SUPER_ADMIN/ADMIN can cross-MCC. |

---

## 10. Expected Outcome – Alignment

| Outcome | Status |
|---------|--------|
| Add a new commodity in &lt;1 day | ✅ Supported via Commodity Studio (categories → commodity → quality → frequency → input catalog); no code deploy. |
| Support multiple value chains without rewrites | ✅ Single pipeline: `commodity_collections`, config-driven quality and inputs. |
| Power aggregation, finance, and compliance | ✅ Aggregation (collections, payouts); finance (net payout, advances, approve-payout, ledger); compliance (ID verification gate, quality validation). |
| Position GEMURA as national agri-infrastructure | ✅ Architecture supports it; rollout depends on deployment and adoption. |

---

## Proposed Data Model Changes

1. **Quality / compliance audit (optional)**  
   - **Table:** e.g. `quality_audit_log` or extend existing audit: `entityType`, `entityId`, `action` (e.g. QUALITY_SCHEMA_UPDATE, QUALITY_OVERRIDE), `oldValue`, `newValue`, `userId`, `createdAt`.  
   - **Purpose:** Explicit audit trail for quality schema changes and any manual quality overrides.

2. **Farmer ledger per commodity (optional)**  
   - **Current:** `farmer_ledger` has `refId` (e.g. collection id); commodity derived via `commodity_collections.commodityId`.  
   - **Optional:** Add `commodityId` to `farmer_ledger` for faster per-commodity reporting and “ledger entries per commodity” without join.  
   - **Impact:** One extra column; backfill from existing collections; new entries set from collection’s commodityId.

3. **Offline / sync (for agents)**  
   - **Tables (example):** `agent_sync_queue` (id, agentId, entityType, entityId, payload, status, createdAt, syncedAt), optional `agent_device_info` (agentId, deviceId, lastSyncAt).  
   - **Purpose:** Queue collections (and optionally prepayments) when offline; sync when online; conflict policy (e.g. server-wins or last-write).

4. **No mandatory change for Phase 1**  
   - Current schema already supports Phase 1 screens and outcomes. Above are optional for audit clarity, reporting, and future offline.

---

## API Implications

1. **Payments – verification status**  
   - **GET** `/api/v1/payments/collections`: Extend response to include per-collection or per-farmer `farmerIdVerified: boolean` (from `id_verifications`) so the UI can show Verified/Not verified and disable Approve when any farmer is unverified.  
   - **No change** to approve-payout contract; it already returns 400 and `unverifiedFarmers` when applicable.

2. **Agent Collection App (if built)**  
   - **Option A:** Reuse `POST /api/v1/mcc/commodities/collections` with `agentId` from token; add an optional “agent context” (e.g. `?agentApp=1`) if future logic differs.  
   - **Option B:** New route e.g. `POST /api/v1/agent/collections` that enforces caller is agent, auto-fills `agentId`, same body as MCC intake.  
   - **Offline:** Later add `POST /api/v1/agent/sync` accepting a batch of pending collections (from queue) and returning conflicts/errors.

3. **Audit**  
   - If `quality_audit_log` (or equivalent) is added: `POST` from backend when schema or quality result changes; `GET` for admin audit UI (optional).

4. **Commodity Studio**  
   - No API contract changes required for Phase 1; existing CRUD and stats are sufficient.

---

## Phasing & Delivery Plan

| Phase | Scope | Deliverables |
|-------|--------|--------------|
| **Phase 1 (current)** | Key screens 8 + NFR 9 (except offline) + outcome 10 | ✅ Admin: Commodity Studio (all 5). ✅ Operations: MCC intake (dynamic quality), Quality review, Inventory. ✅ Finance: Payout review with advance, Approval & execution. ✅ Config-driven; RBAC; multi-tenant. ⚠️ Agent app: reuse MCC form or add lightweight agent flow. ⚠️ Audit: prepayment full; quality audit optional. |
| **Phase 1.1 (short)** | UX and compliance | (1) Payments UI: show Verified/Not verified per farmer; disable Approve when unverified; surface `unverifiedFarmers` on error. (2) Optional: quality audit table + write on schema/override. (3) Optional: `farmer_ledger.commodityId` for reporting. |
| **Phase 2** | Agent Collection App | Dedicated agent flow (web or PWA): list farmers/commodities, record collection (reuse or mirror intake API), optional offline queue + sync API. |
| **Phase 3** | Offline-first for agents | PWA + IndexedDB queue; sync API; conflict handling; `agent_sync_queue` (or equivalent) and device/sync metadata. |

---

## Technical Constraints

1. **Next.js / React**  
   - All key screens are server-rendered or client-rendered in same app; no separate “agent app” yet. Adding a dedicated agent app (subdomain or path) is feasible with same API.

2. **Database**  
   - Prisma + PostgreSQL (or current DB). New tables (audit, sync queue) require migrations. `farmer_ledger.commodityId` is additive.

3. **Offline**  
   - Offline-first needs a clear strategy: PWA (Workbox), IndexedDB for queue, sync endpoint, and conflict resolution. Not in codebase today; estimate 2–4 weeks for a minimal viable offline+sync.

4. **Identity**  
   - All payouts already gated by `id_verifications`; no change to that contract. Optional: expose verification status in more APIs for UI.

5. **Multi-tenant**  
   - Scoping by `mccId` is consistent. Adding future “tenant” above MCC (e.g. org/cooperative) would require a higher-level id and migration; not required for Phase 1.

6. **Ikofi**  
   - Farmer fields and payment method enum support Ikofi; actual Ikofi API integration is external and env-specific; no constraint from current schema.

---

## Summary

- **Section 8 (Key Screens):** Admin and Finance screens are implemented. Operations: MCC intake, quality review, and inventory are in place; the only gap is a **dedicated Agent Collection App** (optional Phase 2).
- **Section 9 (NFR):** Config-driven UI, RBAC, and multi-tenant are done. **Offline-first for agents** is not implemented. **Audit:** strong for prepayments; optional extension for quality.
- **Section 10 (Outcome):** Architecture and current implementation support adding a new commodity in &lt;1 day, multiple value chains, and aggregation/finance/compliance.

**Recommended next steps:**  
1) Add verification status to payments collections API and UI (Phase 1.1).  
2) Optionally add quality audit and `farmer_ledger.commodityId`.  
3) Plan Phase 2 for a dedicated Agent Collection App and Phase 3 for offline-first once scope is fixed.
