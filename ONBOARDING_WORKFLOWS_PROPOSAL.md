# Onboarding Workflows Standardization Proposal

**Document Version:** 1.0  
**Date:** 2025-01-XX  
**Purpose:** Standardize onboarding flows for all entities before adding geo-data

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Proposed Standardization](#proposed-standardization)
4. [Entity-Specific Proposals](#entity-specific-proposals)
5. [Implementation Plan](#implementation-plan)
6. [Database Schema Changes](#database-schema-changes)
7. [Code Generation Standards](#code-generation-standards)
8. [Consent Management](#consent-management)

---

## Executive Summary

This document proposes standardization of onboarding workflows for:
- **Farmers**
- **Abacunda / Agents (Field Agents)**
- **MCCs (Milk Collection Centers)**
- **Warehouses**
- **Customers**
- **Suppliers**

### Standard Requirements

Each onboarding flow must:
1. ✅ **Create a unique code** - Automatic generation if not provided
2. ✅ **Automatically create a ledger account** - For entities that require financial tracking
3. ✅ **Capture consent flags** - Data privacy and service consent tracking

### Current Status

| Entity | Unique Code | Ledger Account | Consent Flags | Status |
|--------|------------|----------------|---------------|--------|
| **Farmers** | ❌ Missing | ⚠️ Partial (manual) | ❌ Missing | 🔴 **Needs Work** |
| **Agents** | ❌ Missing | ⚠️ Partial (wallet) | ❌ Missing | 🔴 **Needs Work** |
| **MCCs** | ⚠️ Optional | ❌ Not Applicable | ❌ Missing | 🟡 **Partial** |
| **Warehouses** | ✅ Auto-gen | ❌ Not Applicable | ❌ Missing | 🟡 **Partial** |
| **Customers** | ❌ Missing | ❌ Missing | ❌ Missing | 🔴 **Needs Work** |
| **Suppliers** | ❌ Missing | ❌ Missing | ❌ Missing | 🔴 **Needs Work** |

---

## Current State Analysis

### 1. Farmers

**Current Implementation:**
- **Location**: `lib/services/MCCInventoryService.ts::createFarmer()`
- **API**: `POST /api/v1/mcc/farmers`
- **Code Generation**: ❌ **NOT IMPLEMENTED**
  - `farmerCode` field exists in schema but is optional
  - No automatic generation logic
- **Account Creation**: ⚠️ **PARTIAL**
  - `farmer_accounts` created manually in `MilkCollectionService.updateFarmerAccount()`
  - Not created during onboarding
- **Consent Flags**: ❌ **NOT IMPLEMENTED**
  - No consent fields in schema

**Current Code:**
```typescript
// lib/services/MCCInventoryService.ts
static async createFarmer(data: FarmerData) {
  const farmer = await prisma.farmers.create({
    data: {
      mccId: data.mccId,
      name: data.name,
      phone: data.phone,
      location: fullLocation,
      isActive: true
      // ❌ No farmerCode generation
      // ❌ No account creation
      // ❌ No consent flags
    }
  })
  return farmer
}
```

### 2. Abacunda / Agents (Field Agents)

**Current Implementation:**
- **Location**: `app/api/v1/users/register/route.ts` (general user registration)
- **Code Generation**: ❌ **NOT IMPLEMENTED**
  - No agent-specific code field
  - Agents are users with `FIELD_AGENT` role
- **Account Creation**: ⚠️ **PARTIAL**
  - Users can have `Wallet` (general) but not agent-specific account
  - No ledger account for agents
- **Consent Flags**: ❌ **NOT IMPLEMENTED**
  - No consent fields in User schema

**Current Code:**
```typescript
// app/api/v1/users/register/route.ts
const user = await prisma.user.create({
  data: {
    email, name, phone, password,
    isActive: true
    // ❌ No agentCode generation
    // ❌ No agent account creation
    // ❌ No consent flags
  }
})
```

### 3. MCCs

**Current Implementation:**
- **Location**: `app/api/v1/mcc/setup/route.ts`
- **Code Generation**: ⚠️ **OPTIONAL**
  - `code` field exists but is optional
  - Can be provided or left undefined
  - No automatic generation if not provided
- **Account Creation**: ❌ **NOT APPLICABLE**
  - MCCs don't have ledger accounts (they manage farmer accounts)
- **Consent Flags**: ❌ **NOT IMPLEMENTED**
  - No consent fields in schema

**Current Code:**
```typescript
// app/api/v1/mcc/setup/route.ts
const mcc = await prisma.mccs.create({
  data: {
    name: mccData.name,
    code: mccData.code || undefined, // ⚠️ Optional, no auto-generation
    location: mccData.location,
    // ❌ No consent flags
  }
})
```

### 4. Warehouses

**Current Implementation:**
- **Location**: `app/api/v1/inventory/warehouses/route.ts`
- **Code Generation**: ✅ **IMPLEMENTED**
  - `generateWarehouseCode()` function exists
  - Auto-generates if not provided (WH001, WH002, etc.)
- **Account Creation**: ❌ **NOT APPLICABLE**
  - Warehouses don't have ledger accounts
- **Consent Flags**: ❌ **NOT IMPLEMENTED**
  - No consent fields in schema

**Current Code:**
```typescript
// app/api/v1/inventory/warehouses/route.ts
let warehouseCode = code
if (!warehouseCode) {
  warehouseCode = await generateWarehouseCode() // ✅ Auto-generation
}
// ❌ No consent flags
```

### 5. Customers

**Current Implementation:**
- **Location**: `app/api/v1/mcc/customers/route.ts`
- **Code Generation**: ❌ **NOT IMPLEMENTED**
  - No code field in `mcc_customers` schema
- **Account Creation**: ❌ **NOT IMPLEMENTED**
  - No customer account or ledger
- **Consent Flags**: ❌ **NOT IMPLEMENTED**
  - No consent fields in schema

**Current Code:**
```typescript
// app/api/v1/mcc/customers/route.ts
const customer = await prisma.mcc_customers.create({
  data: {
    mccId, name, contact, email, address
    // ❌ No customerCode generation
    // ❌ No account creation
    // ❌ No consent flags
  }
})
```

### 6. Suppliers

**Current Implementation:**
- **Location**: `app/api/v1/mcc/suppliers/route.ts`
- **Code Generation**: ❌ **NOT IMPLEMENTED**
  - No code field in `suppliers` schema
- **Account Creation**: ❌ **NOT IMPLEMENTED**
  - No supplier account or ledger
- **Consent Flags**: ❌ **NOT IMPLEMENTED**
  - No consent fields in schema

**Current Code:**
```typescript
// app/api/v1/mcc/suppliers/route.ts
const supplier = await prisma.suppliers.create({
  data: {
    name, phone, email, address
    // ❌ No supplierCode generation
    // ❌ No account creation
    // ❌ No consent flags
  }
})
```

---

## Proposed Standardization

### Standard Onboarding Workflow

```
1. Validate Input Data
   ↓
2. Generate Unique Code (if not provided)
   ↓
3. Create Entity Record
   ↓
4. Create Ledger Account (if applicable)
   ↓
5. Capture Consent Flags
   ↓
6. Return Created Entity with Code & Account
```

### Standard Code Format

| Entity | Format | Example | Pattern |
|--------|--------|---------|---------|
| **Farmer** | `FARM-{MCC_CODE}-{SEQUENCE}` | `FARM-MCC001-0001` | MCC prefix + sequence |
| **Agent** | `AGENT-{MCC_CODE}-{SEQUENCE}` | `AGENT-MCC001-0001` | MCC prefix + sequence |
| **MCC** | `MCC-{REGION}-{SEQUENCE}` | `MCC-KIGALI-001` | Region prefix + sequence |
| **Warehouse** | `WH{SEQUENCE}` | `WH001` | ✅ Already implemented |
| **Customer** | `CUST-{MCC_CODE}-{SEQUENCE}` | `CUST-MCC001-0001` | MCC prefix + sequence |
| **Supplier** | `SUPP-{SEQUENCE}` | `SUPP0001` | Global sequence |

### Standard Ledger Account Creation

**Entities Requiring Ledger Accounts:**
- ✅ **Farmers** → `farmer_accounts` (already exists)
- ✅ **Agents** → `agent_accounts` (NEW - to be created)
- ❌ **MCCs** → Not applicable (they manage accounts)
- ❌ **Warehouses** → Not applicable (inventory only)
- ✅ **Customers** → `customer_accounts` (NEW - to be created)
- ✅ **Suppliers** → `supplier_accounts` (NEW - to be created)

### Standard Consent Flags

**Consent Types:**
1. **dataProcessingConsent** (Boolean) - GDPR/data processing consent
2. **marketingConsent** (Boolean) - Marketing communications
3. **smsConsent** (Boolean) - SMS notifications
4. **emailConsent** (Boolean) - Email notifications
5. **financialConsent** (Boolean) - Financial data sharing
6. **consentDate** (DateTime) - When consent was given
7. **consentVersion** (String) - Version of consent terms

---

## Entity-Specific Proposals

### 1. Farmers

#### Proposed Changes

**1. Code Generation**
```typescript
// Generate farmer code: FARM-{MCC_CODE}-{SEQUENCE}
async function generateFarmerCode(mccId: string): Promise<string> {
  const mcc = await prisma.mccs.findUnique({ where: { id: mccId }, select: { code: true } })
  const mccCode = mcc?.code || mccId.substring(0, 6).toUpperCase()
  
  // Get last farmer code for this MCC
  const lastFarmer = await prisma.farmers.findFirst({
    where: { mccId, farmerCode: { startsWith: `FARM-${mccCode}-` } },
    orderBy: { farmerCode: 'desc' }
  })
  
  let sequence = 1
  if (lastFarmer?.farmerCode) {
    const lastSeq = parseInt(lastFarmer.farmerCode.split('-').pop() || '0')
    sequence = lastSeq + 1
  }
  
  return `FARM-${mccCode}-${sequence.toString().padStart(4, '0')}`
}
```

**2. Automatic Account Creation**
```typescript
// Create farmer_accounts automatically during onboarding
const farmer = await prisma.farmers.create({
  data: {
    mccId, name, phone, location,
    farmerCode: await generateFarmerCode(mccId),
    isActive: true
  }
})

// Automatically create account
await prisma.farmer_accounts.create({
  data: {
    farmerId: farmer.id,
    balance: 0
  }
})
```

**3. Consent Flags**
```typescript
// Add to farmers schema
consentFlags: {
  dataProcessingConsent: Boolean @default(false)
  marketingConsent: Boolean @default(false)
  smsConsent: Boolean @default(false)
  emailConsent: Boolean @default(false)
  financialConsent: Boolean @default(false)
  consentDate: DateTime?
  consentVersion: String?
}
```

#### Updated Onboarding Flow

```typescript
static async createFarmer(data: FarmerData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Generate farmer code
    const farmerCode = data.farmerCode || await generateFarmerCode(data.mccId)
    
    // 2. Create farmer
    const farmer = await tx.farmers.create({
      data: {
        mccId: data.mccId,
        name: data.name,
        phone: data.phone,
        location: fullLocation,
        farmerCode, // ✅ Auto-generated
        isActive: true,
        // ✅ Consent flags
        dataProcessingConsent: data.consentFlags?.dataProcessingConsent || false,
        marketingConsent: data.consentFlags?.marketingConsent || false,
        smsConsent: data.consentFlags?.smsConsent || false,
        emailConsent: data.consentFlags?.emailConsent || false,
        financialConsent: data.consentFlags?.financialConsent || false,
        consentDate: data.consentFlags ? new Date() : null,
        consentVersion: data.consentFlags ? "1.0" : null,
      }
    })
    
    // 3. Create farmer account automatically
    await tx.farmer_accounts.create({
      data: {
        farmerId: farmer.id,
        balance: 0
      }
    })
    
    return farmer
  })
}
```

---

### 2. Abacunda / Agents (Field Agents)

#### Proposed Changes

**1. Code Generation**
```typescript
// Generate agent code: AGENT-{MCC_CODE}-{SEQUENCE}
async function generateAgentCode(mccId?: string): Promise<string> {
  const prefix = mccId ? await getMCCCode(mccId) : "GLOBAL"
  
  const lastAgent = await prisma.user.findFirst({
    where: {
      role: "FIELD_AGENT",
      agentCode: { startsWith: `AGENT-${prefix}-` }
    },
    orderBy: { agentCode: 'desc' }
  })
  
  let sequence = 1
  if (lastAgent?.agentCode) {
    const lastSeq = parseInt(lastAgent.agentCode.split('-').pop() || '0')
    sequence = lastSeq + 1
  }
  
  return `AGENT-${prefix}-${sequence.toString().padStart(4, '0')}`
}
```

**2. Agent Account Creation**
```typescript
// NEW: agent_accounts table
model agent_accounts {
  id          String   @id @default(cuid())
  agentId     String   @unique
  balance     Float    @default(0)
  lastUpdated DateTime @default(now())
  agent       User     @relation(fields: [agentId], references: [id])
}
```

**3. Consent Flags**
```typescript
// Add to User schema (for agents)
agentCode: String? @unique
agentConsentFlags: Json? // Store consent flags as JSON
```

#### Updated Onboarding Flow

```typescript
// For FIELD_AGENT role registration
const user = await prisma.user.create({
  data: {
    email, name, phone, password,
    role: "FIELD_AGENT",
    agentCode: await generateAgentCode(mccId), // ✅ Auto-generated
    agentConsentFlags: {
      dataProcessingConsent: data.consentFlags?.dataProcessingConsent || false,
      marketingConsent: data.consentFlags?.marketingConsent || false,
      smsConsent: data.consentFlags?.smsConsent || false,
      emailConsent: data.consentFlags?.emailConsent || false,
      consentDate: data.consentFlags ? new Date() : null,
      consentVersion: data.consentFlags ? "1.0" : null,
    }
  }
})

// Create agent account
await prisma.agent_accounts.create({
  data: {
    agentId: user.id,
    balance: 0
  }
})
```

---

### 3. MCCs

#### Proposed Changes

**1. Code Generation (Make Mandatory)**
```typescript
// Generate MCC code: MCC-{REGION}-{SEQUENCE}
async function generateMCCCode(region?: string): Promise<string> {
  const regionCode = (region || "GLOBAL").toUpperCase().substring(0, 6)
  
  const lastMCC = await prisma.mccs.findFirst({
    where: { code: { startsWith: `MCC-${regionCode}-` } },
    orderBy: { code: 'desc' }
  })
  
  let sequence = 1
  if (lastMCC?.code) {
    const lastSeq = parseInt(lastMCC.code.split('-').pop() || '0')
    sequence = lastSeq + 1
  }
  
  return `MCC-${regionCode}-${sequence.toString().padStart(3, '0')}`
}
```

**2. Consent Flags**
```typescript
// Add to mccs schema
consentFlags: Json? // Store consent flags as JSON
```

#### Updated Onboarding Flow

```typescript
const mcc = await prisma.mccs.create({
  data: {
    name: mccData.name,
    code: mccData.code || await generateMCCCode(mccData.region), // ✅ Auto-generated
    location: mccData.location,
    region: mccData.region,
    consentFlags: {
      dataProcessingConsent: data.consentFlags?.dataProcessingConsent || false,
      marketingConsent: data.consentFlags?.marketingConsent || false,
      smsConsent: data.consentFlags?.smsConsent || false,
      emailConsent: data.consentFlags?.emailConsent || false,
      consentDate: data.consentFlags ? new Date() : null,
      consentVersion: data.consentFlags ? "1.0" : null,
    }
  }
})
```

---

### 4. Warehouses

#### Proposed Changes

**1. Code Generation**
- ✅ **Already implemented** - `generateWarehouseCode()` exists
- ✅ Keep existing implementation

**2. Consent Flags**
```typescript
// Add to Warehouse schema
consentFlags: Json? // Store consent flags as JSON
```

#### Updated Onboarding Flow

```typescript
// Keep existing code generation
let warehouseCode = code
if (!warehouseCode) {
  warehouseCode = await generateWarehouseCode() // ✅ Already implemented
}

const warehouse = await prisma.warehouse.create({
  data: {
    name, code: warehouseCode,
    // ✅ Add consent flags
    consentFlags: {
      dataProcessingConsent: data.consentFlags?.dataProcessingConsent || false,
      consentDate: data.consentFlags ? new Date() : null,
      consentVersion: data.consentFlags ? "1.0" : null,
    }
  }
})
```

---

### 5. Customers

#### Proposed Changes

**1. Code Generation**
```typescript
// Generate customer code: CUST-{MCC_CODE}-{SEQUENCE}
async function generateCustomerCode(mccId: string): Promise<string> {
  const mcc = await prisma.mccs.findUnique({ where: { id: mccId }, select: { code: true } })
  const mccCode = mcc?.code || mccId.substring(0, 6).toUpperCase()
  
  const lastCustomer = await prisma.mcc_customers.findFirst({
    where: { mccId, customerCode: { startsWith: `CUST-${mccCode}-` } },
    orderBy: { customerCode: 'desc' }
  })
  
  let sequence = 1
  if (lastCustomer?.customerCode) {
    const lastSeq = parseInt(lastCustomer.customerCode.split('-').pop() || '0')
    sequence = lastSeq + 1
  }
  
  return `CUST-${mccCode}-${sequence.toString().padStart(4, '0')}`
}
```

**2. Customer Account Creation**
```typescript
// NEW: customer_accounts table
model customer_accounts {
  id          String        @id @default(cuid())
  customerId  String        @unique
  balance     Float         @default(0)
  creditLimit Float         @default(0)
  lastUpdated DateTime      @default(now())
  customer    mcc_customers @relation(fields: [customerId], references: [id])
}
```

**3. Consent Flags**
```typescript
// Add to mcc_customers schema
customerCode: String? @unique
consentFlags: Json?
```

#### Updated Onboarding Flow

```typescript
const customer = await prisma.mcc_customers.create({
  data: {
    mccId,
    name, contact, email, address,
    customerCode: await generateCustomerCode(mccId), // ✅ Auto-generated
    consentFlags: {
      dataProcessingConsent: data.consentFlags?.dataProcessingConsent || false,
      marketingConsent: data.consentFlags?.marketingConsent || false,
      smsConsent: data.consentFlags?.smsConsent || false,
      emailConsent: data.consentFlags?.emailConsent || false,
      consentDate: data.consentFlags ? new Date() : null,
      consentVersion: data.consentFlags ? "1.0" : null,
    }
  }
})

// Create customer account
await prisma.customer_accounts.create({
  data: {
    customerId: customer.id,
    balance: 0,
    creditLimit: 0
  }
})
```

---

### 6. Suppliers

#### Proposed Changes

**1. Code Generation**
```typescript
// Generate supplier code: SUPP-{SEQUENCE}
async function generateSupplierCode(): Promise<string> {
  const lastSupplier = await prisma.suppliers.findFirst({
    where: { supplierCode: { startsWith: 'SUPP-' } },
    orderBy: { supplierCode: 'desc' }
  })
  
  let sequence = 1
  if (lastSupplier?.supplierCode) {
    const lastSeq = parseInt(lastSupplier.supplierCode.replace('SUPP-', '') || '0')
    sequence = lastSeq + 1
  }
  
  return `SUPP-${sequence.toString().padStart(4, '0')}`
}
```

**2. Supplier Account Creation**
```typescript
// NEW: supplier_accounts table
model supplier_accounts {
  id          String     @id @default(cuid())
  supplierId  String     @unique
  balance     Float      @default(0)
  creditLimit Float      @default(0)
  lastUpdated DateTime   @default(now())
  supplier    suppliers  @relation(fields: [supplierId], references: [id])
}
```

**3. Consent Flags**
```typescript
// Add to suppliers schema
supplierCode: String? @unique
consentFlags: Json?
```

#### Updated Onboarding Flow

```typescript
const supplier = await prisma.suppliers.create({
  data: {
    name, phone, email, address,
    supplierCode: await generateSupplierCode(), // ✅ Auto-generated
    consentFlags: {
      dataProcessingConsent: data.consentFlags?.dataProcessingConsent || false,
      marketingConsent: data.consentFlags?.marketingConsent || false,
      smsConsent: data.consentFlags?.smsConsent || false,
      emailConsent: data.consentFlags?.emailConsent || false,
      consentDate: data.consentFlags ? new Date() : null,
      consentVersion: data.consentFlags ? "1.0" : null,
    }
  }
})

// Create supplier account
await prisma.supplier_accounts.create({
  data: {
    supplierId: supplier.id,
    balance: 0,
    creditLimit: 0
  }
})
```

---

## Implementation Plan

### Phase 1: Database Schema Changes

**1.1 Add Code Fields**
- ✅ `farmers.farmerCode` - Already exists, make mandatory
- ❌ `users.agentCode` - NEW field for agents
- ✅ `mccs.code` - Already exists, make mandatory
- ✅ `warehouses.code` - Already exists
- ❌ `mcc_customers.customerCode` - NEW field
- ❌ `suppliers.supplierCode` - NEW field

**1.2 Add Consent Flags**
- ❌ `farmers.consentFlags` - NEW JSON field
- ❌ `users.agentConsentFlags` - NEW JSON field
- ❌ `mccs.consentFlags` - NEW JSON field
- ❌ `warehouses.consentFlags` - NEW JSON field
- ❌ `mcc_customers.consentFlags` - NEW JSON field
- ❌ `suppliers.consentFlags` - NEW JSON field

**1.3 Create New Account Tables**
- ❌ `agent_accounts` - NEW table
- ❌ `customer_accounts` - NEW table
- ❌ `supplier_accounts` - NEW table

### Phase 2: Code Generation Utilities

**2.1 Create Code Generation Functions**
- `lib/utils/code-generators.ts`
  - `generateFarmerCode(mccId: string): Promise<string>`
  - `generateAgentCode(mccId?: string): Promise<string>`
  - `generateMCCCode(region?: string): Promise<string>`
  - `generateCustomerCode(mccId: string): Promise<string>`
  - `generateSupplierCode(): Promise<string>`
  - `generateWarehouseCode(): Promise<string>` (already exists, move here)

### Phase 3: Update Onboarding Services

**3.1 Update Existing Services**
- `lib/services/MCCInventoryService.ts::createFarmer()` - Add code gen, account creation, consent
- `app/api/v1/mcc/setup/route.ts` - Add code gen, consent
- `app/api/v1/inventory/warehouses/route.ts` - Add consent
- `app/api/v1/mcc/customers/route.ts` - Add code gen, account creation, consent
- `app/api/v1/mcc/suppliers/route.ts` - Add code gen, account creation, consent

**3.2 Update User Registration**
- `app/api/v1/users/register/route.ts` - Add agent code gen, account creation, consent for FIELD_AGENT role

### Phase 4: Testing & Validation

**4.1 Unit Tests**
- Test code generation functions
- Test account creation
- Test consent flag capture

**4.2 Integration Tests**
- Test complete onboarding flows
- Test transaction rollback on errors

---

## Database Schema Changes

### Prisma Schema Updates

```prisma
// 1. Update farmers model
model farmers {
  // ... existing fields ...
  farmerCode              String?                   @unique // Make mandatory in code
  consentFlags            Json?                     // NEW
  
  // ... rest of fields ...
}

// 2. Update User model (for agents)
model User {
  // ... existing fields ...
  agentCode               String?                   @unique // NEW
  agentConsentFlags       Json?                     // NEW
  
  // ... rest of fields ...
  agent_account           agent_accounts?          // NEW relation
}

// 3. Update mccs model
model mccs {
  // ... existing fields ...
  code                    String?                   @unique // Make mandatory in code
  consentFlags            Json?                     // NEW
  
  // ... rest of fields ...
}

// 4. Update Warehouse model
model Warehouse {
  // ... existing fields ...
  consentFlags            Json?                     // NEW
  
  // ... rest of fields ...
}

// 5. Update mcc_customers model
model mcc_customers {
  // ... existing fields ...
  customerCode            String?                   @unique // NEW
  consentFlags            Json?                     // NEW
  
  // ... rest of fields ...
  customer_account        customer_accounts?       // NEW relation
}

// 6. Update suppliers model
model suppliers {
  // ... existing fields ...
  supplierCode            String?                   @unique // NEW
  consentFlags            Json?                     // NEW
  
  // ... rest of fields ...
  supplier_account        supplier_accounts?       // NEW relation
}

// 7. NEW: agent_accounts model
model agent_accounts {
  id          String   @id @default(cuid())
  agentId     String   @unique
  balance     Float    @default(0)
  lastUpdated DateTime @default(now())
  agent       User     @relation(fields: [agentId], references: [id])
  
  @@map("agent_accounts")
}

// 8. NEW: customer_accounts model
model customer_accounts {
  id          String        @id @default(cuid())
  customerId  String        @unique
  balance     Float         @default(0)
  creditLimit Float         @default(0)
  lastUpdated DateTime      @default(now())
  customer    mcc_customers @relation(fields: [customerId], references: [id])
  
  @@map("customer_accounts")
}

// 9. NEW: supplier_accounts model
model supplier_accounts {
  id          String     @id @default(cuid())
  supplierId  String     @unique
  balance     Float      @default(0)
  creditLimit Float      @default(0)
  lastUpdated DateTime   @default(now())
  supplier    suppliers  @relation(fields: [supplierId], references: [id])
  
  @@map("supplier_accounts")
}
```

---

## Code Generation Standards

### Code Format Specifications

| Entity | Format | Example | Uniqueness Scope |
|--------|--------|---------|------------------|
| **Farmer** | `FARM-{MCC_CODE}-{SEQUENCE}` | `FARM-MCC001-0001` | Per MCC |
| **Agent** | `AGENT-{MCC_CODE}-{SEQUENCE}` | `AGENT-MCC001-0001` | Per MCC (or global) |
| **MCC** | `MCC-{REGION}-{SEQUENCE}` | `MCC-KIGALI-001` | Per Region |
| **Warehouse** | `WH{SEQUENCE}` | `WH001` | Global |
| **Customer** | `CUST-{MCC_CODE}-{SEQUENCE}` | `CUST-MCC001-0001` | Per MCC |
| **Supplier** | `SUPP-{SEQUENCE}` | `SUPP0001` | Global |

### Code Generation Rules

1. **Uniqueness**: All codes must be unique within their scope
2. **Format**: Consistent format per entity type
3. **Sequential**: Sequential numbering within scope
4. **Case**: Uppercase for readability
5. **Length**: Reasonable length (max 20 characters)
6. **Validation**: Validate format before saving

### Implementation Location

**File**: `lib/utils/code-generators.ts`

```typescript
export class CodeGenerator {
  static async generateFarmerCode(mccId: string): Promise<string> { ... }
  static async generateAgentCode(mccId?: string): Promise<string> { ... }
  static async generateMCCCode(region?: string): Promise<string> { ... }
  static async generateCustomerCode(mccId: string): Promise<string> { ... }
  static async generateSupplierCode(): Promise<string> { ... }
  static async generateWarehouseCode(): Promise<string> { ... }
}
```

---

## Consent Management

### Consent Flag Structure

```typescript
interface ConsentFlags {
  dataProcessingConsent: boolean    // Required for GDPR compliance
  marketingConsent?: boolean         // Optional marketing communications
  smsConsent?: boolean               // SMS notifications
  emailConsent?: boolean             // Email notifications
  financialConsent?: boolean         // Financial data sharing
  consentDate?: Date                 // When consent was given
  consentVersion?: string            // Version of consent terms
}
```

### Consent Storage

- **Storage**: JSON field in each entity table
- **Default**: All flags default to `false`
- **Required**: `dataProcessingConsent` should be required for onboarding
- **Versioning**: Track consent version for compliance

### Consent Validation

```typescript
function validateConsentFlags(flags: ConsentFlags): boolean {
  // dataProcessingConsent is required
  if (!flags.dataProcessingConsent) {
    return false
  }
  return true
}
```

---

## Summary of Proposed Changes

### Database Changes

| Change | Entity | Type | Priority |
|--------|--------|------|----------|
| Make `farmerCode` mandatory | farmers | Schema | 🔴 **HIGH** |
| Add `agentCode` field | User | Schema | 🔴 **HIGH** |
| Make `mcc.code` mandatory | mccs | Schema | 🟡 **MEDIUM** |
| Add `customerCode` field | mcc_customers | Schema | 🔴 **HIGH** |
| Add `supplierCode` field | suppliers | Schema | 🔴 **HIGH** |
| Add `consentFlags` JSON | All entities | Schema | 🔴 **HIGH** |
| Create `agent_accounts` table | - | New Table | 🔴 **HIGH** |
| Create `customer_accounts` table | - | New Table | 🔴 **HIGH** |
| Create `supplier_accounts` table | - | New Table | 🔴 **HIGH** |

### Code Changes

| Change | File | Type | Priority |
|--------|------|------|----------|
| Create code generators | `lib/utils/code-generators.ts` | New File | 🔴 **HIGH** |
| Update farmer creation | `lib/services/MCCInventoryService.ts` | Update | 🔴 **HIGH** |
| Update MCC creation | `app/api/v1/mcc/setup/route.ts` | Update | 🟡 **MEDIUM** |
| Update warehouse creation | `app/api/v1/inventory/warehouses/route.ts` | Update | 🟡 **MEDIUM** |
| Update customer creation | `app/api/v1/mcc/customers/route.ts` | Update | 🔴 **HIGH** |
| Update supplier creation | `app/api/v1/mcc/suppliers/route.ts` | Update | 🔴 **HIGH** |
| Update agent registration | `app/api/v1/users/register/route.ts` | Update | 🔴 **HIGH** |

---

## Approval Checklist

Before implementation, please review and approve:

- [ ] Code generation formats are acceptable
- [ ] Consent flag structure meets compliance requirements
- [ ] Account creation for all entities is approved
- [ ] Database schema changes are approved
- [ ] Code generation utilities approach is approved
- [ ] Transaction handling approach is approved
- [ ] Error handling strategy is approved

---

**Document Status**: ✅ Complete - Awaiting Approval

**Next Steps**: 
1. Review and approve proposed changes
2. Implement approved changes
3. Test onboarding flows
4. Deploy to production
