# YDEN / HarvestPlus GCCS — Feature Implementation Gap

This document maps the **System Purpose**, **Functional Requirements (FR-1–FR-14)**, **User Journeys**, and **NFRs** to the current codebase and lists what is **implemented** vs **missing** or **partial**.

---

## 1. User journeys

| Journey | Status | Notes |
|--------|--------|------|
| **0. Pre-Collection Agent (PCA)** | ❌ Missing | No availability signals, supply discovery, or aggregator matching. *Implementing: table + API + UI.* |
| **1. Farmer / Producer** | ✅ Mostly | Registration (individual/cooperative via register + MCC onboarding), collection at MCC, delivery confirmation (collection record), payment (payout dashboard). **Partial:** Pre-collection self-report or PCA confirm not available. |
| **2. Aggregator / Transporter** | ⚠️ Partial | Agent collection flow exists (`/agent/collections`); aggregator can deliver and get paid. **Missing:** Route planning from availability signals, route acceptance, transport mode on collection (bike/moto/truck), aggregator routes/capacity/delivery history (FR-3). |
| **3. Collection Center / Hub** | ✅ Implemented | Intake, quality, digital ledger (collection record), inventory batches. **Partial:** No first-class "Commodity Receipt" entity (receipt = accepted collection + batch); stock exposure to B2B marketplace not from receipts. |
| **4. Bulk / Wholesale Marketplace (B2B)** | ⚠️ Partial | Marketplace exists but is **product/DCC stock orders**, not stock-backed commodity listings from collection/inventory. FR-10/11/12 (stock visibility, approved offtakers, marketplace→settlement) require a B2B commodity offtake layer. |
| **5. Processor / Offtaker** | ❌ Missing | No processor approval workflow, offtake request, or T+N settlement terms. Would build on B2B marketplace layer. |

---

## 2. Functional requirements

| ID | Requirement | Status | Notes |
|----|-------------|--------|------|
| **FR-1** | Collection at farm gate, village hub, collection center, cold room, processor intake | ⚠️ Partial | MCC/warehouse types exist; no `collectionPointType` on collection record. *Adding to schema.* |
| **FR-2** | Transport modes: bicycle, motorcycle, tricycle, 4-wheel | ❌ Missing | Not stored on collection. *Adding `transportMode` to commodity_collections.* |
| **FR-3** | Aggregators register routes, capacity, delivery history | ❌ Missing | No aggregator route or capacity model. Post-PCA. |
| **FR-4** | Commodity config: liquids, dry grains, fresh produce, other | ✅ Implemented | Commodity Studio, multi-commodity. |
| **FR-5** | HarvestPlus Collection Record: YDEN user ID, role, location, transport | ⚠️ Partial | Record has farmer, agent, mcc, location; no YDEN user ID or transport. *Transport added.* |
| **FR-6** | Ledger creates reputation/performance for youth entrepreneurs | ⚠️ Partial | Ledger and collections exist; no explicit reputation/performance score. |
| **FR-7** | HarvestPlus Commodity Receipts: verified, time-bound, settleable | ⚠️ Partial | Conceptually collection + batch; no dedicated receipt entity or “receipt” lifecycle. |
| **FR-8** | Instant Pay, Scheduled Pay, hybrid advance | ⚠️ Partial | Payout approval and advances exist; no explicit Instant Pay (fintech) vs Scheduled Pay (T+N). |
| **FR-9** | Payments to individual, aggregator, group accounts | ✅ Partial | Individual and agent (aggregator) supported; group accounts not explicit. |
| **FR-10–12** | Stock visibility, approved offtakers, marketplace→settlement | ❌ Missing | Requires B2B commodity marketplace from inventory/collections. |
| **FR-13** | YDEN identity, role-based permissions | ✅ Implemented | Users, roles, RBAC. Commodity-scoped RBAC only in trainings. |
| **FR-14** | HarvestPlus as operator, standards enforcer, neutral facilitator | ✅ Policy | Product positioning; no code gap. |

---

## 3. Non-functional requirements

| NFR | Status | Notes |
|-----|--------|------|
| **RBAC by role & commodity** | ⚠️ Partial | Role-based access implemented; commodity-scoped permissions only in training module. |
| **Financial-grade audit logs** | ⚠️ Partial | Prepayment audit, quality_audit_log; payments/ledger audit could be strengthened. |
| **High-frequency (milk) / bulk (grains)** | ✅ Supported | Collection and listing patterns in place. |
| **Mobile-first** | ✅ Supported | Responsive UI. |
| **Offline-first for rural** | ❌ Missing | No PWA, service worker, or offline queue (see HARVESTPLUS_GCCS_RECOMMENDATIONS §2.1). |

---

## 4. Implemented in this pass

1. **Pre-Collection Availability Signals (Journey 0)**  
   - New table `pre_collection_availability_signals` (commodity, quantity, readiness, location, storage, source: PCA/farmer/coop).  
   - APIs: `POST/GET /api/v1/pre-collection/signals`, `GET /api/v1/pre-collection/commodities`.  
   - UI: `/[lang]/dashboard/pre-collection` — list active signals, create signal (dialog). Nav: **Supply signals** (MCC Manager, Agent, Super Admin).

2. **FR-1 / FR-2 on collection record**  
   - `collectionPointType` and `transportMode` on `commodity_collections` (schema + migration).  
   - `CommodityCollectionService.recordCollection` and `POST /api/v1/mcc/commodities/collections` accept and persist them.

3. **Feature gap doc**  
   - This file for tracking and prioritisation.

**Apply DB changes:** run `npx prisma migrate deploy` (or `prisma migrate dev`) so migration `20250308100000_yden_pre_collection_and_collection_fields` is applied.

---

## 5. Recommended next steps (priority)

1. **B2B commodity marketplace** — Expose `inventory_batches` / approved collections as stock listings; offtaker approval; offtake request → delivery + settlement (FR-10, FR-11, FR-12; Journeys 4–5).  
2. **Aggregator routes & capacity** — Model for aggregator routes, capacity, delivery history (FR-3; Journey 2).  
3. **Instant Pay vs Scheduled Pay** — Explicit payment type and T+N settlement terms; fintech integration hook.  
4. **Offline-first for agents** — PWA + sync queue (see HARVESTPLUS_GCCS_RECOMMENDATIONS).  
5. **Commodity receipt entity** — Optional first-class receipt (or clear doc that receipt = collection + batch) and receipt lifecycle for financing.
