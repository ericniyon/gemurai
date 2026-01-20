# HarvestPlus Multi-Commodity Platform - Implementation Plan

**Document Version:** 1.0  
**Date:** 2025-01-23  
**Source:** HarvestPlus Platform.docx

---

## Executive Summary

**Goal:** Evolve HarvestPlus from dairy-only ERP to **multi-commodity aggregation, planning, quality, and settlement platform** supporting Dairy, Coffee, Cereals, and other non-perishables.

**Key Principle:** One core platform + configurable commodity logic (no hard-coding)

---

## Core Requirements

### 1. **Commodity Studio (Admin Module)** - CRITICAL
- Create commodity categories (Perishables, Semi-Perishables, Non-Perishables)
- Define commodities dynamically
- Configure quality checks without code changes
- Set collection frequency and seasons
- Define input catalogs

### 2. **Multi-Commodity Support**
- Dairy (existing - enhance)
- Coffee (new)
- Cereals (new - Maize, Beans, Rice)
- Other non-perishables

### 3. **Dynamic Quality Schema Builder**
- Admin-defined quality fields per commodity
- Field types: Numeric, Dropdown, Boolean, Indicator
- Threshold rules (pass/fail/conditional)
- Impact on pricing

### 4. **Farm-Level Data Module**
- Season Plans (commodity-based)
- Input Usage Logging
- Expected vs actual tracking

### 5. **Enhanced Identity & ID Enforcement**
- Mandatory National ID for farmers
- Mandatory National ID + Agent ID for agents
- Verification states and timestamps
- Block payments if ID missing

### 6. **Agent Prepayment Logic** (Enhance existing)
- Link advances to commodity batches
- Split settlements (farmer vs agent)

### 7. **Commodity-Specific Features**
- Pricing methods: Spot, Grade-based, Deferred
- Storage types: tanks, bags, silos, warehouses
- Collection frequency: daily, seasonal, harvest windows

---

## Implementation Phases

### Phase 1: Commodity Studio Foundation (Week 1-2)
1. Database schema for commodities
2. Admin UI for Commodity Studio
3. Commodity categories management
4. Commodity definition management

### Phase 2: Dynamic Quality System (Week 2-3)
1. Quality schema builder
2. Dynamic quality forms
3. Quality validation engine
4. Quality impact on pricing

### Phase 3: Multi-Commodity Collections (Week 3-4)
1. Commodity-aware collection forms
2. Dynamic field rendering
3. Commodity-specific workflows
4. Storage type management

### Phase 4: Farm-Level & Season Planning (Week 4-5)
1. Season plans module
2. Input catalog
3. Input usage logging
4. Expected vs actual tracking

### Phase 5: Enhanced Payments & ID Verification (Week 5-6)
1. ID verification system
2. Enhanced prepayment logic
3. Split settlements
4. Ikofi integration preparation

---

## Database Schema Changes Required

### New Tables
1. `commodity_categories` - Category definitions
2. `commodities` - Commodity definitions
3. `commodity_quality_fields` - Dynamic quality fields
4. `commodity_quality_rules` - Quality validation rules
5. `season_plans` - Farmer season planning
6. `input_catalog` - Input definitions
7. `input_usage_logs` - Input usage tracking
8. `id_verifications` - ID verification records

### Enhanced Tables
1. `farmers` - Add mandatory National ID enforcement
2. `User` - Add agent ID and ID verification
3. `milk_collections` → `collections` (generalize)
4. `crop_collections` - Enhance for multi-commodity

---

## Key Features to Implement

### Admin Features
- ✅ Commodity Studio UI
- ✅ Quality Schema Builder
- ✅ Season & Frequency Manager
- ✅ Input Catalog Manager

### Operational Features
- ✅ Commodity-aware collection forms
- ✅ Dynamic quality assessment
- ✅ Multi-commodity inventory
- ✅ Season planning interface

### Financial Features
- ✅ Enhanced prepayment system
- ✅ Split settlements
- ✅ ID verification enforcement
- ✅ Commodity-specific pricing

---

**Status:** Ready for implementation
