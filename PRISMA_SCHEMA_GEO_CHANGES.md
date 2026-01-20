# Prisma Schema Geo-Location Changes

**Quick Reference**: Exact schema changes needed

---

## Schema Changes Summary

Add the following fields to each model:

### 1. mccs Model

```prisma
model mccs {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84)
  longitude   Float?  // Geo-location longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([code])
  @@index([managerUserId])
  @@index([latitude, longitude]) // NEW: Composite index for location queries
}
```

### 2. Warehouse Model

```prisma
model Warehouse {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84)
  longitude   Float?  // Geo-location longitude (WGS84)
  
  // ... rest of fields ...
  
  @@map("warehouses")
  @@index([latitude, longitude]) // NEW: Composite index for location queries
}
```

### 3. mcc_customers Model

```prisma
model mcc_customers {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84)
  longitude   Float?  // Geo-location longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([mccId])
  @@index([name])
  @@index([contact])
  @@index([latitude, longitude]) // NEW: Composite index for location queries
  @@map("mcc_customers")
}
```

### 4. suppliers Model

```prisma
model suppliers {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84)
  longitude   Float?  // Geo-location longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([latitude, longitude]) // NEW: Composite index for location queries
}
```

### 5. User Model

```prisma
model User {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84) - for agents
  longitude   Float?  // Geo-location longitude (WGS84) - for agents
  
  // ... rest of fields ...
  
  @@index([mccId])
  @@index([pharmacyId])
  @@index([latitude, longitude]) // NEW: Composite index for location queries
  @@map("users")
}
```

### 6. mcc_warehouses Model

```prisma
model mcc_warehouses {
  // ... existing fields ...
  latitude    Float?  // Geo-location latitude (WGS84)
  longitude   Float?  // Geo-location longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([mccId])
  @@index([latitude, longitude]) // NEW: Composite index for location queries
}
```

### 7. farmers Model (Standardize existing fields)

```prisma
model farmers {
  // ... existing fields ...
  gpsLatitude   Float?  // GPS latitude (existing - keep for backward compatibility)
  gpsLongitude  Float?  // GPS longitude (existing - keep for backward compatibility)
  
  // NEW: Standardized fields
  latitude      Float?  // Standardized latitude (WGS84)
  longitude     Float?  // Standardized longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([mccId])
  @@index([phone])
  @@index([farmerCode])
  @@index([nfcId])
  @@index([nationalId])
  @@index([latitude, longitude]) // NEW: Composite index for location queries
}
```

### 8. milk_collections Model (Standardize existing fields)

```prisma
model milk_collections {
  // ... existing fields ...
  geolocation   Json?   // { lat, lng } or PostGIS point (existing - keep for backward compatibility)
  
  // NEW: Standardized fields
  latitude      Float?  // Standardized latitude (WGS84)
  longitude     Float?  // Standardized longitude (WGS84)
  
  // ... rest of fields ...
  
  @@index([collectionDate])
  @@index([farmerId])
  @@index([productId])
  @@index([stockMoveId])
  @@index([sampleTag])
  @@index([agentId])
  @@index([mccId])
  @@index([qualityStatus])
  @@index([latitude, longitude]) // NEW: Composite index for location queries
}
```

---

## Optional: GeoLocation Table (For Future Use)

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

---

## Implementation Checklist

- [ ] Update Prisma schema with geo-location fields
- [ ] Generate migration: `npx prisma migrate dev --name add_geo_location_fields`
- [ ] Review generated migration SQL
- [ ] Test migration on development database
- [ ] Regenerate Prisma client: `npx prisma generate`
- [ ] Verify indexes were created
- [ ] Test with existing data (should work without geo data)
- [ ] Deploy to production

---

**Note**: All fields are nullable, so this migration is completely backward compatible.
