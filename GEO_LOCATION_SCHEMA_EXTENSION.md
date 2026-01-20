# Geo-Location Database Schema Extension

**Document Version:** 1.0  
**Date:** 2025-01-XX  
**Purpose:** Add optional geo-location support to database schema with backward compatibility

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Proposed Solution](#proposed-solution)
4. [Prisma Schema Changes](#prisma-schema-changes)
5. [Migration Strategy](#migration-strategy)
6. [Implementation Approach](#implementation-approach)
7. [Backward Compatibility](#backward-compatibility)

---

## Executive Summary

This document proposes a **dual-approach** geo-location extension:
1. **Direct Fields Approach**: Simple `latitude` and `longitude` Float fields (for most entities)
2. **Reusable GeoLocation Table**: For entities requiring advanced geo features (indexing, PostGIS support)

### Key Principles
- ✅ **No Breaking Changes**: All new fields are nullable
- ✅ **Backward Compatible**: Existing data remains valid
- ✅ **Optional**: Geo-location is optional for all entities
- ✅ **Flexible**: Support both simple and advanced geo needs

---

## Current State Analysis

### Existing Geo-Location Fields

| Entity | Current Implementation | Type | Status |
|--------|----------------------|------|--------|
| **farmers** | `gpsLatitude`, `gpsLongitude` | `Float?` | ✅ Already exists |
| **milk_collections** | `geolocation` | `Json?` | ✅ Already exists (JSON format) |

### Current Usage

**Farmers:**
```prisma
model farmers {
  gpsLatitude  Float?  // GPS latitude
  gpsLongitude Float?  // GPS longitude
}
```

**Milk Collections:**
```prisma
model milk_collections {
  geolocation Json? // { lat, lng } or PostGIS point
}
```

### Reference Schema (dss.txt)
- Mentions PostGIS: `gps_point GEOMETRY(POINT, 4326)`
- Uses GIST index for spatial queries

---

## Proposed Solution

### Approach: Dual Strategy

**Option 1: Direct Fields** (Recommended for most entities)
- Simple `latitude` and `longitude` Float fields
- Easy to query and index
- No additional table joins
- Suitable for: MCCs, Warehouses, Customers, Suppliers, Agents

**Option 2: Reusable GeoLocation Table** (For advanced needs)
- Separate `GeoLocation` table with PostGIS support
- Supports complex spatial queries
- Can store additional metadata (accuracy, altitude, etc.)
- Suitable for: Future PostGIS integration, complex spatial operations

### Recommendation

**Use Direct Fields** for most entities, with option to migrate to GeoLocation table later if needed.

---

## Prisma Schema Changes

### 1. Add Direct Geo-Location Fields

#### Entities to Extend

| Entity | Fields to Add | Rationale |
|--------|--------------|-----------|
| **mccs** | `latitude`, `longitude` | MCC location tracking |
| **Warehouse** | `latitude`, `longitude` | Warehouse location |
| **mcc_customers** | `latitude`, `longitude` | Customer location |
| **suppliers** | `latitude`, `longitude` | Supplier location |
| **User** (agents) | `latitude`, `longitude` | Agent location tracking |
| **mcc_warehouses** | `latitude`, `longitude` | MCC warehouse location |

#### Schema Updates

```prisma
// 1. Update mccs model
model mccs {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84)
  longitude   Float?  // Geo-location longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([latitude, longitude]) // Composite index for location queries
}

// 2. Update Warehouse model
model Warehouse {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84)
  longitude   Float?  // Geo-location longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([latitude, longitude]) // Composite index for location queries
}

// 3. Update mcc_customers model
model mcc_customers {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84)
  longitude   Float?  // Geo-location longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([latitude, longitude]) // Composite index for location queries
}

// 4. Update suppliers model
model suppliers {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84)
  longitude   Float?  // Geo-location longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([latitude, longitude]) // Composite index for location queries
}

// 5. Update User model (for agents)
model User {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84) - for agents
  longitude   Float?  // Geo-location longitude (WGS84) - for agents
  
  // ... rest of fields ...
  
  @@index([latitude, longitude]) // Composite index for location queries
}

// 6. Update mcc_warehouses model
model mcc_warehouses {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84)
  longitude   Float?  // Geo-location longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([latitude, longitude]) // Composite index for location queries
}
```

### 2. Create Reusable GeoLocation Table (Optional, for future use)

```prisma
// Optional: Reusable GeoLocation table for advanced spatial operations
model GeoLocation {
  id          String   @id @default(cuid())
  entityType  String   // e.g., "farmer", "mcc", "warehouse", "milk_collection"
  entityId    String   // ID of the related entity
  latitude    Float
  longitude   Float
  accuracy    Float?   // GPS accuracy in meters
  altitude    Float?   // Altitude in meters
  heading     Float?   // Direction in degrees (0-360)
  speed       Float?   // Speed in m/s
  timestamp   DateTime @default(now())
  source      String?  // "gps", "manual", "api", etc.
  metadata    Json?    // Additional metadata
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([entityType, entityId])
  @@index([latitude, longitude])
  @@index([entityType, entityId])
  @@map("geo_locations")
}
```

### 3. Standardize Existing Geo-Location Fields

#### Keep Existing Fields (Backward Compatible)

**Farmers:**
```prisma
model farmers {
  // Keep existing fields for backward compatibility
  gpsLatitude   Float?  // GPS latitude (existing)
  gpsLongitude  Float?  // GPS longitude (existing)
  
  // Add standardized fields (optional, can migrate later)
  latitude      Float?  // Standardized latitude (WGS84)
  longitude     Float?  // Standardized longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([gpsLatitude, gpsLongitude]) // Keep existing index
  @@index([latitude, longitude])       // New index
}
```

**Milk Collections:**
```prisma
model milk_collections {
  // Keep existing JSON field for backward compatibility
  geolocation   Json?   // { lat, lng } or PostGIS point (existing)
  
  // Add standardized fields (optional, can migrate later)
  latitude      Float?  // Standardized latitude (WGS84)
  longitude     Float?  // Standardized longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([latitude, longitude]) // New index
}
```

---

## Migration Strategy

### Phase 1: Add New Fields (Non-Breaking)

**Migration Name**: `add_geo_location_fields`

**Strategy**: Add nullable fields only, no data migration required.

```sql
-- Migration: Add geo-location fields to entities
-- All fields are nullable for backward compatibility

-- 1. Add fields to mccs
ALTER TABLE "mccs" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 2. Add fields to warehouses
ALTER TABLE "warehouses" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 3. Add fields to mcc_customers
ALTER TABLE "mcc_customers" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 4. Add fields to suppliers
ALTER TABLE "suppliers" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 5. Add fields to users (for agents)
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 6. Add fields to mcc_warehouses
ALTER TABLE "mcc_warehouses" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 7. Add standardized fields to farmers (in addition to existing gpsLatitude/gpsLongitude)
ALTER TABLE "farmers" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 8. Add standardized fields to milk_collections (in addition to existing geolocation JSON)
ALTER TABLE "milk_collections" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- Create composite indexes for location queries
CREATE INDEX IF NOT EXISTS "mccs_latitude_longitude_idx" ON "mccs"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "warehouses_latitude_longitude_idx" ON "warehouses"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "mcc_customers_latitude_longitude_idx" ON "mcc_customers"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "suppliers_latitude_longitude_idx" ON "suppliers"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "users_latitude_longitude_idx" ON "users"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "mcc_warehouses_latitude_longitude_idx" ON "mcc_warehouses"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "farmers_latitude_longitude_idx" ON "farmers"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "milk_collections_latitude_longitude_idx" ON "milk_collections"("latitude", "longitude");
```

### Phase 2: Data Migration (Optional, Can Be Done Later)

**Migration Name**: `migrate_existing_geo_data`

**Strategy**: Migrate existing geo data to standardized fields.

```sql
-- Migration: Migrate existing geo data to standardized fields
-- This can be run later, after Phase 1 is deployed

-- 1. Migrate farmers: gpsLatitude/gpsLongitude -> latitude/longitude
UPDATE "farmers"
SET 
  "latitude" = "gpsLatitude",
  "longitude" = "gpsLongitude"
WHERE 
  "gpsLatitude" IS NOT NULL 
  AND "gpsLongitude" IS NOT NULL
  AND "latitude" IS NULL;

-- 2. Migrate milk_collections: geolocation JSON -> latitude/longitude
UPDATE "milk_collections"
SET 
  "latitude" = CAST("geolocation"->>'lat' AS DOUBLE PRECISION),
  "longitude" = CAST("geolocation"->>'lng' AS DOUBLE PRECISION)
WHERE 
  "geolocation" IS NOT NULL
  AND "geolocation"->>'lat' IS NOT NULL
  AND "geolocation"->>'lng' IS NOT NULL
  AND "latitude" IS NULL;
```

### Phase 3: Create GeoLocation Table (Optional, for future use)

**Migration Name**: `create_geo_location_table`

**Strategy**: Create reusable GeoLocation table for advanced spatial operations.

```sql
-- Migration: Create reusable GeoLocation table
-- This is optional and can be added later if needed

CREATE TABLE IF NOT EXISTS "geo_locations" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "accuracy" DOUBLE PRECISION,
  "altitude" DOUBLE PRECISION,
  "heading" DOUBLE PRECISION,
  "speed" DOUBLE PRECISION,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "source" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "geo_locations_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "geo_locations_entityType_entityId_key" 
ON "geo_locations"("entityType", "entityId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "geo_locations_latitude_longitude_idx" 
ON "geo_locations"("latitude", "longitude");

CREATE INDEX IF NOT EXISTS "geo_locations_entityType_entityId_idx" 
ON "geo_locations"("entityType", "entityId");
```

---

## Implementation Approach

### Step 1: Update Prisma Schema

**File**: `prisma/schema.prisma`

Add the geo-location fields to each entity as shown in the [Prisma Schema Changes](#prisma-schema-changes) section.

### Step 2: Generate Migration

```bash
# Generate migration (will create migration file)
npx prisma migrate dev --name add_geo_location_fields

# Or for production
npx prisma migrate deploy
```

### Step 3: Verify Migration

```sql
-- Verify fields were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mccs' 
  AND column_name IN ('latitude', 'longitude');

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'mccs' 
  AND indexname LIKE '%latitude%';
```

### Step 4: Update Prisma Client

```bash
# Regenerate Prisma Client
npx prisma generate
```

---

## Backward Compatibility

### Guarantees

1. ✅ **No Breaking Changes**
   - All new fields are nullable
   - Existing queries continue to work
   - No required data migration

2. ✅ **Existing Data Preserved**
   - `farmers.gpsLatitude` and `farmers.gpsLongitude` remain unchanged
   - `milk_collections.geolocation` JSON field remains unchanged
   - Can migrate data later if needed

3. ✅ **Optional Usage**
   - Entities can use geo-location or not
   - No validation required
   - Can be populated gradually

4. ✅ **Dual Support**
   - Support both old and new fields during transition
   - Can query either field set
   - Migration can happen gradually

### Migration Path

```
Current State
  ↓
Phase 1: Add new fields (nullable)
  ↓
[System continues to work with old fields]
  ↓
Phase 2: Migrate data (optional, can be done later)
  ↓
[Both old and new fields populated]
  ↓
Phase 3: Update application code to use new fields
  ↓
[Eventually deprecate old fields]
```

---

## Field Specifications

### Coordinate System

- **Standard**: WGS84 (EPSG:4326)
- **Latitude Range**: -90 to 90
- **Longitude Range**: -180 to 180
- **Precision**: Double precision (Float in Prisma)

### Validation (Application Level)

```typescript
// Validation function (to be used in application code, not in schema)
function validateCoordinates(lat: number | null, lng: number | null): boolean {
  if (lat === null || lng === null) return true; // Null is valid (optional)
  
  return (
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}
```

### Index Strategy

**Composite Index**: `(latitude, longitude)`
- Efficient for location-based queries
- Supports range queries (bounding box)
- Can be used for distance calculations

**Example Query**:
```sql
-- Find MCCs within bounding box
SELECT * FROM mccs
WHERE latitude BETWEEN -1.9 AND -1.8
  AND longitude BETWEEN 29.9 AND 30.1;
```

---

## Complete Prisma Schema Updates

### Summary of Changes

```prisma
// Entities to update:
// 1. mccs - Add latitude, longitude
// 2. Warehouse - Add latitude, longitude
// 3. mcc_customers - Add latitude, longitude
// 4. suppliers - Add latitude, longitude
// 5. User - Add latitude, longitude
// 6. mcc_warehouses - Add latitude, longitude
// 7. farmers - Add latitude, longitude (keep existing gpsLatitude/gpsLongitude)
// 8. milk_collections - Add latitude, longitude (keep existing geolocation JSON)

// Optional:
// 9. GeoLocation - New reusable table for advanced spatial operations
```

### Full Schema Snippets

See [Prisma Schema Changes](#prisma-schema-changes) section for complete field additions.

---

## Testing Strategy

### Unit Tests

```typescript
// Test that nullable fields work
describe('Geo-location fields', () => {
  it('should allow null latitude/longitude', async () => {
    const mcc = await prisma.mccs.create({
      data: {
        name: 'Test MCC',
        location: 'Test Location',
        latitude: null,
        longitude: null
      }
    });
    expect(mcc.latitude).toBeNull();
    expect(mcc.longitude).toBeNull();
  });

  it('should accept valid coordinates', async () => {
    const mcc = await prisma.mccs.create({
      data: {
        name: 'Test MCC',
        location: 'Test Location',
        latitude: -1.9441,
        longitude: 30.0619
      }
    });
    expect(mcc.latitude).toBe(-1.9441);
    expect(mcc.longitude).toBe(30.0619);
  });
});
```

### Integration Tests

```typescript
// Test index performance
describe('Geo-location queries', () => {
  it('should use composite index for location queries', async () => {
    const mccs = await prisma.mccs.findMany({
      where: {
        latitude: { gte: -2.0, lte: -1.8 },
        longitude: { gte: 29.9, lte: 30.1 }
      }
    });
    // Verify query performance
  });
});
```

---

## Rollback Strategy

### If Migration Fails

```sql
-- Rollback: Remove geo-location fields
ALTER TABLE "mccs" DROP COLUMN IF EXISTS "latitude";
ALTER TABLE "mccs" DROP COLUMN IF EXISTS "longitude";
ALTER TABLE "warehouses" DROP COLUMN IF EXISTS "latitude";
ALTER TABLE "warehouses" DROP COLUMN IF EXISTS "longitude";
-- ... repeat for all tables ...

-- Drop indexes
DROP INDEX IF EXISTS "mccs_latitude_longitude_idx";
DROP INDEX IF EXISTS "warehouses_latitude_longitude_idx";
-- ... repeat for all indexes ...
```

### If Need to Revert

- All fields are nullable, so removing them is safe
- No data loss (existing fields remain)
- Can rollback migration and regenerate Prisma client

---

## Summary

### Changes Summary

| Change | Type | Breaking | Priority |
|--------|------|----------|----------|
| Add `latitude`, `longitude` to mccs | Schema | ❌ No | 🔴 **HIGH** |
| Add `latitude`, `longitude` to Warehouse | Schema | ❌ No | 🔴 **HIGH** |
| Add `latitude`, `longitude` to mcc_customers | Schema | ❌ No | 🔴 **HIGH** |
| Add `latitude`, `longitude` to suppliers | Schema | ❌ No | 🔴 **HIGH** |
| Add `latitude`, `longitude` to User | Schema | ❌ No | 🔴 **HIGH** |
| Add `latitude`, `longitude` to mcc_warehouses | Schema | ❌ No | 🔴 **HIGH** |
| Add `latitude`, `longitude` to farmers | Schema | ❌ No | 🟡 **MEDIUM** |
| Add `latitude`, `longitude` to milk_collections | Schema | ❌ No | 🟡 **MEDIUM** |
| Create GeoLocation table | Schema | ❌ No | 🟢 **LOW** (Optional) |

### Migration Steps

1. ✅ Update Prisma schema
2. ✅ Generate migration
3. ✅ Review migration SQL
4. ✅ Run migration (non-breaking)
5. ✅ Regenerate Prisma client
6. ✅ Test with existing data
7. ⚠️ Optional: Migrate existing geo data later

### Key Benefits

- ✅ **Backward Compatible**: No breaking changes
- ✅ **Optional**: Geo-location is optional for all entities
- ✅ **Flexible**: Support both simple and advanced needs
- ✅ **Performant**: Composite indexes for efficient queries
- ✅ **Standardized**: Consistent field names across entities

---

**Document Status**: ✅ Complete - Ready for Implementation

**Next Steps**:
1. Review and approve schema changes
2. Generate Prisma migration
3. Test migration on development database
4. Deploy to production
