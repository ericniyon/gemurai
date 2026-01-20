# Prisma Schema Changes for Geo-Governance

**Quick Reference**: Exact schema changes needed

---

## 1. Add Consent Flags to Entities

### farmers Model

```prisma
model farmers {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
  
  // ... rest of fields ...
}
```

### mccs Model

```prisma
model mccs {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
  
  // ... rest of fields ...
}
```

### User Model

```prisma
model User {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
  
  // ... rest of fields ...
}
```

### Warehouse Model

```prisma
model Warehouse {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
  
  // ... rest of fields ...
}
```

### mcc_customers Model

```prisma
model mcc_customers {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
  
  // ... rest of fields ...
}
```

### suppliers Model

```prisma
model suppliers {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
  
  // ... rest of fields ...
}
```

---

## 2. Create Audit Log Table

```prisma
model geoAuditLog {
  id          String   @id @default(cuid())
  userId      String
  userName    String?
  userRole    String?
  action      String   // CREATE, UPDATE, DELETE, VIEW, EXPORT, CONSENT_GRANTED, CONSENT_REVOKED, ACCESS_DENIED
  entityType  String   // farmer, agent, mcc, warehouse, customer, supplier, milk_collection
  entityId    String
  entityName  String?
  oldValue    String?  // JSON: { latitude, longitude }
  newValue    String?  // JSON: { latitude, longitude }
  ipAddress   String?
  userAgent   String?
  metadata    String?  // JSON: additional context
  timestamp   DateTime @default(now())
  
  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([timestamp])
  @@map("geo_audit_logs")
}
```

---

## Migration SQL

See `prisma/migrations/202501XX000001_add_geo_governance/migration.sql`

---

## Implementation Steps

1. Update Prisma schema
2. Generate migration: `npx prisma migrate dev --name add_geo_governance`
3. Review migration SQL
4. Run migration
5. Regenerate Prisma client: `npx prisma generate`

---

**Note**: All fields are nullable for backward compatibility.
