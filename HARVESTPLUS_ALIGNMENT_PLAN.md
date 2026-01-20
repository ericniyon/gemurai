# HarvestPlus Product Vision Alignment Plan

**Date:** 2025-01-23  
**Vision:** One core platform + configurable commodity logic (no hard-coding)

---

## Current State Analysis

### ✅ What's Already Configurable (Good)
1. **Commodity Studio** - Dynamic commodity creation
2. **Dynamic Quality Fields** - Configurable per commodity
3. **Commodity Collections** - Unified `commodity_collections` table
4. **CommodityCollectionService** - Works for any commodity

### ❌ What's Still Hard-Coded (Needs Refactoring)
1. **Milk Collections** - `milk_collections` table with hard-coded fields (fat, protein, lactometerReading, etc.)
2. **Crop Collections** - `crop_collections` table with hard-coded fields
3. **MilkCollectionService** - Hard-coded milk quality validation
4. **CropCollectionService** - Hard-coded crop quality validation
5. **Separate Services** - Milk vs Crops handled differently

---

## Action Plan

### Phase 1: Audit & Document (Immediate)
- [x] Identify all hard-coded commodity logic
- [ ] Document migration path from hard-coded to configurable
- [ ] Create deprecation timeline

### Phase 2: Unified Collection System (Priority)
**Goal:** All collections go through `commodity_collections` table

**Tasks:**
1. **Migrate Milk Collections**
   - Create "Milk" commodity in Commodity Studio
   - Define milk quality fields (Fat %, Protein %, Temperature, etc.) dynamically
   - Update milk collection forms to use `CommodityCollectionService`
   - Keep `milk_collections` for backward compatibility (read-only)

2. **Migrate Crop Collections**
   - Create crop commodities (Maize, Beans, Rice, etc.) in Commodity Studio
   - Define crop quality fields (Moisture %, Grade, Foreign Matter, etc.) dynamically
   - Update crop collection forms to use `CommodityCollectionService`
   - Keep `crop_collections` for backward compatibility (read-only)

3. **Unified Collection Form**
   - Single form that works for all commodities
   - Dynamically renders quality fields based on selected commodity
   - Already exists: `CommodityCollectionForm.tsx` ✅

### Phase 3: Remove Hard-Coded Services (Future)
**Goal:** Single service handles all commodities

**Tasks:**
1. Deprecate `MilkCollectionService` (keep for legacy data)
2. Deprecate `CropCollectionService` (keep for legacy data)
3. Use only `CommodityCollectionService` for new collections
4. Create data migration scripts to move old data to unified system

### Phase 4: Collection Center Types (Enhancement)
**Goal:** Support MCCs, coffee washing stations, warehouses

**Tasks:**
1. Make collection center type configurable per commodity
2. Update UI to show appropriate center types
3. Support multiple center types in same system

---

## Immediate Next Steps

### Option A: Quick Win - Enhance Existing System
1. Ensure all new collections use `commodity_collections`
2. Update UI to prioritize unified collection form
3. Document that milk/crop tables are legacy

### Option B: Full Migration - Align with Vision
1. Create commodities in Commodity Studio for:
   - Milk (with quality fields: Fat %, Protein %, Temperature, etc.)
   - Maize (with quality fields: Moisture %, Grade, etc.)
   - Beans (with quality fields: Moisture %, Grade, etc.)
   - Coffee (with quality fields: Grade, Moisture %, etc.)
2. Update all collection forms to use unified system
3. Mark old tables as deprecated

### Option C: Hybrid Approach (Recommended)
1. Keep existing milk/crop collections for backward compatibility
2. All NEW collections use unified `commodity_collections` system
3. Gradually migrate old data
4. Update documentation to show unified system as primary

---

## Recommended Approach: **Option C (Hybrid)**

**Why:**
- ✅ No breaking changes
- ✅ Backward compatible
- ✅ Gradual migration
- ✅ Aligns with vision for new data
- ✅ Can deprecate old system later

**Implementation:**
1. Ensure Commodity Studio has all commodities defined
2. Update navigation to prioritize unified collection form
3. Keep existing forms but mark as "Legacy"
4. Create migration guide for moving to unified system

---

## Success Criteria

✅ **Aligned with Vision:**
- [ ] All new collections use configurable system
- [ ] No new hard-coded commodity logic added
- [ ] Commodity Studio is primary way to add commodities
- [ ] Quality fields are configurable, not hard-coded
- [ ] Single collection service handles all commodities

---

## Questions to Answer

1. **Should we migrate existing milk/crop collections to unified system?**
   - Yes → Full migration (more work, cleaner system)
   - No → Keep both systems (easier, less clean)

2. **Timeline for deprecating old tables?**
   - Immediate → Breaking change
   - 6 months → Gradual migration
   - Never → Keep for backward compatibility

3. **Priority:**
   - Fix existing hard-coded logic?
   - Enhance configurable system?
   - Document current state?

---

**Next Action:** Wait for user decision on approach (A, B, or C)
