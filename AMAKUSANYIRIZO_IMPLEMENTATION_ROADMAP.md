# Amakusanyirizo Implementation Roadmap

**Document Version:** 1.0  
**Date:** 2025-01-23  
**Purpose:** Comprehensive roadmap for implementing Amakusanyirizo (aggregation) system changes

---

## Executive Summary

Based on the domain mapping analysis, here are the **critical changes** needed to fully support Amakusanyirizo:

### Current Status

| Domain Area | Status | Completion |
|------------|--------|------------|
| **MCC Milk Aggregation** | ✅ Complete | 100% |
| **Financial Settlement** | ✅ Complete | 100% |
| **Warehouse & Stock Movement** | ✅ Complete | 100% |
| **Services & Asset Rental** | ⚠️ Partial | 60% |
| **Agriculture Aggregation (Crops)** | ❌ Missing | 0% |
| **Geo-Intelligence** | ✅ Just Implemented | 100% |

---

## Required Changes by Priority

### 🔴 **CRITICAL PRIORITY (Must Implement)**

#### 1. **Crop Aggregation System** 
**Status:** ❌ Not Implemented  
**Impact:** Cannot support crop aggregation workflows

**Required Changes:**

1. **Database Schema Extensions**
   ```prisma
   // Add to InventoryType enum
   enum InventoryType {
     MILK
     PHARMACY
     GENERAL
     CROP  // NEW
   }

   // Create crop_collections table
   model crop_collections {
     id              String   @id @default(cuid())
     farmerId        String
     mccId           String
     collectionDate  DateTime
     cropType        String   // maize, beans, coffee, etc.
     quantity        Float
     unit            String   // kg, bags, etc.
     qualityTests    Json?    // moisture, grade, etc.
     pricePerUnit    Float
     totalAmount     Float
     deductions      Json     @default("{}")
     advances        Float    @default(0)
     totalDeductions Float    @default(0)
     netPayment      Float    @default(0)
     status          CropCollectionStatus @default(PENDING)
     warehouseId     String?
     locationId      String?
     productId       String?
     stockMoveId     String?
     createdAt       DateTime @default(now())
     updatedAt       DateTime @updatedAt
     
     farmer          farmers  @relation(fields: [farmerId], references: [id])
     mcc             mccs     @relation(fields: [mccId], references: [id])
     warehouse       Warehouse? @relation(fields: [warehouseId], references: [id])
     location        Location? @relation(fields: [locationId], references: [id])
     product         products? @relation(fields: [productId], references: [id])
     stockMove       StockMove? @relation(fields: [stockMoveId], references: [id])
     
     @@index([farmerId])
     @@index([mccId])
     @@index([collectionDate])
     @@index([status])
   }

   enum CropCollectionStatus {
     PENDING
     APPROVED
     PAID
     PROCESSED
     REJECTED
   }

   // Create crop_periods table
   model crop_periods {
     id              String   @id @default(cuid())
     mccId           String
     periodNumber    Int
     startDate       DateTime
     endDate         DateTime
     totalFarmers    Int      @default(0)
     totalQuantity   Float    @default(0)
     totalAmount     Float    @default(0)
     totalDeductions Float    @default(0)
     totalAdvances   Float    @default(0)
     status          String   @default("ACTIVE")
     createdAt       DateTime @default(now())
     updatedAt       DateTime @updatedAt
     
     mcc             mccs     @relation(fields: [mccId], references: [id])
     collections     crop_collections[]
     
     @@index([mccId])
     @@index([periodNumber])
   }

   // Create crop_types table
   model crop_types {
     id                String   @id @default(cuid())
     name              String
     code              String   @unique
     unitOfMeasure     String   // kg, bags, etc.
     qualityStandards  Json?    // grading rules
     defaultPricePerUnit Float
     isActive          Boolean  @default(true)
     createdAt         DateTime @default(now())
     updatedAt         DateTime @updatedAt
     
     @@index([code])
   }
   ```

2. **Service Layer**
   - Create `CropCollectionService` (similar to `MilkCollectionService`)
   - Implement crop quality validation
   - Integrate with inventory system
   - Extend financial settlement for crops

3. **API Routes**
   - `POST /api/v1/mcc/crops/collections` - Record crop collection
   - `GET /api/v1/mcc/crops/collections` - List crop collections
   - `POST /api/v1/mcc/crops/periods` - Create crop period
   - `GET /api/v1/mcc/crops/types` - List crop types

4. **UI Components**
   - Crop collection form
   - Crop quality testing interface
   - Crop aggregation dashboard
   - Crop period management

**Estimated Effort:** 3-4 weeks

---

#### 2. **Service Delivery System**
**Status:** ❌ Not Implemented  
**Impact:** Limited to asset rental only, no service delivery tracking

**Required Changes:**

1. **Database Schema Extensions**
   ```prisma
   // Create services catalog
   model services {
     id          String   @id @default(cuid())
     name        String
     code        String   @unique
     type        ServiceType
     description String?
     pricing     Json     // { type: 'FIXED' | 'HOURLY' | 'USAGE', amount: number }
     duration    Int?     // in hours
     sla         Json?    // Service Level Agreement
     isActive    Boolean  @default(true)
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
     
     deliveries  service_deliveries[]
     
     @@index([code])
     @@index([type])
   }

   enum ServiceType {
     RENTAL
     DELIVERY
     CONSULTATION
     TRAINING
     MAINTENANCE
     OTHER
   }

   // Create service_deliveries table
   model service_deliveries {
     id            String   @id @default(cuid())
     serviceId     String
     farmerId      String?
     mccId         String?
     requestedBy   String
     scheduledDate DateTime
     completedDate DateTime?
     status        ServiceDeliveryStatus @default(SCHEDULED)
     notes         String?
     cost          Float?
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt
     
     service       services @relation(fields: [serviceId], references: [id])
     farmer        farmers? @relation(fields: [farmerId], references: [id])
     mcc           mccs?    @relation(fields: [mccId], references: [id])
     requestedByUser User   @relation(fields: [requestedBy], references: [id])
     
     @@index([serviceId])
     @@index([farmerId])
     @@index([mccId])
     @@index([status])
   }

   enum ServiceDeliveryStatus {
     SCHEDULED
     IN_PROGRESS
     COMPLETED
     CANCELLED
   }
   ```

2. **Service Layer**
   - Create `ServiceDeliveryService`
   - Implement service catalog management
   - Track service fulfillment
   - Integrate with payment system

3. **API Routes**
   - `GET /api/v1/services` - List services
   - `POST /api/v1/services/deliveries` - Request service delivery
   - `GET /api/v1/services/deliveries` - List service deliveries
   - `PUT /api/v1/services/deliveries/[id]/complete` - Complete service

4. **UI Components**
   - Service catalog browser
   - Service request form
   - Service delivery tracking
   - Service fulfillment dashboard

**Estimated Effort:** 2-3 weeks

---

### 🟡 **MEDIUM PRIORITY (Should Implement)**

#### 3. **Enhanced Contract Management**
**Status:** ⚠️ Partial (only file reference)  
**Impact:** Manual contract management

**Required Changes:**

1. **Database Schema Extensions**
   ```prisma
   // Enhance rentals table
   model rentals {
     // ... existing fields ...
     
     // NEW fields
     contractTerms    Json?    // Contract terms and conditions
     contractStart    DateTime?
     contractEnd      DateTime?
     autoRenew        Boolean  @default(false)
     renewalPeriod    Int?     // in days
     contractStatus   ContractStatus @default(ACTIVE)
     signedBy         String?
     signedAt         DateTime?
     contractVersion  Int      @default(1)
   }

   enum ContractStatus {
     DRAFT
     ACTIVE
     EXPIRED
     TERMINATED
     RENEWED
   }
   ```

2. **Service Layer**
   - Contract lifecycle management
   - Auto-renewal logic
   - Contract versioning
   - Contract terms tracking

**Estimated Effort:** 1 week

---

#### 4. **Automated Reconciliation Tools**
**Status:** ⚠️ Manual process  
**Impact:** Time-consuming reconciliation

**Required Changes:**

1. **Service Layer**
   - Create `ReconciliationService`
   - Automated reconciliation algorithms
   - Discrepancy detection
   - Reconciliation reports

2. **API Routes**
   - `POST /api/v1/mcc/reconciliation/run` - Run reconciliation
   - `GET /api/v1/mcc/reconciliation/reports` - Get reconciliation reports
   - `GET /api/v1/mcc/reconciliation/discrepancies` - List discrepancies

3. **UI Components**
   - Reconciliation dashboard
   - Discrepancy resolution interface
   - Reconciliation reports viewer

**Estimated Effort:** 2 weeks

---

### 🟢 **LOW PRIORITY (Nice to Have)**

#### 5. **Crop Processing Workflows**
**Status:** ⚠️ Generic processing exists  
**Impact:** Can use generic processing, but not optimized

**Required Changes:**

1. **Database Schema Extensions**
   ```prisma
   // Create crop_processing table
   model crop_processing {
     id                String   @id @default(cuid())
     mccId             String
     rawCropProductId  String
     processedProductId String
     inputQuantity     Float
     outputQuantity    Float
     processingDate    DateTime
     processingSteps   Json     @default("{}")
     qualityMetrics    Json     @default("{}")
     status            String   @default("PENDING")
     createdAt         DateTime @default(now())
     updatedAt         DateTime @updatedAt
     
     mcc               mccs     @relation(fields: [mccId], references: [id])
     rawProduct        products @relation("CropProcessingRaw", fields: [rawCropProductId], references: [id])
     processedProduct  products @relation("CropProcessingProcessed", fields: [processedProductId], references: [id])
     
     @@index([mccId])
   }
   ```

2. **Service Layer**
   - Crop-specific processing workflows
   - Crop processing templates
   - Quality metrics for processed crops

**Estimated Effort:** 1-2 weeks

---

## Integration with Geo-Intelligence

### ✅ **Already Implemented**
- Geo-location capture for farmers, agents, MCCs, warehouses
- Distance calculations (Haversine formula)
- Distance bands (0-2km, 2-5km, 5-10km, >10km)
- Map visualization
- Geo-intelligence dashboard widgets

### 🔄 **Enhancements Needed**

1. **Geo-Aware Sourcing Intelligence**
   - Route optimization for collection agents
   - Proximity-based farmer assignment
   - Distance-based pricing adjustments
   - Coverage analysis

2. **Geo-Intelligence for Crops**
   - Crop collection route planning
   - Farmer-to-MCC distance for crops
   - Crop warehouse location optimization

**Estimated Effort:** 1-2 weeks

---

## Implementation Phases

### **Phase 1: Critical Gaps (6-7 weeks)**
1. Crop Aggregation System (3-4 weeks)
2. Service Delivery System (2-3 weeks)

### **Phase 2: Medium Priority (3 weeks)**
3. Enhanced Contract Management (1 week)
4. Automated Reconciliation Tools (2 weeks)

### **Phase 3: Low Priority (2-3 weeks)**
5. Crop Processing Workflows (1-2 weeks)
6. Geo-Intelligence Enhancements (1 week)

---

## Summary of Changes

### Database Changes
- ✅ Add `CROP` to `InventoryType` enum
- ✅ Create `crop_collections` table
- ✅ Create `crop_periods` table
- ✅ Create `crop_types` table
- ✅ Create `services` catalog table
- ✅ Create `service_deliveries` table
- ✅ Enhance `rentals` table with contract fields
- ✅ Create `crop_processing` table (optional)

### Service Layer Changes
- ✅ Create `CropCollectionService`
- ✅ Create `ServiceDeliveryService`
- ✅ Create `ReconciliationService`
- ✅ Enhance contract management logic
- ✅ Extend geo-intelligence calculations

### API Changes
- ✅ Add crop collection endpoints
- ✅ Add service delivery endpoints
- ✅ Add reconciliation endpoints
- ✅ Enhance existing endpoints for multi-product support

### UI Changes
- ✅ Crop collection forms and dashboards
- ✅ Service catalog and delivery tracking
- ✅ Reconciliation tools and reports
- ✅ Enhanced geo-intelligence features

---

## Next Steps

1. **Review & Prioritize**: Review this roadmap with stakeholders
2. **Phase 1 Planning**: Create detailed implementation plan for Phase 1
3. **Database Migration**: Prepare migration scripts for Phase 1
4. **Service Development**: Start with `CropCollectionService`
5. **UI Development**: Build crop collection interfaces
6. **Testing**: Comprehensive testing of new features
7. **Documentation**: Update system documentation

---

**Status**: 📋 Ready for Implementation Planning
