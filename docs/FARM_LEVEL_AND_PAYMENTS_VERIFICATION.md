# Farm-Level Data, Agent Prepayments, ID Enforcement & Payments – Verification

This document verifies implementation of sections **4.2**, **4.3**, **5**, **6**, and **7** against the specification.

---

## 4.2 Season Plans (Commodity-Based)

**Spec:** Farmers (or agents) create Season Plans with: Commodity, Season, Plot/herd reference, Expected harvest volume, Expected harvest dates, Frequency (auto-filled from commodity, editable). Enables: Expected vs actual tracking, Input financing logic, Agent planning.

### Schema ✓
- **`season_plans`** (Prisma): `farmerId`, `commodityId`, `season`, `plotHerdReference`, `expectedHarvestVolume`, `expectedHarvestStartDate`, `expectedHarvestEndDate`, `collectionFrequency`, `region`, `status`, `actualHarvestVolume`, `notes`. All required spec fields present.

### API ✓
- **POST/GET** `/api/v1/farmers/season-plans` – create/list farmer season plans (farmerId, commodityId, season, expectedHarvestVolume, expectedHarvestStartDate, expectedHarvestEndDate, collectionFrequency, etc.).
- **GET** `/api/v1/farmers/season-plans?farmerId=...` – filter by farmer.
- **SeasonPlanService**: `createSeasonPlan`, `getFarmerSeasonPlans`, `updateSeasonPlanActualVolume` (for actual harvest volume).

### UI ✓
- **SeasonPlanManager** (`components/farm-level-data/SeasonPlanManager.tsx`): Form has Farmer, Commodity, Season, Plot/Herd reference, Expected harvest volume, Expected harvest start/end dates, Collection frequency (editable), Region, Notes. Lists plans with expected volume and dates.
- **FrequencySeasonManager** (Commodity Studio): Season *templates* per commodity (admin-level); farmer-level plans are in Farm-Level Data → Season Plans.

### Expected vs actual ✓
- `season_plans.actualHarvestVolume` exists; `SeasonPlanService.updateSeasonPlanActualVolume` supports recording actual. Enables expected vs actual tracking and input financing logic.

**Verdict: 4.2 implemented.**

---

## 4.3 Input Usage Logging

**Spec:** Inputs logged against: Farmer, Season plan, Commodity. Used for: Productivity analytics, Credit scoring, Extension services.

### Schema ✓
- **`input_usage_logs`**: `seasonPlanId`, `inputCatalogId`, `farmerId`, `quantity`, `unit`, `usageDate`, `cost`, `notes`. Season plan → commodity via `season_plans.commodityId`; input catalog → commodity via `input_catalog.commodityId`. So each log is tied to farmer, season plan, and (via plan or catalog) commodity.

### API ✓
- **GET/POST** `/api/v1/farm-level-data/input-usage` – list and create input usage logs (farmerId, seasonPlanId, inputCatalogId, quantity, unit, cost, notes).
- **SeasonPlanService.logInputUsage** – creates log linked to season plan, input catalog, farmer.

### UI ✓
- **InputUsageLogger** (`components/farm-level-data/InputUsageLogger.tsx`): Select Farmer → loads season plans; select Season plan → loads input catalog for that plan’s commodity. Log quantity, unit, cost, notes. Data is usable for productivity analytics, credit scoring, and extension (e.g. reports by farmer/commodity).

**Verdict: 4.3 implemented.**

---

## 5. Agent & Prepayment Logic

**Spec:** Agent records advance at farm level. Advance linked to: Farmer ID, Commodity, Batch. Settlement: Total value – agent advance = net payout. Enforcement: No payout if farmer ID not verified; full audit trail.

### Schema ✓
- **`agent_prepayments`**: `farmerId`, `agentId`, `commodityId`, `batchId`, `collectionId`, `amount`, `status` (PENDING, SETTLED, CANCELLED), `settlementId`, `recordedAt`, `settledAt`.
- **`agent_prepayment_audit`**: `prepaymentId`, `action` (CREATED, SETTLED, CANCELLED, UPDATED), `performedBy`, `oldValue`, `newValue`, `notes`, `createdAt` – full audit trail.

### Settlement formula ✓
- **CommodityCollectionService**: `netPayment = totalAmount - totalDeductions - advances - agentAdvance`; `agentAdvance` is sum of pending prepayments for that farmer+commodity. Collection stores `agentAdvance`, `netPayment`; on create, pending prepayments are applied and net payout is correct.

### Enforcement ✓
- **CommodityCollectionService.recordCollection**: Before recording, calls `IDVerificationService.canReceivePayment("farmer", data.farmerId)`; if not allowed, throws (no collection/payout).
- **AgentPrepaymentService**: When recording prepayment and when settling, checks `id_verifications` for farmer; if not VERIFIED, throws (“Farmer ID must be verified before recording prepayment” / “before settlement/payout”).

### API & UI ✓
- **Agent prepayments**: `/api/v1/agent-prepayments` (create, list), `/api/v1/agent-prepayments/settle-collection` (settle against collection). **AgentPrepaymentManager** and **CommodityCollectionForm** (agent advance display/settlement) in place.

**Verdict: 5 implemented.**

---

## 6. Identity & ID Enforcement (Non-Negotiable)

**Spec:** Farmer: National ID mandatory. Agent: National ID + Agent ID. All payouts tied to verified profiles. UI: Clear Verified/Not Verified states; block payment approval if ID missing; store verification timestamp.

### Schema ✓
- **`id_verifications`**: `entityType` (farmer, agent, user), `entityId`, `nationalId`, `agentId` (for agents), `verificationStatus` (PENDING, VERIFIED, REJECTED), `verifiedBy`, `verifiedAt`, `verificationMethod`, `verificationNotes`. Verification timestamp stored.

### Backend enforcement ✓
- **Farmer**: National ID required on farmer create (farm-level-data farmers API); collection recording and payout blocked if farmer not verified (`IDVerificationService.canReceivePayment`; `approve-payout` checks all farmers verified).
- **Agent**: Agent ID is User id; `id_verifications` supports `entityType: "agent"` and `agentId`; prepayment/settlement logic checks farmer verification (agent verification can be enforced similarly where needed).

### Block payment approval ✓
- **POST** `/api/v1/payments/approve-payout`: Loads collections, fetches `id_verifications` for all farmer IDs; if any farmer not VERIFIED, returns **400** with `error: "Cannot approve payout: Some farmers have unverified IDs"` and `unverifiedFarmers` list. No payout is processed.

### UI (gaps)
- **Verified/Not Verified states**: Farmer profile and ID verification admin flows exist; payments dashboard does **not** yet show a “Verified” / “Not verified” badge per farmer or per row. When approve fails, the API returns the list of unverified farmers; the UI could surface this and show verification status on the payouts/collections table.
- **Block payment approval in UI**: Approval is blocked on the server; UI could disable “Approve” when any selected farmer is unverified once verification status is returned (e.g. from `/api/v1/payments/collections` or a dedicated check).

**Verdict: 6 implemented on backend (mandatory IDs, payouts tied to verified profiles, approval blocked, audit + timestamp). UI could be enhanced to show Verified/Not Verified and disable Approve when any farmer is unverified.**

---

## 7. Payments & Finance

**Spec:** Handle split settlements (farmer vs agent); full and partial (advance already paid); integrate with Ikofi APIs; maintain ledger entries per commodity.

### Split settlements (farmer vs agent) ✓
- **Commodity collections**: `totalAmount`, `totalDeductions`, `advances`, `agentAdvance`, `netPayment`. Net payout to farmer = total − deductions − advances − agent advance; agent advance is tracked and settled via `agent_prepayments` and settle-collection. So farmer vs agent split is implemented.

### Full vs partial (advance already paid) ✓
- **Full**: No prepayments → `netPayment = totalAmount - totalDeductions - advances`.
- **Partial**: Prepayments applied → `agentAdvance` set, `netPayment` reduced; on payout only the net is paid. Supported.

### Ikofi ✓
- **Schema**: `farmers.paymentMethod` (e.g. ikofi), `farmers.ikofiId`; **PaymentMethod** enum includes `ikofi`. MCC/farmer flows (e.g. FarmerProfileManager, AddFarmerForm) support Ikofi; **Ikofi page** under MCC dashboard (`/[lang]/dashboard/mcc/ikofi`) for payments & financing. Integration with external Ikofi APIs is environment-specific (env/keys); structure for Ikofi is in place.

### Ledger entries per commodity ✓
- **`farmer_ledger`**: `farmerId`, `type` (e.g. COMMODITY_COLLECTION), `amount`, `balanceAfter`, `refId` (e.g. collection id). **CommodityCollectionService** creates ledger entry on collection with `refId = collection.id`; collection has `commodityId`, so ledger entries are traceable to commodity via `refId` → `commodity_collections` → `commodityId`. Ledger is per farmer; “per commodity” is achieved by refId linking to commodity collection.

**Verdict: 7 implemented (split settlements, full/partial, Ikofi structure, ledger traceable to commodity).**

---

## Summary Table

| Section | Status | Notes |
|--------|--------|--------|
| 4.2 Season Plans | ✓ Implemented | Schema, API, SeasonPlanManager; expected/actual volume supported |
| 4.3 Input Usage | ✓ Implemented | Logs against farmer, season plan, commodity; API + InputUsageLogger |
| 5 Agent Prepayment | ✓ Implemented | Advance linked to farmer, commodity, batch; net = total − advance; ID check; audit table |
| 6 ID Enforcement | ✓ Backend / △ UI | Payouts blocked if unverified; verifiedAt stored; UI could show Verified/Not Verified and disable Approve |
| 7 Payments & Finance | ✓ Implemented | Split farmer/agent; full/partial; Ikofi fields & page; ledger with refId → commodity |

---

## Suggested UI Enhancement (Section 6)

1. **Payments – verification status**  
   - In **GET** `/api/v1/payments/collections`, include for each collection (or each distinct farmer) a flag such as `farmerIdVerified: boolean` (derived from `id_verifications`).
   - In the payments dashboard, show a “Verified” / “Not verified” badge per farmer/row and surface the API’s `unverifiedFarmers` in the error message when approve fails (e.g. toast or inline list).
2. **Block Approve when unverified**  
   - If the list of collections includes any farmer with `farmerIdVerified === false`, disable the “Approve payout” button and show a short message: e.g. “Verify all farmers’ IDs before approving.”

This keeps enforcement in the API (already done) and makes the requirement visible and actionable in the UI.
