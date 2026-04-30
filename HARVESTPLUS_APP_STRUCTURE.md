# HarvestPlus Application Structure

**App Name:** HarvestPlus  
**Purpose:** Multi-Commodity Aggregation & Settlement Platform  
**Date:** 2025-01-23

---

## 🏗️ Application Architecture

### Main Application: **HarvestPlus**
HarvestPlus is the main application that manages **two distinct sectors**:

1. **MCC (Digital) Sector** - Milk Collection & Processing
2. **Agriculture (Crops) Sector** - Crop Collection & Processing

---

## 📊 Sector Structure

### 1. MCC (Digital) Sector

**Location:** `/en/dashboard/mcc`

**Core Operations:**
- **Milk Collections** (`milk_collections`) - Daily milk collection from farmers
- **MCC Periods** (`mcc_periods`) - Time-based aggregation periods
- **Milk Processing** (`milk_processing`) - Raw milk → processed products

**Database Tables:**
- `milk_collections` - Individual milk collection records
- `mcc_periods` - Aggregation periods (quinzenne, monthly)
- `milk_processing` - Processing workflows
- `bulk_batches` - Bulk milk batches

**Features:**
- Quality testing (fat %, SNF %, temperature, etc.)
- Farmer payments & deductions
- Inventory integration
- Sales management
- Customer & supplier management

---

### 2. Agriculture (Crops) Sector

**Location:** `/en/dashboard/agriculture`

**Core Operations:**
- **Crop Collections** (`crop_collections`) - Crop collection from farmers
- **Crop Types** (`crop_types`) - Maize, Beans, Rice, etc.
- **Crop Periods** (`crop_periods`) - Seasonal aggregation periods
- **Crop Processing** (`crop_processing`) - Crop processing workflows

**Database Tables:**
- `crop_collections` - Individual crop collection records
- `crop_types` - Crop type definitions
- `crop_periods` - Seasonal periods
- `crop_processing` - Processing records

**Features:**
- Quality testing (moisture %, grade, foreign matter, etc.)
- Farmer payments & deductions
- Inventory integration
- Season-based planning

---

## 🔄 Unified Features (Both Sectors)

These features work across **both MCC (Digital) and Agriculture (Crops)**:

1. **Multi-Commodity Collections** (`commodity_collections`)
   - Single form for all commodities (Digital, Coffee, Cereals, etc.)
   - Dynamic quality fields
   - Commodity-aware validation

2. **Season Plans** (`season_plans`)
   - Farm-level planning
   - Expected vs actual tracking
   - Input usage logging

3. **Reconciliation** (`reconciliation_records`)
   - Automated reconciliation
   - Discrepancy detection
   - Works for both milk and crops

4. **Input Catalog** (`input_catalog`)
   - Input definitions per commodity
   - Usage tracking

5. **ID Verification** (`id_verifications`)
   - Mandatory National ID enforcement
   - Works for all farmers (Digital & crops)

---

## 🗂️ Navigation Structure

```
HarvestPlus (Main App)
├── HarvestPlus Dashboard
│   └── Sector selection & overview
│
├── MCC - Digital Sector
│   ├── MCC Dashboard
│   ├── Milk Collections (milk_collections)
│   ├── MCC Periods (mcc_periods)
│   └── Milk Processing (milk_processing)
│
├── Agriculture - Crops Sector
│   ├── Agriculture Dashboard
│   ├── Crop Collections (crop_collections)
│   ├── Crop Types (crop_types)
│   ├── Crop Periods (crop_periods)
│   └── Crop Processing (crop_processing)
│
└── Unified Features
    ├── Multi-Commodity Collections
    ├── Season Plans
    ├── Reconciliation
    ├── Input Catalog
    └── ID Verification
```

---

## 📍 Page Routes

### HarvestPlus Main
- `/en/dashboard/harvestplus` - Main dashboard (sector selection)

### MCC (Digital) Sector
- `/en/dashboard/mcc` - MCC Dashboard
- `/en/dashboard/mcc/collections` - Milk Collections
- `/en/dashboard/mcc/periods` - MCC Periods (if exists)
- `/en/dashboard/mcc/processing` - Milk Processing
- `/en/dashboard/mcc/customers` - Customers
- `/en/dashboard/mcc/suppliers` - Suppliers
- `/en/dashboard/mcc/sales` - Sales
- `/en/dashboard/mcc/payments` - Payments
- `/en/dashboard/mcc/ikofi` - Ikofi

### Agriculture (Crops) Sector
- `/en/dashboard/agriculture` - Agriculture Dashboard
- `/en/dashboard/mcc/crops/collections` - Crop Collections
- `/en/dashboard/mcc/crops/types` - Crop Types
- `/en/dashboard/mcc/crops/periods` - Crop Periods
- `/en/dashboard/mcc/crops/processing` - Crop Processing

### Unified Features
- `/en/dashboard/mcc/commodities/collections` - Multi-Commodity Collections
- `/en/dashboard/farmers/season-plans` - Season Plans
- `/en/dashboard/mcc/reconciliation` - Reconciliation
- `/en/dashboard/admin/input-catalog` - Input Catalog
- `/en/dashboard/admin/id-verification` - ID Verification

### Admin
- `/en/admin/commodity-studio` - Commodity Studio (Admin only)

---

## 🔀 User Flow

### For MCC Managers:

1. **Access HarvestPlus:**
   - Navigate to `/en/dashboard/harvestplus`
   - See both sectors (MCC Digital & Agriculture Crops)

2. **Work with MCC (Digital) Sector:**
   - Click "MCC - Digital Sector" or navigate to `/en/dashboard/mcc`
   - Manage milk collections, periods, processing
   - Handle customers, suppliers, sales, payments

3. **Work with Agriculture (Crops) Sector:**
   - Click "Agriculture - Crops Sector" or navigate to `/en/dashboard/agriculture`
   - Manage crop collections, types, periods, processing

4. **Use Unified Features:**
   - Multi-Commodity Collections (works for all commodities)
   - Season Plans (works for both sectors)
   - Reconciliation (works for both sectors)

---

## 🎯 Key Principles

1. **Clear Sector Separation:**
   - MCC (Digital) = Milk operations
   - Agriculture (Crops) = Crop operations
   - Each sector has its own dashboard and management flow

2. **Unified Platform:**
   - Both sectors use the same underlying infrastructure
   - Shared features (payments, inventory, reconciliation)
   - Common farmer management

3. **Multi-Commodity Support:**
   - Commodity Studio allows adding new commodities
   - Multi-Commodity Collections form works for all
   - Dynamic quality fields per commodity

4. **Data Model Clarity:**
   - `milk_collections` = MCC (Digital) operations
   - `crop_collections` = Agriculture (Crops) operations
   - `commodity_collections` = Unified multi-commodity system

---

## ✅ Implementation Status

- ✅ HarvestPlus main dashboard created
- ✅ MCC (Digital) sector page with clear header
- ✅ Agriculture (Crops) sector page created
- ✅ Navigation structure updated
- ✅ Clear separation between sectors
- ✅ Unified features accessible from both sectors

---

**The app is now structured to clearly manage both MCC (Digital) and Agriculture (Crops) sectors under the HarvestPlus platform!**
