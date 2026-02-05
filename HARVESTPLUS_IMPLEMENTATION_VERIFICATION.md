# HarvestPlus Implementation Verification

**Last updated:** 2026-02-04  
**Status:** Implemented — one core platform + configurable commodity logic (no hard-coding).

---

## Product Vision (Official)

> **HarvestPlus** is becoming a **commodity operating system** for Rwanda's agriculture value chains, supporting:
>
> - **Smallholder farmers**
> - **Agents / Abacunda**
> - **Collection Centers** (MCCs, coffee washing stations, warehouses)
> - **Quality & compliance officers**
> - **Payments & financing** (Ikofi integration)
>
> **Key principle:** One core platform + configurable commodity logic (no hard-coding).

---

## Implementation Checklist

### 1. Key principle: One core platform + configurable commodity logic (no hard-coding)

| Item | Status | Implementation |
|------|--------|----------------|
| Commodity definitions in DB, not code | ✅ | `commodities` table, Commodity Studio at `/en/dashboard/admin/commodity-studio` |
| Quality fields configurable per commodity | ✅ | `commodity_quality_fields`, `commodity_quality_rules`, Quality Schema Builder |
| Single collection pipeline for all commodities | ✅ | `commodity_collections` table, `CommodityCollectionService`, `CommodityCollectionForm` |
| New commodity addable without code | ✅ | Admin: Commodity Studio → Categories → Commodities → Quality fields/rules |
| Legacy milk/crop tables | ⚠️ Kept for backward compatibility | `milk_collections`, `crop_collections` still used for legacy data; **new flows use `commodity_collections`** |

**References:**  
- `prisma/schema.prisma`: `commodities`, `commodity_quality_fields`, `commodity_quality_rules`, `commodity_collections`  
- `lib/services/CommodityCollectionService.ts`, `lib/services/CommodityStudioService.ts`  
- `app/[lang]/dashboard/admin/commodity-studio/page.tsx`  
- `app/[lang]/dashboard/mcc/commodities/collections/page.tsx`, `components/mcc/CommodityCollectionForm.tsx`

---

### 2. Value chain: Smallholder farmers

| Item | Status | Implementation |
|------|--------|----------------|
| Farmer profiles & registration | ✅ | `farmers` table, Farm-Level Data module, onboarding |
| National ID (mandatory for payouts) | ✅ | `farmers.nationalId`, `id_verifications`, ID verification before collection |
| Season plans (farm-level planning) | ✅ | `season_plans`, `POST/GET /api/v1/farmers/season-plans` |
| Input usage tracking | ✅ | `input_catalog`, `input_usage_logs`, Farm-Level Data → Input Usage |
| Collections linked to farmers | ✅ | `commodity_collections.farmerId` |

**References:**  
- `app/[lang]/dashboard/farm-level-data` (Farmer Profiles, Season Plans, Input Usage)  
- `app/api/v1/farm-level-data/farmers`, `app/api/v1/farmers/season-plans`  
- `lib/services/IDVerificationService.ts`, `lib/services/SeasonPlanService.ts`

---

### 3. Value chain: Agents / Abacunda

| Item | Status | Implementation |
|------|--------|----------------|
| Agent as collector on collection record | ✅ | `commodity_collections.agentId`, User relation "CommodityCollectionAgent" |
| Agent prepayment (advance at farm) | ✅ | `commodity_collections.agentAdvance`, `agent_prepayments`, Agent Advances dashboard |
| Settlement: total − deductions − advances − agentAdvance | ✅ | In `CommodityCollectionService` and payment flows |
| Agent ID verification | ✅ | ID verification supports farmer + agent; payouts tied to verified profiles |

**References:**  
- `app/[lang]/dashboard/agent-advances/page.tsx`  
- `app/api/v1/mcc/commodities/collections` (POST body can include `agentId`, `agentAdvance`)  
- `prisma/schema.prisma`: `commodity_collections.agentId`, `commodity_collections.agentAdvance`

---

### 4. Value chain: Collection Centers (MCCs, coffee washing stations, warehouses)

| Item | Status | Implementation |
|------|--------|----------------|
| MCCs as collection centers | ✅ | `mccs` table, MCC dashboard, collections linked via `commodity_collections.mccId` |
| Center type configurable per commodity | ✅ | `commodities.defaultCollectionCenterType` (e.g. MCC, coffee_washing_station, warehouse) |
| Warehouses / locations for storage | ✅ | `Warehouse`, `Location`, `commodity_collections.warehouseId`, `locationId` |
| Coffee washing stations | ✅ | Supported as a center type in commodity config; same collection pipeline |

**References:**  
- `prisma/schema.prisma`: `commodities.defaultCollectionCenterType`, `mccs`, `commodity_collections.mccId`  
- `app/[lang]/dashboard/mcc/*` (MCC dashboard, collections, stock, payments)  
- `MULTI_COMMODITY_PLATFORM_VERIFICATION.md` (collection center types)

---

### 5. Value chain: Quality & compliance officers

| Item | Status | Implementation |
|------|--------|----------------|
| Dynamic quality fields per commodity | ✅ | `commodity_quality_fields` (NUMERIC, DROPDOWN, BOOLEAN, etc.) |
| Quality rules (pass/fail, thresholds, pricing impact) | ✅ | `commodity_quality_rules`, evaluated in collection flow |
| Quality data on collection | ✅ | `commodity_collections.qualityData` (JSON), `qualityScore` |
| ID verification & payment blocking | ✅ | `id_verifications`, enforcement in `CommodityCollectionService` |

**References:**  
- `lib/services/CommodityCollectionService.ts` (quality validation)  
- `app/[lang]/dashboard/admin/commodity-studio` (Quality Schema Builder)  
- `app/api/v1/admin/id-verification`

---

### 6. Value chain: Payments & financing (Ikofi integration)

| Item | Status | Implementation |
|------|--------|----------------|
| Farmer payment method (Ikofi / MoMo / bank / cash) | ✅ | `PaymentMethod` enum includes `ikofi`; farmer profile has `paymentMethod`, `ikofiId` |
| iKOFI Wallet ID on farmer | ✅ | `farmers.ikofiId` (unique) |
| MCC Ikofi dashboard | ✅ | `/en/dashboard/mcc/ikofi`, `GET /api/v1/mcc/ikofi` (savings, loans, insurance, payments) |
| Payments linked to collections | ✅ | `mcc_payments`, reconciliation uses `commodity_collections` + legacy milk/crop |

**References:**  
- `app/[lang]/dashboard/mcc/ikofi/page.tsx`, `app/api/v1/mcc/ikofi/route.ts`  
- `app/[lang]/dashboard/payments/page.tsx` (Farmer Payments)  
- `prisma/schema.prisma`: `farmers.ikofiId`, `PaymentMethod`, `mcc_payments`  
- `components/farm-level-data/FarmerProfileManager.tsx` (ikofiId, payment method)

---

## Summary

| Area | Implemented | Notes |
|------|-------------|--------|
| One platform + configurable commodity logic | ✅ | Commodity Studio + `commodity_collections` + dynamic quality |
| Smallholder farmers | ✅ | Profiles, season plans, input usage, ID verification |
| Agents / Abacunda | ✅ | Agent on collection, prepayments, settlement logic |
| Collection centers (MCCs, CWS, warehouses) | ✅ | MCCs + `defaultCollectionCenterType` + warehouses |
| Quality & compliance | ✅ | Dynamic quality fields/rules, ID verification |
| Payments & Ikofi | ✅ | Ikofi dashboard, farmer ikofiId, payment methods |

**Legacy:** `milk_collections` and `crop_collections` remain for backward compatibility and reconciliation. All **new** collection flows use the unified **commodity_collections** pipeline and configurable commodity logic.

---

## Quick links (in app)

- **HarvestPlus hub:** `/en/dashboard/harvestplus`
- **Commodity Studio (admin):** `/en/dashboard/admin/commodity-studio`
- **Multi-commodity collections:** `/en/dashboard/mcc/commodities/collections`
- **Farmer payments:** `/en/dashboard/payments`
- **Agent advances:** `/en/dashboard/agent-advances`
- **Reconciliation:** `/en/dashboard/mcc/reconciliation`
- **Farm-level data:** `/en/dashboard/farm-level-data`
- **Ikofi:** `/en/dashboard/mcc/ikofi`
