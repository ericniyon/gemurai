# Amakusanyirizo Domain Model - Domain Alignment Mapping

**Document Version:** 1.0  
**Date:** 2025-01-XX  
**Purpose:** Map existing Gemurai system features to Amakusanyirizo (aggregation) domain model concepts

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Amakusanyirizo Domain Model Overview](#amakusanyirizo-domain-model-overview)
3. [Domain Mapping: Agriculture Aggregation (Crops)](#domain-mapping-agriculture-aggregation-crops)
4. [Domain Mapping: MCC Milk Aggregation](#domain-mapping-mcc-milk-aggregation)
5. [Domain Mapping: Financial Settlement & Deductions](#domain-mapping-financial-settlement--deductions)
6. [Domain Mapping: Warehouse & Stock Movement](#domain-mapping-warehouse--stock-movement)
7. [Domain Mapping: Services & Asset Rental](#domain-mapping-services--asset-rental)
8. [Gap Analysis](#gap-analysis)
9. [Implicit Concepts Requiring Explicit Implementation](#implicit-concepts-requiring-explicit-implementation)

---

## Executive Summary

**Amakusanyirizo** (Kinyarwanda: "aggregation" or "collection") represents a unified model for agricultural product aggregation, financial settlement, and service management. This document maps existing Gemurai system features to Amakusanyirizo domain concepts.

### Mapping Status Overview

| Domain Concept | Explicit Implementation | Implicit Implementation | Gap Status |
|---------------|------------------------|------------------------|------------|
| **Agriculture Aggregation (Crops)** | ❌ None | ⚠️ Partial (via products) | 🔴 **GAP** |
| **MCC Milk Aggregation** | ✅ Complete | ✅ Complete | ✅ **ALIGNED** |
| **Financial Settlement & Deductions** | ✅ Complete | ✅ Complete | ✅ **ALIGNED** |
| **Warehouse & Stock Movement** | ✅ Complete | ✅ Complete | ✅ **ALIGNED** |
| **Services & Asset Rental** | ✅ Complete | ⚠️ Partial | ⚠️ **PARTIAL** |

---

## Amakusanyirizo Domain Model Overview

### Core Domain Concepts

1. **Aggregation (Amakusanyirizo)**: The process of collecting agricultural products from multiple producers
2. **Settlement (Gusubiza)**: Financial reconciliation and payment processing
3. **Deductions (Gukuraho)**: Automatic deductions from payments (advances, products, fees)
4. **Warehouse Management (Ubwoba)**: Inventory and stock movement tracking
5. **Service Provision (Serivisi)**: Asset rental and service delivery

### Domain Principles

- **Multi-Product Aggregation**: Support for various agricultural products (milk, crops, etc.)
- **Unified Financial Model**: Consistent settlement and deduction logic across product types
- **Traceability**: Full chain of custody from producer to processor
- **Quality Assurance**: Quality validation at collection point
- **Period-Based Accounting**: Time-based aggregation periods for financial reconciliation

---

## Domain Mapping: Agriculture Aggregation (Crops)

### Amakusanyirizo Concept
**Crop Aggregation**: Collection of agricultural crops (maize, beans, coffee, etc.) from farmers, with quality testing, weighing, and inventory management.

### Current System Mapping

#### ❌ **GAP: No Explicit Crop Aggregation**

**Current State:**
- No dedicated crop collection entities
- No crop-specific quality testing
- No crop aggregation periods
- No crop-specific warehouses

#### ⚠️ **Implicit Implementation (Partial)**

**What Exists:**
1. **Generic Product System** (`products` table)
   - Can store crop products via `inventoryType: GENERAL`
   - Has `category` and `subcategory` fields
   - Supports stock tracking via `StockQuantity`
   - **Gap**: No explicit "CROP" inventory type

2. **Farmer Entity** (`farmers` table)
   - Can represent crop farmers
   - Has GPS coordinates, location, village
   - Has account and ledger system
   - **Gap**: No crop-specific farmer attributes

3. **Stock Movement System** (`StockMove`)
   - Can track crop movements
   - Supports INCOMING, OUTGOING, INTERNAL moves
   - **Gap**: No crop-specific collection workflow

4. **Sales System** (`sales`, `sale_items`)
   - Can record crop sales
   - Supports farmer → MCC sales
   - **Gap**: No crop collection → inventory flow

### Required Amakusanyirizo Entities (Not Yet Implemented)

```typescript
// Conceptual entities needed for crop aggregation:

1. crop_collections
   - farmerId, mccId, collectionDate
   - cropType, quantity, unit (kg, bags, etc.)
   - qualityTests (moisture, grade, etc.)
   - pricePerUnit, totalAmount
   - deductions, advances, netPayment
   - status: PENDING, APPROVED, PAID, PROCESSED

2. crop_types
   - name, code, unitOfMeasure
   - qualityStandards, gradingRules
   - defaultPricePerUnit

3. crop_warehouses
   - mccId, name, type (STORAGE, DRYING, PROCESSING)
   - capacity, currentStock
   - temperature, humidity controls

4. crop_periods
   - mccId, periodNumber, startDate, endDate
   - totalFarmers, totalQuantity, totalAmount
   - status: ACTIVE, COMPLETED, CLOSED
```

### Mapping Strategy

| Amakusanyirizo Concept | Current System | Mapping Approach |
|------------------------|----------------|------------------|
| **Crop Collection** | ❌ None | Create `crop_collections` (similar to `milk_collections`) |
| **Crop Quality Testing** | ❌ None | Extend quality validation (moisture, grade, etc.) |
| **Crop Inventory** | ⚠️ Generic products | Use `products` with `inventoryType: CROP` |
| **Crop Warehouses** | ⚠️ Generic warehouses | Use `Warehouse` with crop-specific locations |
| **Crop Periods** | ❌ None | Create `crop_periods` (similar to `mcc_periods`) |
| **Crop Processing** | ⚠️ Generic processing | Use `milk_processing` pattern for crops |

### Gap Analysis: Agriculture Aggregation

| Feature | Status | Priority |
|---------|--------|----------|
| Crop collection workflow | ❌ Missing | 🔴 **HIGH** |
| Crop quality testing | ❌ Missing | 🔴 **HIGH** |
| Crop-specific inventory | ⚠️ Partial | 🟡 **MEDIUM** |
| Crop aggregation periods | ❌ Missing | 🔴 **HIGH** |
| Crop processing workflows | ⚠️ Partial | 🟡 **MEDIUM** |
| Crop-specific warehouses | ⚠️ Partial | 🟡 **MEDIUM** |

---

## Domain Mapping: MCC Milk Aggregation

### Amakusanyirizo Concept
**Milk Aggregation**: Collection of milk from dairy farmers, quality testing, inventory management, and processing workflows.

### Current System Mapping

#### ✅ **Explicit Implementation (Complete)**

**What Exists:**

1. **Milk Collection Entity** (`milk_collections`)
   ```prisma
   - farmerId, mccId, collectionDate
   - totalLiters, unitPrice, totalAmount
   - Quality tests: fat, protein, lactometerReading, antibioticTest, tempCelsius
   - Deductions: JSON field for products and other deductions
   - Advances: Float field
   - Status: PENDING, APPROVED, PAID, PROCESSED
   - Traceability: sampleTag, photoUrl, geolocation, agentId
   ```

2. **MCC Periods** (`mcc_periods`)
   ```prisma
   - mccId, periodNumber, startDate, endDate
   - Aggregates: totalFarmers, totalMilkCollected, totalAmount
   - Deductions: totalDeductions, totalAdvances
   - Status: ACTIVE, COMPLETED, CLOSED
   ```

3. **Milk Processing** (`milk_processing`)
   ```prisma
   - mccId, rawMilkProductId, processedProductId
   - inputQuantity, outputQuantity
   - processingSteps: JSON
   - qualityMetrics: JSON
   ```

4. **Bulk Batches** (`bulk_batches`)
   ```prisma
   - mccId, totalLiters
   - dispatched, dispatchedToProcessorId
   - Links multiple milk_collections
   ```

5. **MCC Warehouses** (`mcc_warehouses`)
   ```prisma
   - mccId, name, type (COLLECTION_CENTER, PROCESSING_PLANT, COLD_STORAGE, DISTRIBUTION_CENTER)
   - location, capacity, isActive
   ```

### Amakusanyirizo Alignment

| Amakusanyirizo Concept | Current System Entity | Alignment Status |
|------------------------|----------------------|------------------|
| **Milk Collection** | `milk_collections` | ✅ **FULLY ALIGNED** |
| **Quality Testing** | Quality fields in `milk_collections` | ✅ **FULLY ALIGNED** |
| **Aggregation Periods** | `mcc_periods` | ✅ **FULLY ALIGNED** |
| **Financial Settlement** | `mcc_payments` + `farmer_accounts` | ✅ **FULLY ALIGNED** |
| **Deductions** | `deductions` JSON in `milk_collections` | ✅ **FULLY ALIGNED** |
| **Inventory Integration** | `StockMove` from collections | ✅ **FULLY ALIGNED** |
| **Bulk Operations** | `bulk_batches` | ✅ **FULLY ALIGNED** |
| **Processing** | `milk_processing` | ✅ **FULLY ALIGNED** |

### Service Integration

**MilkCollectionService** (`lib/services/MilkCollectionService.ts`)
- ✅ `validateQuality()`: Quality validation logic
- ✅ `recordCollection()`: Collection recording with inventory integration
- ✅ `updateFarmerAccount()`: Account and ledger updates

**MCCInventoryService** (`lib/services/MCCInventoryService.ts`)
- ✅ `recordMilkCollection()`: Collection → inventory integration
- ✅ `getMCCInventorySummary()`: Inventory aggregation

### Gap Analysis: MCC Milk Aggregation

| Feature | Status | Notes |
|---------|--------|-------|
| Collection workflow | ✅ Complete | Fully implemented |
| Quality testing | ✅ Complete | Comprehensive quality rules |
| Period-based aggregation | ✅ Complete | `mcc_periods` fully functional |
| Financial settlement | ✅ Complete | Payment processing complete |
| Deductions system | ✅ Complete | Flexible JSON-based deductions |
| Inventory integration | ✅ Complete | StockMove integration working |
| Bulk operations | ✅ Complete | `bulk_batches` implemented |
| Processing workflows | ✅ Complete | `milk_processing` implemented |

**Status**: ✅ **FULLY ALIGNED** - No gaps identified

---

## Domain Mapping: Financial Settlement & Deductions

### Amakusanyirizo Concept
**Financial Settlement**: Automated calculation of payments, deductions, and advances with ledger tracking and reconciliation.

### Current System Mapping

#### ✅ **Explicit Implementation (Complete)**

**What Exists:**

1. **Payment Calculation Logic**
   ```typescript
   // From MilkCollectionService.recordCollection()
   totalAmount = totalLiters × unitPrice
   totalDeductions = productDeductions + otherDeductions
   netPayment = totalAmount - totalDeductions - advances
   ```

2. **Deductions System** (`milk_collections.deductions` JSON)
   ```json
   {
     "products": [
       { "productId": "...", "quantity": 2, "unitPrice": 500, "totalPrice": 1000 }
     ],
     "others": {
       "transport": 200,
       "feed": 500,
       "veterinary": 300
     }
   }
   ```

3. **Payment Entities**
   - `mcc_payments`: MCC-specific farmer payments
   - `payments`: Generic payment records
   - `farmer_accounts`: Account balance tracking
   - `farmer_ledger`: Transaction history

4. **Payment Methods**
   ```prisma
   enum PaymentMethod {
     cash
     mobile_money
     bank_transfer
   }
   ```

5. **Payment Status**
   ```prisma
   enum PaymentStatus {
     pending
     paid
     partial
   }
   ```

### Amakusanyirizo Alignment

| Amakusanyirizo Concept | Current System Entity | Alignment Status |
|------------------------|----------------------|------------------|
| **Settlement Calculation** | `MilkCollectionService` logic | ✅ **FULLY ALIGNED** |
| **Product Deductions** | `deductions.products` JSON | ✅ **FULLY ALIGNED** |
| **Other Deductions** | `deductions.others` JSON | ✅ **FULLY ALIGNED** |
| **Advances** | `advances` Float field | ✅ **FULLY ALIGNED** |
| **Payment Processing** | `mcc_payments` entity | ✅ **FULLY ALIGNED** |
| **Account Management** | `farmer_accounts` | ✅ **FULLY ALIGNED** |
| **Ledger Tracking** | `farmer_ledger` | ✅ **FULLY ALIGNED** |
| **Payment Methods** | `PaymentMethod` enum | ✅ **FULLY ALIGNED** |
| **Payment Status** | `PaymentStatus` enum | ✅ **FULLY ALIGNED** |

### Financial Flow

```
Collection Recorded
  ↓
Calculate: totalAmount = quantity × unitPrice
  ↓
Apply Deductions:
  ├── Product Deductions (from deductions.products)
  └── Other Deductions (from deductions.others)
  ↓
Apply Advances (if any)
  ↓
Calculate: netPayment = totalAmount - totalDeductions - advances
  ↓
[If Immediate Payment]
  ├── Create mcc_payments record
  ├── Update farmer_accounts.balance
  └── Create farmer_ledger entry
[If Credit]
  ├── Update farmer_accounts.balance
  └── Create farmer_ledger entry
```

### Gap Analysis: Financial Settlement & Deductions

| Feature | Status | Notes |
|---------|--------|-------|
| Settlement calculation | ✅ Complete | Automated calculation logic |
| Product deductions | ✅ Complete | JSON-based flexible system |
| Other deductions | ✅ Complete | Flexible JSON structure |
| Advances tracking | ✅ Complete | Deducted from payments |
| Payment processing | ✅ Complete | Multiple payment methods |
| Account management | ✅ Complete | Balance tracking |
| Ledger system | ✅ Complete | Full transaction history |
| Reconciliation | ⚠️ Partial | Manual reconciliation (no automated tool) |

**Status**: ✅ **FULLY ALIGNED** - Minor gap in automated reconciliation tools

---

## Domain Mapping: Warehouse & Stock Movement

### Amakusanyirizo Concept
**Warehouse Management**: Hierarchical location management, stock movement tracking, and inventory reconciliation.

### Current System Mapping

#### ✅ **Explicit Implementation (Complete)**

**What Exists:**

1. **Warehouse System** (`Warehouse`)
   ```prisma
   - id, name, code (unique)
   - description, address, city, country
   - isActive, isMain
   - Supports multiple inventory types: MILK, PHARMACY, GENERAL
   ```

2. **Location Hierarchy** (`Location`)
   ```prisma
   - warehouseId, parentId (self-referential)
   - name, code, locationType
   - maxCapacity, currentCapacity
   - Hierarchical structure for nested locations
   ```

3. **Stock Movement** (`StockMove`)
   ```prisma
   - Odoo-style state machine: DRAFT → CONFIRMED → ASSIGNED → DONE
   - moveType: INCOMING, OUTGOING, INTERNAL, RETURN, ADJUSTMENT, PRODUCTION, SCRAP
   - productId, warehouseId, locationId, destinationLocationId
   - quantity, unitPrice, date, reference, notes
   - createdBy, processedBy, processedAt
   ```

4. **Stock Quantity Tracking** (`StockQuantity`)
   ```prisma
   - productId, warehouseId, locationId (unique constraint)
   - quantity: Total physical stock
   - reservedQuantity: Reserved for confirmed moves
   - availableQuantity: Available for new reservations
   - Formula: availableQuantity = quantity - reservedQuantity
   ```

5. **Inventory Adjustments** (`InventoryAdjustment`)
   ```prisma
   - adjustmentType: INCREASE, DECREASE, SET
   - state: DRAFT → APPROVED → DONE → CANCELLED
   - reason, notes, createdBy, approvedBy
   ```

6. **Cycle Counting** (`CycleCount`, `CycleCountItem`)
   ```prisma
   - Physical inventory verification
   - Expected vs counted quantities
   - Variance calculation
   ```

### Amakusanyirizo Alignment

| Amakusanyirizo Concept | Current System Entity | Alignment Status |
|------------------------|----------------------|------------------|
| **Warehouse Management** | `Warehouse` | ✅ **FULLY ALIGNED** |
| **Location Hierarchy** | `Location` (self-referential) | ✅ **FULLY ALIGNED** |
| **Stock Movement** | `StockMove` | ✅ **FULLY ALIGNED** |
| **State Machine** | `StockMoveState` enum | ✅ **FULLY ALIGNED** |
| **Quantity Tracking** | `StockQuantity` | ✅ **FULLY ALIGNED** |
| **Reservation System** | `reservedQuantity` field | ✅ **FULLY ALIGNED** |
| **Inventory Adjustments** | `InventoryAdjustment` | ✅ **FULLY ALIGNED** |
| **Cycle Counting** | `CycleCount` | ✅ **FULLY ALIGNED** |
| **Multi-Product Support** | `InventoryType` enum | ✅ **FULLY ALIGNED** |

### Stock Movement Workflow

```
Create StockMove (DRAFT)
  ↓
Confirm StockMove (CONFIRMED)
  ↓
[For OUTGOING/INTERNAL] → Check Availability → Reserve Stock
  ↓
Assign StockMove (ASSIGNED)
  ↓
Physical Execution
  ↓
Complete StockMove (DONE)
  ↓
Update StockQuantity:
  ├── INCOMING: Add to destination
  ├── OUTGOING: Remove from source
  └── INTERNAL: Remove from source, add to destination
```

### Integration with Aggregation

**Milk Collection → Inventory:**
- ✅ Creates `StockMove` (INCOMING) when milk collected
- ✅ Updates `StockQuantity` when move completed
- ✅ Links to `milk_collections` via `stockMoveId`

**Crop Collection → Inventory:**
- ❌ **GAP**: No crop collection → inventory integration

### Gap Analysis: Warehouse & Stock Movement

| Feature | Status | Notes |
|---------|--------|-------|
| Warehouse management | ✅ Complete | Full warehouse system |
| Location hierarchy | ✅ Complete | Self-referential structure |
| Stock movement | ✅ Complete | Odoo-style state machine |
| Quantity tracking | ✅ Complete | Three-level quantity system |
| Reservation system | ✅ Complete | Stock reservation working |
| Adjustments | ✅ Complete | Approval workflow |
| Cycle counting | ✅ Complete | Physical verification |
| Multi-product support | ✅ Complete | MILK, PHARMACY, GENERAL |
| Crop integration | ❌ Missing | No crop collection → inventory |

**Status**: ✅ **FULLY ALIGNED** - Gap only in crop-specific integration

---

## Domain Mapping: Services & Asset Rental

### Amakusanyirizo Concept
**Service Provision**: Asset rental, equipment deployment, and service delivery management.

### Current System Mapping

#### ✅ **Explicit Implementation (Complete)**

**What Exists:**

1. **Asset Management** (`assets`)
   ```prisma
   - serial (unique), name, assetType
   - status: available, rented, maintenance
   - currentHolderType: farmer, mcc, vendor
   - currentHolderId
   - purchasedAt, notes
   ```

2. **Rental System** (`rentals`)
   ```prisma
   - assetId, farmerId, mccId
   - rentStart, rentEnd
   - rentFeePerDay, deposit
   - returned, returnedAt
   - contractDoc
   ```

3. **Asset Types** (Implicit)
   - tracker, milk_meter, chiller (from schema comments)
   - Extensible via `assetType` field

4. **Rental Workflow**
   - ✅ Create rental → Update asset status to "rented"
   - ✅ Return rental → Update asset status to "available" or "maintenance"
   - ✅ Track current holder (farmer, mcc, vendor)

### Amakusanyirizo Alignment

| Amakusanyirizo Concept | Current System Entity | Alignment Status |
|------------------------|----------------------|------------------|
| **Asset Registry** | `assets` | ✅ **FULLY ALIGNED** |
| **Asset Types** | `assetType` field | ✅ **FULLY ALIGNED** |
| **Rental Management** | `rentals` | ✅ **FULLY ALIGNED** |
| **Rental Workflow** | Rental API endpoints | ✅ **FULLY ALIGNED** |
| **Asset Status** | `status` field | ✅ **FULLY ALIGNED** |
| **Holder Tracking** | `currentHolderType`, `currentHolderId` | ✅ **FULLY ALIGNED** |
| **Contract Management** | `contractDoc` field | ⚠️ **PARTIAL** (file reference only) |
| **Service Delivery** | ❌ None | 🔴 **GAP** |

### Gap Analysis: Services & Asset Rental

| Feature | Status | Notes |
|---------|--------|-------|
| Asset registry | ✅ Complete | Full asset management |
| Asset types | ✅ Complete | Extensible system |
| Rental management | ✅ Complete | Full rental workflow |
| Rental workflow | ✅ Complete | Create, return, status updates |
| Asset status tracking | ✅ Complete | available, rented, maintenance |
| Holder tracking | ✅ Complete | Tracks current holder |
| Contract management | ⚠️ Partial | Only file reference, no contract terms |
| Service delivery | ❌ Missing | No service delivery tracking |
| Service types | ❌ Missing | No explicit service catalog |
| Service pricing | ❌ Missing | No service pricing model |

### Implicit Concepts Requiring Explicit Implementation

1. **Service Catalog**
   - ❌ No explicit service entity
   - ⚠️ Could use `products` with `productType: SERVICE`
   - **Gap**: No service-specific attributes (duration, SLA, etc.)

2. **Service Delivery Tracking**
   - ❌ No service delivery records
   - ❌ No service completion tracking
   - **Gap**: No service fulfillment workflow

3. **Service Pricing**
   - ❌ No service pricing model
   - ⚠️ Rental fees exist, but no general service pricing
   - **Gap**: No service subscription or usage-based pricing

**Status**: ⚠️ **PARTIAL ALIGNMENT** - Asset rental complete, service delivery missing

---

## Gap Analysis

### Summary of Gaps

#### 🔴 **Critical Gaps (High Priority)**

1. **Agriculture Aggregation (Crops)**
   - ❌ No crop collection entities
   - ❌ No crop quality testing
   - ❌ No crop aggregation periods
   - ❌ No crop-specific inventory type
   - **Impact**: Cannot support crop aggregation workflows

2. **Service Delivery**
   - ❌ No service delivery tracking
   - ❌ No service catalog
   - ❌ No service pricing model
   - **Impact**: Limited to asset rental only

#### 🟡 **Medium Priority Gaps**

3. **Contract Management**
   - ⚠️ Only file reference for contracts
   - ❌ No contract terms tracking
   - ❌ No contract lifecycle management
   - **Impact**: Manual contract management

4. **Automated Reconciliation**
   - ⚠️ Manual reconciliation process
   - ❌ No automated reconciliation tools
   - **Impact**: Time-consuming reconciliation

#### 🟢 **Low Priority Gaps**

5. **Crop Processing Workflows**
   - ⚠️ Generic processing exists
   - ❌ No crop-specific processing steps
   - **Impact**: Can use generic processing, but not optimized

### Gap Priority Matrix

| Gap | Priority | Impact | Effort | Recommendation |
|-----|----------|--------|--------|----------------|
| Crop aggregation | 🔴 **HIGH** | High | High | Implement crop collection system |
| Service delivery | 🔴 **HIGH** | Medium | Medium | Add service catalog and delivery tracking |
| Contract management | 🟡 **MEDIUM** | Low | Low | Enhance contract tracking |
| Automated reconciliation | 🟡 **MEDIUM** | Medium | Medium | Build reconciliation tools |
| Crop processing | 🟢 **LOW** | Low | Low | Extend existing processing |

---

## Implicit Concepts Requiring Explicit Implementation

### 1. Unified Aggregation Model

**Current State**: Milk aggregation is explicit, crop aggregation is implicit (via generic products)

**Required**: Abstract aggregation model that supports:
- Multiple product types (milk, crops, etc.)
- Unified collection workflow
- Product-specific quality testing
- Unified financial settlement

**Implementation Approach**:
```typescript
// Conceptual unified model:
interface Aggregation {
  type: 'MILK' | 'CROP' | 'OTHER'
  farmerId: string
  mccId: string
  collectionDate: Date
  quantity: number
  unit: string
  qualityTests: QualityTest[]
  deductions: Deductions
  advances: number
  netPayment: number
}
```

### 2. Service Catalog

**Current State**: Services are implicit (via asset rental only)

**Required**: Explicit service catalog with:
- Service definitions
- Service pricing
- Service delivery tracking
- Service fulfillment

**Implementation Approach**:
```typescript
// Conceptual service model:
interface Service {
  id: string
  name: string
  type: 'RENTAL' | 'DELIVERY' | 'CONSULTATION' | 'TRAINING'
  pricing: ServicePricing
  duration: number
  sla: ServiceLevelAgreement
}
```

### 3. Multi-Product Financial Settlement

**Current State**: Financial settlement is milk-specific

**Required**: Unified settlement model that works for:
- Milk collections
- Crop collections
- Other product types

**Implementation Approach**:
- Extend `mcc_payments` to support multiple collection types
- Or create unified `aggregation_payments` entity

### 4. Period-Based Aggregation (Multi-Product)

**Current State**: `mcc_periods` is milk-specific

**Required**: Unified period model for:
- Milk periods
- Crop periods
- Combined periods

**Implementation Approach**:
- Extend `mcc_periods` with `productType` field
- Or create unified `aggregation_periods` entity

---

## Recommendations

### Phase 1: Critical Gaps (High Priority)

1. **Implement Crop Aggregation**
   - Create `crop_collections` entity (similar to `milk_collections`)
   - Add `CROP` to `InventoryType` enum
   - Create `crop_periods` entity
   - Extend quality testing for crops

2. **Implement Service Delivery**
   - Create `services` catalog entity
   - Create `service_deliveries` tracking entity
   - Add service pricing model

### Phase 2: Medium Priority

3. **Enhance Contract Management**
   - Add contract terms tracking
   - Implement contract lifecycle management

4. **Build Reconciliation Tools**
   - Automated reconciliation algorithms
   - Reconciliation reports and dashboards

### Phase 3: Low Priority

5. **Optimize Crop Processing**
   - Crop-specific processing workflows
   - Crop processing templates

---

## Conclusion

### Alignment Summary

| Domain | Alignment Status | Key Findings |
|--------|-----------------|--------------|
| **MCC Milk Aggregation** | ✅ **FULLY ALIGNED** | Complete implementation, no gaps |
| **Financial Settlement & Deductions** | ✅ **FULLY ALIGNED** | Complete implementation, minor reconciliation gap |
| **Warehouse & Stock Movement** | ✅ **FULLY ALIGNED** | Complete implementation, excellent Odoo-style system |
| **Services & Asset Rental** | ⚠️ **PARTIAL** | Asset rental complete, service delivery missing |
| **Agriculture Aggregation (Crops)** | ❌ **NOT ALIGNED** | No explicit implementation, major gap |

### Next Steps

1. **Document Review**: Review this mapping with stakeholders
2. **Gap Prioritization**: Prioritize gaps based on business needs
3. **Implementation Planning**: Create implementation plan for critical gaps
4. **Domain Model Refinement**: Refine Amakusanyirizo domain model based on findings

---

**Document Status**: ✅ Complete - Domain Alignment Mapping
