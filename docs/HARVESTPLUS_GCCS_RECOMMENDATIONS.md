# HarvestPlus / GCCS – What to Update to Make the System Better

Based on **HarvestPlus_Platform_Content.txt** (and existing Phase 1 / alignment docs). The exact file *"HarvestPlus – General Collection Center System (GCCS).docx"* was not found in the repo; if your GCCS doc has different content, add it or share the path and this can be refined.

---

## 1. High-Impact Updates (Do First)

### 1.1 Payments UI – Identity & Verification (Spec §6)

**Spec:** Clear “Verified / Not Verified” states; block payment approval if ID missing.

**Current:** Backend blocks payout when any farmer is unverified; API returns `unverifiedFarmers`. The payments dashboard does **not** show verification status or disable the Approve button when unverified.

**Update:**

- **API:** Extend `GET /api/v1/payments/collections` to include `farmerIdVerified: boolean` per collection (from `id_verifications`).
- **UI:** On the payouts/collections table:
  - Show a “Verified” / “Not verified” badge per farmer/row.
  - Disable “Approve payout” when any farmer in the list is unverified and show: “Verify all farmers’ IDs before approving.”
  - On approve error, display the API’s `unverifiedFarmers` list (toast or inline).

**Outcome:** Full alignment with §6 and fewer failed approval attempts.

---

### 1.2 Agent Collection App (Spec §8 – Operations)

**Spec:** “Agent Collection App (commodity-aware)” as a Phase 1 key screen.

**Current:** MCC intake is commodity-aware and supports agent selection; there is no dedicated agent-facing flow (e.g. mobile or simplified UI for field agents).

**Update (Phase 2):**

- Add a dedicated **Agent Collection** flow (e.g. `/[lang]/dashboard/agent/collections` or separate app):
  - Commodity selector at top (Dairy, Coffee, Maize, etc.) → auto-loads units, quality fields, pricing logic.
  - Same dynamic collection form as MCC intake (or a simplified subset).
  - `agentId` from auth token; no need for MCC to select agent.
- **API:** Either keep using `POST /api/v1/mcc/commodities/collections` with `agentId` from token, or add `POST /api/v1/agent/collections` that enforces caller is agent and auto-fills `agentId`.

**Outcome:** Agents can record collections in the field without using the full MCC dashboard.

---

### 1.3 Quality & Compliance Audit (Spec §9 – Audit logs)

**Spec:** “Audit logs for payments & quality changes.”

**Current:** Prepayments have full audit (`agent_prepayment_audit`). There is no dedicated audit for quality schema changes or quality result overrides.

**Update:**

- Add a **quality/compliance audit** store:
  - Option A: New table e.g. `quality_audit_log` with `entityType`, `entityId`, `action` (e.g. `QUALITY_SCHEMA_UPDATE`, `QUALITY_OVERRIDE`), `oldValue`, `newValue`, `userId`, `createdAt`.
  - Option B: Extend existing audit pipeline with the same actions.
- Emit events when:
  - Quality schema is updated (Commodity Studio).
  - Quality result is overridden or manually changed (e.g. at MCC/quality review).
- Optional: Admin UI to filter audit by “quality” actions.

**Outcome:** Full traceability for quality changes and compliance.

---

## 2. Medium-Impact Updates (Next)

### 2.1 Offline-First for Agents (Spec §9)

**Spec:** “Offline-first for agents.”

**Current:** Not implemented (no PWA, service worker, or offline queue). Role has `mcc.offline.sync` but no sync logic.

**Update (Phase 3):**

- **Design:** PWA + IndexedDB queue for collections (and optionally prepayments); sync when online; conflict policy (e.g. server-wins or last-write).
- **Backend:** e.g. `agent_sync_queue` (agentId, entityType, entityId, payload, status, syncedAt), optional `agent_device_info` (agentId, deviceId, lastSyncAt).
- **API:** `POST /api/v1/agent/sync` accepting a batch of pending operations and returning conflicts/errors.
- **Rough effort:** 2–4 weeks for a minimal viable offline + sync.

**Outcome:** Agents can record collections in low-connectivity areas and sync later.

---

### 2.2 Commodity Selection at “Top of Every Flow” (Spec – “How This Looks in the SYSTEM”)

**Spec:** “When an agent starts a collection: Select Commodity: Dairy / Coffee / Maize / Beans / Rice” → auto-loads units, quality fields, pricing logic, storage type.

**Current:** MCC intake and collection form are already commodity-first and dynamic. Ensure the same pattern is true everywhere collections are started (including any future Agent Collection App).

**Update:**

- In any new or refactored “start collection” flow, enforce **commodity selection first**, then load:
  - Units, quality fields, pricing logic, storage type from commodity config.
- Document this as the standard “collection flow” so new features don’t hard-code a single commodity.

**Outcome:** Consistent, config-driven behavior across MCC and agent flows.

---

### 2.3 Farmer Ledger – Per-Commodity Reporting (Spec §7)

**Spec:** “Maintain ledger entries per commodity.”

**Current:** Ledger entries are traceable to commodity via `refId` → `commodity_collections` → `commodityId`. No direct column on ledger.

**Update (optional):**

- Add `commodityId` to `farmer_ledger`. Backfill from existing collections; set on new entries from collection’s `commodityId`.
- Use for faster per-commodity ledger reports and “ledger entries per commodity” without joining through collections.

**Outcome:** Simpler reporting and clearer alignment with “ledger per commodity.”

---

## 3. Branding & Positioning (Spec §9 – “How I’d Brand This”)

**Spec:** Move from “HarvestPlus Dairy ERP” to “HarvestPlus by GEMURA – Multi-Commodity Aggregation & Settlement Platform” with sub-verticals (HarvestPlus Dairy, HarvestPlus Coffee, HarvestPlus Grains).

**Updates:**

- **UI:** Use “HarvestPlus by GEMURA” (or “GEMURA – HarvestPlus”) in app title, login, and main navigation; use “Multi-Commodity Aggregation & Settlement” (or similar) in tagline or footer.
- **Sub-verticals:** Where useful (e.g. reports or filters), allow filtering or labeling by “Dairy”, “Coffee”, “Grains” (driven by commodity config, not hard-coded).
- **Docs / Help:** Short explanation that the platform supports multiple commodities and that each value chain uses the same backbone with commodity-specific rules.

**Outcome:** Clear positioning as national agri-infrastructure and multi-commodity platform.

---

## 4. Summary Table

| Priority | Update | Spec ref | Effort |
|----------|--------|----------|--------|
| High | Payments UI: Verified/Not verified + disable Approve when unverified | §6, §8 | Small |
| High | Agent Collection App (dedicated agent flow) | §8 | Medium |
| High | Quality/compliance audit (schema + overrides) | §9 | Small–Medium |
| Medium | Offline-first for agents (PWA + sync) | §9 | Large |
| Medium | Commodity-first in every collection flow | System design | Small |
| Medium | `farmer_ledger.commodityId` for reporting | §7 | Small |
| Lower | Branding: HarvestPlus by GEMURA, sub-verticals | Brand | Small |

---

## 5. What’s Already Aligned (No Change Required)

- **Commodity Studio:** Categories, Define Commodity, Quality Schema Builder, Frequency & Season Manager, Inputs Catalog (§3, §8).
- **MCC Intake:** Dynamic quality forms, commodity-aware (§8).
- **Quality Review Screen:** Quality column and review dialog (§8).
- **Inventory / Storage:** Commodity-aware batches and locations (§8).
- **Payout Review & Approval:** With advance deduction and ID gate (§7, §8).
- **Config-driven UI:** No hard-coded commodities (§9).
- **RBAC & multi-tenant:** Implemented (§9).
- **Add new commodity in &lt;1 day:** Supported via Commodity Studio (§10).

If you add **HarvestPlus – General Collection Center System (GCCS).docx** to the repo (or paste its sections), recommendations can be tightened to match that document exactly.
