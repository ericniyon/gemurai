# Gemurai Platform - System Baseline Documentation

**Document Version:** 1.0  
**Date:** 2025-01-XX  
**Purpose:** Complete system understanding and baseline freeze for future development

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Core Modules & Entities](#core-modules--entities)
4. [Database Schema & Relationships](#database-schema--relationships)
5. [Farmer System Logic](#farmer-system-logic)
6. [MCC (Milk Collection Center) Logic](#mcc-milk-collection-center-logic)
7. [Warehouse & Inventory Logic](#warehouse--inventory-logic)
8. [Payment System Logic](#payment-system-logic)
9. [Service & Business Logic](#service--business-logic)
10. [Authentication & Authorization](#authentication--authorization)
11. [Data Flow Diagrams](#data-flow-diagrams)
12. [API Structure](#api-structure)

---

## System Overview

**Gemurai** is a comprehensive digital platform for managing:
- **Milk Collection Centers (MCCs)** - Dairy cooperative management
- **Digital Community Champions (DCCs)** - Digital commerce and community services
- **Marketplace** - Product sales and inventory management
- **Pharmacy** - Prescription and medication management
- **Job Applications** - Employment and recruitment
- **Learning** - Educational content and courses

### Key Business Domains

1. **Dairy/Milk Management**: Farmers, MCCs, milk collections, processing, payments
2. **Digital Commerce**: DCCs, product sales, stock orders, inventory
3. **Pharmacy**: Prescriptions, medications, inventory tracking
4. **User Management**: Multi-role authentication, permissions, applications

---

## Architecture & Technology Stack

### Frontend
- **Framework**: Next.js 15.3.4 (App Router)
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.0
- **Components**: Radix UI primitives
- **State Management**: Zustand 5.0.5
- **Forms**: React Hook Form + Zod validation
- **Internationalization**: i18n (English/Rwanda - Kinyarwanda)

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (RESTful)
- **Authentication**: NextAuth.js 4.24.11 + JWT
- **Database**: PostgreSQL (via Prisma ORM)
- **ORM**: Prisma 6.10.1

### Infrastructure
- **Database**: PostgreSQL with Prisma Client
- **File Storage**: Cloudinary
- **Email**: SendGrid
- **SMS**: Twilio
- **Caching**: Redis (ioredis 5.6.1)
- **Deployment**: Vercel (standalone output)

### Key Libraries
- **Validation**: Zod 3.25.57
- **Date Handling**: date-fns 2.30.0
- **HTTP Client**: Axios 1.10.0
- **Notifications**: SweetAlert2 11.22.0, Sonner 2.0.5
- **Charts**: Recharts 2.8.0
- **Excel**: xlsx 0.18.5

---

## Core Modules & Entities

### 1. User Management Module
- **User Model**: Core user entity with roles, authentication, profiles
- **Application Model**: DCC application submissions with multi-step forms
- **ApplicationEvaluation**: AI-powered vulnerability assessments
- **ApplicationInterview**: Interview scheduling and scoring
- **DCCProfile**: DCC user profiles with ratings and performance metrics

### 2. MCC (Milk Collection Center) Module
- **mccs**: MCC entities with location, settings, manager assignment
- **farmers**: Farmer registry with GPS, herd size, credit limits
- **milk_collections**: Milk collection records with quality testing
- **mcc_payments**: Payment processing for farmers
- **mcc_sales**: Bulk milk sales to processors
- **mcc_periods**: Time-based collection periods
- **mcc_warehouses**: MCC-specific warehouse management
- **bulk_batches**: Milk bulking operations
- **staff**: MCC staff and workforce management
- **capacity_assessments**: MCC capacity evaluations

### 3. Warehouse & Inventory Module
- **Warehouse**: Main warehouse entities
- **Location**: Hierarchical location management within warehouses
- **StockMove**: Odoo-style stock movement tracking (DRAFT → CONFIRMED → ASSIGNED → DONE)
- **StockQuantity**: Real-time inventory quantities (quantity, reservedQuantity, availableQuantity)
- **InventoryAdjustment**: Inventory corrections and adjustments
- **CycleCount**: Physical inventory counting
- **LotNumber**: Lot/batch tracking for products
- **SerialNumber**: Serial number tracking
- **ReorderRule**: Automated reorder point management

### 4. Product Management Module
- **products**: Unified product catalog (supports MILK, PHARMACY, GENERAL inventory types)
- **ProductVariant**: Product variations (size, color, model)
- **ProductSpecification**: Product specifications
- **ProductReview**: Product reviews and ratings
- **Brand**: Brand management
- **Packaging**: Packaging information

### 5. Payment & Financial Module
- **Payment**: Stock order payments
- **Wallet**: User wallets (general)
- **DCCWallet**: DCC-specific wallets with minimum balance
- **WalletTransaction**: Wallet transaction history
- **WithdrawalRequest**: DCC withdrawal requests
- **mcc_payments**: MCC farmer payments
- **payments**: Generic payment records
- **farmer_accounts**: Farmer account balances
- **farmer_ledger**: Farmer transaction ledger

### 6. Pharmacy Module
- **Pharmacy**: Licensed pharmacy management
- **PharmacyWarehouse**: Pharmacy-specific warehouses (cold storage, quarantine, etc.)
- **Prescription**: Prescription management
- **PrescriptionItem**: Prescription line items
- **Patient**: Patient records

### 7. Sales & Orders Module
- **StockOrder**: DCC stock order requests
- **StockOrderProduct**: Stock order line items
- **sales**: Product sales records
- **sale_items**: Sale line items
- **OrderItem**: Marketplace order items

### 8. Additional Modules
- **Job**: Job postings
- **Employer**: Employer entities
- **Course**: Learning courses
- **EmailLog**: Email delivery tracking
- **SMSLog**: SMS delivery tracking
- **PasswordReset**: Password reset tokens
- **OTP**: OTP verification
- **Role & Permission**: RBAC system
- **UserRoleAssignment**: User-role assignments

---

## Database Schema & Relationships

### Core Relationships

#### User Relationships
```
User
├── mcc (mccId) → mccs (one-to-many)
├── managedMcc → mccs (MCCManager relation)
├── pharmacy (pharmacyId) → Pharmacy
├── wallet → Wallet (one-to-one)
├── dccProfile → DCCProfile (one-to-one)
├── applications → Application[] (one-to-many)
├── roleAssignments → UserRoleAssignment[]
└── [various stock/payment relations]
```

#### MCC Relationships
```
mccs
├── manager → User (managerUserId, one-to-one)
├── farmers → farmers[] (one-to-many)
├── mcc_periods → mcc_periods[] (one-to-many)
├── mcc_warehouses → mcc_warehouses[] (one-to-many)
├── milk_collections → milk_collections[] (one-to-many)
├── mcc_payments → mcc_payments[] (one-to-many)
├── mcc_sales → mcc_sales[] (one-to-many)
├── staff → staff[] (one-to-many)
└── [other MCC-related entities]
```

#### Farmer Relationships
```
farmers
├── mccs (mccId) → mccs (many-to-one)
├── milk_collections → milk_collections[] (one-to-many)
├── mcc_payments → mcc_payments[] (one-to-many)
├── payments → payments[] (one-to-many)
├── farmer_account → farmer_accounts (one-to-one)
├── ledger_entries → farmer_ledger[] (one-to-many)
├── sales → sales[] (one-to-many)
└── rentals → rentals[] (one-to-many)
```

#### Warehouse Relationships
```
Warehouse
├── locations → Location[] (one-to-many)
├── stockMoves → StockMove[] (one-to-many)
├── stockQuantities → StockQuantity[] (one-to-many)
├── cycleCounts → CycleCount[] (one-to-many)
└── inventoryAdjustments → InventoryAdjustment[] (one-to-many)

Location
├── warehouse → Warehouse (many-to-one)
├── parent → Location (self-referential hierarchy)
├── children → Location[] (self-referential)
├── stockQuantities → StockQuantity[] (one-to-many)
└── stockMoves → StockMove[] (source/destination)
```

#### Product Relationships
```
products
├── brand → Brand (many-to-one)
├── packaging → Packaging (many-to-one)
├── mcc_warehouses → mcc_warehouses (mccWarehouseId)
├── pharmacyWarehouse → PharmacyWarehouse (pharmacyWarehouseId)
├── stockQuantities → StockQuantity[] (one-to-many)
├── stockMoves → StockMove[] (one-to-many)
├── variants → ProductVariant[] (one-to-many)
└── [other product relations]
```

### Key Enums

- **UserRole**: SUPER_ADMIN, ADMIN, DCC, EMPLOYER, CONSUMER, AGENT, MCC_MANAGER, FIELD_AGENT, COOP_ADMIN, FARMER, ACCOUNTANT
- **ApplicationStatus**: TEMPORARY, SUBMITTED, UNDER_REVIEW, PENDING_DOCUMENTS, APPROVED, REJECTED, INTERVIEW_INVITED
- **StockMoveType**: INCOMING, OUTGOING, INTERNAL, RETURN, ADJUSTMENT, PRODUCTION, SCRAP
- **StockMoveState**: DRAFT, CONFIRMED, ASSIGNED, DONE, CANCELLED
- **InventoryType**: MILK, PHARMACY, GENERAL
- **MCCProductType**: RAW_MILK, PROCESSED_MILK, MILK_PRODUCTS, BYPRODUCTS
- **MilkCollectionStatus**: PENDING, APPROVED, PAID, PROCESSED
- **PaymentStatus**: pending, paid, partial
- **PaymentMethod**: cash, mobile_money, bank_transfer

---

## Farmer System Logic

### Farmer Entity Structure
- **Core Fields**: id, farmerCode (unique), name, phone, location, village
- **Enhanced Fields**: 
  - nfcId, nationalId (unique identifiers)
  - herdSize (number of cows)
  - gpsLatitude, gpsLongitude (GPS coordinates)
  - creditLimit (purchase credit limit)
  - emergencyContact, email, address
- **Financial Fields**: totalAmountEarned, lastCollectionDate, defaultPriceGroup
- **Relationships**: mccId → mccs, farmer_account, ledger_entries

### Farmer Account & Ledger System
- **farmer_accounts**: Single account per farmer with balance tracking
- **farmer_ledger**: Transaction history with:
  - type: COLLECTION, SALE, PAYMENT, ADJUSTMENT
  - amount, balanceAfter, refId, notes
  - Indexed by farmerId and entryAt (descending)

### Milk Collection Flow
1. **Collection Recording** (`MilkCollectionService.recordCollection`)
   - Validates milk quality (fat, protein, lactometer, antibiotic test, temperature)
   - Calculates totalAmount = totalLiters × unitPrice
   - Applies deductions (products, others)
   - Applies advances
   - Calculates netPayment = totalAmount - totalDeductions - advances
   - Creates `milk_collections` record with quality status
   - Updates farmer's `lastCollectionDate`

2. **Quality Validation** (`MilkCollectionService.validateQuality`)
   - Rejects if antibiotic test positive
   - Rejects if lactometer reading too low
   - Rejects if temperature too high
   - Rejects if time since milking too long
   - Applies quality multiplier based on fat content
   - Returns qualityStatus: "pending" | "accepted" | "rejected"

3. **Payment Processing**
   - If immediatePayment: Creates `mcc_payments` record with status "paid"
   - Updates collection status to "PAID"
   - Updates farmer account balance
   - Creates ledger entry
   - If credit: Updates account balance, creates ledger entry (payment later)

### Farmer Payment Methods
- **Cash**: Immediate payment
- **Mobile Money**: Requires phone number and reference
- **Bank Transfer**: Requires bank reference
- **Credit**: Deferred payment (updates account, payment later)

### Farmer Data Flow
```
Farmer Registration
  ↓
Milk Collection (with quality tests)
  ↓
Quality Validation
  ↓
[If Accepted] → Create milk_collections record
  ↓
Calculate Payment (totalAmount - deductions - advances)
  ↓
[If Immediate Payment] → Create mcc_payments → Update farmer_account → Create ledger entry
[If Credit] → Update farmer_account → Create ledger entry
  ↓
Update farmer.lastCollectionDate
```

---

## MCC (Milk Collection Center) Logic

### MCC Entity Structure
- **Core Fields**: id, code (unique), name, location, region, address
- **Settings**: JSON field for MCC-specific configuration
  - qualityRules: minLactometer, maxTemp, basePricePerLiter, fatFactor, etc.
  - paymentSettings, collectionSettings
- **Relationships**: managerUserId → User (MCCManager), farmers[], periods[], warehouses[]

### MCC Setup Process
1. **MCC Creation** (`MCCInventoryService.setupMCC`)
   - Creates MCC record
   - Creates MCC warehouses (COLLECTION_CENTER, PROCESSING_PLANT, COLD_STORAGE, DISTRIBUTION_CENTER)
   - Creates initial products (Raw Milk, Processed Milk, etc.)
   - Links products to warehouses

### MCC Periods
- **mcc_periods**: Time-based collection periods
  - periodNumber, startDate, endDate
  - Aggregates: totalFarmers, totalMilkCollected, totalAmount, totalDeductions, totalAdvances
  - Status: ACTIVE, COMPLETED, CLOSED

### Milk Collection Integration
- **Milk Collection → Inventory**: Creates StockMove (INCOMING) when milk is collected
- **Stock Move States**: DRAFT → CONFIRMED → ASSIGNED → DONE
- **Inventory Update**: Updates StockQuantity when stock move is DONE

### MCC Inventory Management
- **MCC Warehouses**: Separate from main Warehouse system
  - Types: COLLECTION_CENTER, PROCESSING_PLANT, COLD_STORAGE, DISTRIBUTION_CENTER
  - Linked to products via `mccWarehouseId`
- **Inventory Summary**: Calculates total products, quantities, values per warehouse

### MCC Sales
- **mcc_sales**: Bulk milk sales to processors
  - litersSold, unitPrice, totalAmount
  - companyName, companyContact, companyAddress
  - paymentStatus: pending, paid, partial
  - saleDate, recordedBy

### MCC Staff Management
- **staff**: MCC workforce
  - userId → User (optional, can be standalone)
  - position, employmentType (permanent, contract, seasonal)
  - trainingLevel, certifications, payrollAccount

### MCC Data Flow
```
MCC Setup
  ↓
Create MCC Warehouses
  ↓
Create Initial Products (Raw Milk, Processed Milk)
  ↓
Farmer Registration
  ↓
Milk Collection (with quality tests)
  ↓
Create StockMove (INCOMING) → Update Inventory
  ↓
Payment Processing
  ↓
Milk Processing (raw → processed)
  ↓
Bulk Sales to Processors
```

---

## Warehouse & Inventory Logic

### Warehouse System Architecture
- **Dual Inventory System**: Supports MILK, PHARMACY, and GENERAL inventory types
- **Hierarchical Locations**: Warehouse → Location (with parent-child relationships)
- **Odoo-Style Stock Moves**: State machine workflow

### Stock Move Workflow
1. **DRAFT**: Initial creation
2. **CONFIRMED**: Validated and ready for processing
   - For OUTGOING/INTERNAL: Checks stock availability
   - Reserves quantity (updates reservedQuantity)
3. **ASSIGNED**: Stock reserved, ready for physical execution
4. **DONE**: Physical move completed, quantities updated
5. **CANCELLED**: Move cancelled

### Stock Move Types
- **INCOMING**: Receive products (adds to destination)
- **OUTGOING**: Remove products (removes from source)
- **INTERNAL**: Move between locations (removes from source, adds to destination)
- **RETURN**: Return products
- **ADJUSTMENT**: Inventory corrections
- **PRODUCTION**: Production output
- **SCRAP**: Scrap/waste

### Stock Quantity Tracking
- **quantity**: Total physical stock
- **reservedQuantity**: Stock reserved for confirmed moves
- **availableQuantity**: Available for new reservations (quantity - reservedQuantity)
- **Unique Constraint**: (productId, warehouseId, locationId)

### Inventory Adjustments
- **Types**: INCREASE, DECREASE, SET
- **States**: DRAFT → APPROVED → DONE → CANCELLED
- **Workflow**: Created → Approved by authorized user → Executed → Quantities updated

### Cycle Counting
- **Purpose**: Physical inventory verification
- **States**: DRAFT → IN_PROGRESS → DONE → CANCELLED
- **Items**: Expected vs counted quantities, variance calculation

### Location Hierarchy
- **Location Types**: STORAGE, PICKING, RECEIVING, SHIPPING, PRODUCTION, SCRAP, TRANSIT
- **Hierarchical**: Parent-child relationships for nested locations
- **Capacity**: maxCapacity, currentCapacity tracking

### Warehouse Data Flow
```
Stock Move Creation (DRAFT)
  ↓
Confirmation (CONFIRMED)
  ↓
[For OUTGOING/INTERNAL] → Check Availability → Reserve Stock (ASSIGNED)
  ↓
Physical Execution (DONE)
  ↓
Update StockQuantity
  ├── INCOMING: Add to destination
  ├── OUTGOING: Remove from source
  └── INTERNAL: Remove from source, add to destination
```

---

## Payment System Logic

### Payment Types

#### 1. MCC Farmer Payments (`mcc_payments`)
- **Purpose**: Pay farmers for milk collections
- **Fields**: farmerId, collectionId, mccId, totalAmount, deductions, advances, netPayment
- **Payment Methods**: cash, mobile_money, bank_transfer
- **Status**: pending, paid, partial
- **Flow**: Collection → Payment → Update farmer_account → Create ledger entry

#### 2. Stock Order Payments (`Payment`)
- **Purpose**: Payments for DCC stock orders
- **Fields**: stockOrderId (unique), status, amount, method, reference, paidAt
- **Relationship**: One-to-one with StockOrder

#### 3. Generic Payments (`payments`)
- **Purpose**: General payment records
- **Fields**: farmerId, amount, method, reference, paidAt

#### 4. Wallet System
- **Wallet**: General user wallets
- **DCCWallet**: DCC-specific wallets with minimumBalance (default 5000)
- **WalletTransaction**: Transaction history (DEPOSIT, WITHDRAWAL, COMMISSION, REFUND, FEE)
- **WithdrawalRequest**: DCC withdrawal requests (PENDING → APPROVED → REJECTED → COMPLETED)

### Payment Processing Flow
```
Payment Request
  ↓
Validate Payment Method
  ├── Cash → Immediate processing
  ├── Mobile Money → Validate phone/reference
  └── Bank Transfer → Validate reference
  ↓
Create Payment Record
  ↓
Update Account Balance
  ↓
Create Transaction Record
  ↓
[If Farmer Payment] → Update farmer_account → Create ledger entry
```

### Farmer Account & Ledger
- **farmer_accounts**: Single account per farmer, balance tracking
- **farmer_ledger**: Complete transaction history
  - Types: COLLECTION, SALE, PAYMENT, ADJUSTMENT
  - Tracks: amount, balanceAfter, refId (reference to source transaction)

---

## Service & Business Logic

### Core Services

#### 1. MilkCollectionService (`lib/services/MilkCollectionService.ts`)
- **validateQuality**: Validates milk quality based on MCC settings
- **recordCollection**: Records milk collection with quality validation
- **updateFarmerAccount**: Updates farmer account and ledger

#### 2. MCCInventoryService (`lib/services/MCCInventoryService.ts`)
- **setupMCC**: Sets up MCC with warehouses and initial products
- **recordMilkCollection**: Records collection and creates stock move
- **getMCCInventorySummary**: Gets inventory summary for MCC
- **getFarmerCollectionHistory**: Gets farmer's collection history

#### 3. InventoryService (`lib/services/InventoryService.ts`)
- **createStockMove**: Creates stock move (DRAFT state)
- **confirmStockMove**: Confirms stock move (DRAFT → CONFIRMED)
- **assignStockMove**: Assigns stock move (CONFIRMED → ASSIGNED)
- **completeStockMove**: Completes stock move (ASSIGNED → DONE)
- **updateStockQuantities**: Updates stock quantities based on move

#### 4. StockOrderService (`lib/services/StockOrderService.ts`)
- **createStockOrder**: Creates stock order request
- **approveStockOrder**: Approves stock order
- **rejectStockOrder**: Rejects stock order
- **completeStockOrder**: Completes stock order

#### 5. DCCStockService (`lib/services/DCCStockService.ts`)
- **getDCCStock**: Gets DCC stock levels
- **updateDCCStock**: Updates DCC stock

### Business Rules

#### Milk Quality Rules (from MCC settings)
- **Default Rules**:
  - minLactometer: 1.025
  - maxTemp: 4.0°C
  - maxTimeSinceMilking: 2.0 hours
  - basePricePerLiter: 500 RWF
  - fatFactor: 0.1
  - baselineFat: 3.5%

#### Payment Rules
- **Farmer Payments**: Net payment = totalAmount - deductions - advances
- **DCC Wallet**: Minimum balance 5000 RWF
- **Withdrawal Requests**: Require approval workflow

#### Stock Move Rules
- **Availability Check**: Required for OUTGOING and INTERNAL moves
- **Reservation**: Stock reserved when move is ASSIGNED
- **Execution**: Quantities updated when move is DONE

---

## Authentication & Authorization

### Authentication System
- **Provider**: NextAuth.js 4.24.11
- **Token**: JWT (JSON Web Tokens)
- **Storage**: HTTP-only cookies (`Gemurai_token`)
- **Middleware**: Route protection via `middleware.ts`

### User Roles (from `ROLES_COMPLETE_LIST.md`)
1. **SUPER_ADMIN** (Level 100): Full system access
2. **COOP_ADMIN** (Level 80): Regional/cooperative admin
3. **MCC_MANAGER** (Level 75): MCC administrator
4. **EMPLOYER** (Level 70): Business owner
5. **ACCOUNTANT** (Level 70): Financial management
6. **ADMIN** (Level 60): Administrative access
7. **TEAM_LEADER** (Level 60): Team management
8. **BRANCH_MANAGER** (Level 55): Branch operations
9. **EMPLOYEE** (Level 50): Company employee
10. **DIGITAL_SERVICE** (Level 45): Digital service provider
11. **DCC** (Level 40): Digital Community Champion
12. **FIELD_AGENT** (Level 25): Collection agent
13. **AGENT** (Level 20): Service agent
14. **CONSUMER** (Level 10): Regular customer
15. **FARMER** (Level 5): Farmer (limited access)

### Permission System
- **RBAC**: Role-Based Access Control
- **Permissions**: Granular permissions (e.g., `mcc.farmers.view`, `mcc.payments.create`)
- **Route Protection**: Middleware checks role and permissions
- **API Protection**: `checkMCCPermission`, `verifyAuthToken` functions

### Permission Categories
- Dashboard, Users, Products, Stock, Inventory, Orders, Applications, Jobs, Learning, Finance, Wallet, Sales, MCC operations, Pharmacy operations

---

## Data Flow Diagrams

### Milk Collection Flow
```
Farmer → Field Agent
  ↓
Milk Collection (with quality tests)
  ↓
MilkCollectionService.validateQuality()
  ↓
[If Quality Passed]
  ↓
Create milk_collections record
  ↓
Calculate Payment (totalAmount - deductions - advances)
  ↓
[If Immediate Payment]
  ├── Create mcc_payments record
  ├── Update farmer_account.balance
  └── Create farmer_ledger entry
[If Credit]
  ├── Update farmer_account.balance
  └── Create farmer_ledger entry
  ↓
Create StockMove (INCOMING) → Update Inventory
```

### Stock Order Flow
```
DCC → Create StockOrder (status: PENDING)
  ↓
EMPLOYER/ADMIN → Approve StockOrder
  ↓
DCC → Confirm Payment
  ↓
Create Payment record
  ↓
EMPLOYER/ADMIN → Complete StockOrder
  ↓
Create StockMove (OUTGOING) → Update Inventory
```

### Stock Move Flow
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
Update StockQuantity
```

---

## API Structure

### API Base Paths
- **v1 API**: `/api/v1/*`
- **Legacy API**: `/api/*` (various endpoints)

### Key API Endpoints

#### MCC APIs (`/api/v1/mcc/*`)
- `GET /api/v1/mcc/farmers` - List farmers
- `POST /api/v1/mcc/farmers` - Create farmer
- `GET /api/v1/mcc/collections` - List collections
- `POST /api/v1/mcc/collections` - Record collection
- `GET /api/v1/mcc/payments` - List payments
- `POST /api/v1/mcc/payments` - Process payment
- `GET /api/v1/mcc/inventory` - Get inventory summary
- `GET /api/v1/mcc/dashboard` - MCC dashboard data
- `GET /api/v1/mcc/sales` - List sales
- `POST /api/v1/mcc/sales` - Record sale

#### Inventory APIs (`/api/v1/inventory/*`)
- `GET /api/v1/inventory/warehouses` - List warehouses
- `POST /api/v1/inventory/warehouses` - Create warehouse
- `GET /api/v1/inventory/locations` - List locations
- `POST /api/v1/inventory/locations` - Create location
- `GET /api/v1/inventory/moves` - List stock moves
- `POST /api/v1/inventory/moves` - Create stock move
- `POST /api/v1/inventory/moves/confirm` - Confirm stock move
- `POST /api/v1/inventory/moves/assign` - Assign stock move
- `POST /api/v1/inventory/moves/complete` - Complete stock move
- `GET /api/v1/inventory/stock` - Get stock quantities

#### Stock Order APIs (`/api/v1/stock-orders/*`)
- `GET /api/v1/stock-orders` - List stock orders
- `POST /api/v1/stock-orders` - Create stock order
- `POST /api/v1/stock-orders/[id]/approve` - Approve order
- `POST /api/v1/stock-orders/[id]/reject` - Reject order
- `POST /api/v1/stock-orders/[id]/complete` - Complete order

#### Authentication APIs (`/api/v1/auth/*`)
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/password-reset-request` - Request password reset
- `POST /api/v1/auth/password-reset-verify` - Verify reset token
- `POST /api/v1/auth/password-reset-complete` - Complete password reset

### API Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {  // For paginated responses
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### API Authentication
- **Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Token Source**: Cookie (`Gemurai_token`) or Authorization header
- **Verification**: `verifyAuthToken()` function

---

## Key Files & Directories

### Core Application Structure
```
app/
├── api/                    # API routes
│   ├── v1/                 # v1 API endpoints
│   │   ├── mcc/           # MCC APIs
│   │   ├── inventory/     # Inventory APIs
│   │   ├── auth/          # Authentication APIs
│   │   └── ...
│   └── ...
├── [lang]/                 # Internationalized routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   └── ...
├── superadmin/            # Superadmin pages
└── ...

lib/
├── services/              # Business logic services
│   ├── MilkCollectionService.ts
│   ├── MCCInventoryService.ts
│   ├── InventoryService.ts
│   └── ...
├── auth.ts                # Authentication utilities
├── permissions.ts          # Permission definitions
├── roles.ts               # Role definitions
├── prisma.ts              # Prisma client
└── ...

prisma/
├── schema.prisma         # Database schema
└── migrations/            # Database migrations
```

---

## Important Notes

### System Constraints
1. **No Code Changes**: This documentation is for understanding only
2. **No Refactoring**: Existing code structure must be preserved
3. **No New Tech**: Do not introduce new technologies
4. **Database Schema**: All relationships and constraints are documented above

### Key Business Rules
1. **Milk Quality**: Rejection rules based on antibiotic test, lactometer, temperature, time since milking
2. **Payment Calculation**: Net payment = totalAmount - deductions - advances
3. **Stock Reservation**: Stock reserved when move is ASSIGNED
4. **DCC Wallet**: Minimum balance 5000 RWF
5. **Role Hierarchy**: Higher level roles can access lower level resources

### Data Integrity
- **Unique Constraints**: farmerCode, nationalId, nfcId (farmers), email, phone (users)
- **Foreign Keys**: All relationships properly defined with cascade/restrict rules
- **Indexes**: Key fields indexed for performance (mccId, farmerId, productId, etc.)

---

## Conclusion

This document provides a comprehensive baseline understanding of the Gemurai platform. All modules, entities, relationships, and business logic have been documented without making any code changes. This serves as the foundation for future development work.

**Document Status**: ✅ Complete - System Understanding & Baseline Freeze
