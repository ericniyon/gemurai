# Governance, Consent & Audit Proposal for Geo-Location Data

**Document Version:** 1.0  
**Date:** 2025-01-XX  
**Purpose:** Add governance, consent, and audit features for geo-location data protection

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Consent Management](#consent-management)
3. [Audit Logging](#audit-logging)
4. [Access Control](#access-control)
5. [Database Schema Changes](#database-schema-changes)
6. [Implementation Plan](#implementation-plan)

---

## Executive Summary

This proposal adds comprehensive governance, consent, and audit features for geo-location data:

- ✅ **Geo-Location Consent Flags** - Explicit consent for location collection, storage, and usage
- ✅ **Audit Logs** - Complete audit trail for all geo-data operations
- ✅ **Role-Based Access** - Enforced access control for geo-data operations
- ✅ **Compliance** - GDPR/privacy compliance features
- ✅ **Transparency** - Full audit trail for accountability

### Key Features

| Feature | Purpose | Status |
|---------|---------|--------|
| **Consent Flags** | Track user consent for geo-data | 🔴 To Implement |
| **Audit Logs** | Track all geo-data operations | 🔴 To Implement |
| **Access Control** | Enforce role-based permissions | 🔴 To Implement |
| **Consent Management** | Grant/withdraw consent | 🔴 To Implement |
| **Audit Reports** | View audit trail | 🔴 To Implement |

---

## Consent Management

### Consent Flag Structure

```typescript
interface GeoConsentFlags {
  locationCollectionConsent: boolean  // Required - consent to collect location
  locationStorageConsent: boolean     // Required - consent to store location
  locationSharingConsent?: boolean    // Optional - consent to share with third parties
  locationAnalyticsConsent?: boolean  // Optional - consent for analytics use
  locationMappingConsent?: boolean    // Optional - consent for map visualization
  consentDate?: Date                  // When consent was given
  consentVersion?: string             // Version of consent terms
  consentWithdrawnDate?: Date         // When consent was withdrawn
  consentNotes?: string               // Additional notes
}
```

### Consent Storage

**Option 1: Entity-Level Consent (Recommended)**
- Store consent flags in each entity table (farmers, mccs, etc.)
- JSON field: `geoConsentFlags`
- Allows entity-specific consent management

**Option 2: Centralized Consent Table**
- Separate `geo_consent` table
- Links to entities via `entityType` and `entityId`
- Centralized consent management

### Consent Workflow

```
1. User/Entity Onboarding
   ↓
2. Request Geo-Location Consent
   ↓
3. User Grants/Denies Consent
   ↓
4. Store Consent Flags
   ↓
5. Log Consent Action (Audit)
   ↓
6. Enforce Consent in Operations
```

### Consent Validation

- ✅ **Required Consents**: `locationCollectionConsent` and `locationStorageConsent`
- ✅ **Active Check**: Consent not withdrawn
- ✅ **Date Validation**: Withdrawal date after consent date
- ✅ **Version Tracking**: Track consent terms version

---

## Audit Logging

### Audit Log Model

**File**: `prisma/schema.prisma`

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

### Audit Actions

| Action | Description | When Logged |
|--------|-------------|-------------|
| **CREATE** | Geo-data created | On entity creation with location |
| **UPDATE** | Geo-data updated | On location update |
| **DELETE** | Geo-data deleted | On location removal |
| **VIEW** | Geo-data viewed | On location access |
| **EXPORT** | Geo-data exported | On data export |
| **CONSENT_GRANTED** | Consent given | On consent grant |
| **CONSENT_REVOKED** | Consent withdrawn | On consent withdrawal |
| **ACCESS_DENIED** | Access denied | On unauthorized access attempt |

### Audit Service

**File**: `lib/services/geo-audit-service.ts`

**Functions:**
- `logGeoOperation()` - Create audit log entry
- `getEntityAuditLogs()` - Get logs for entity
- `getUserAuditLogs()` - Get logs for user
- `getAllAuditLogs()` - Get all logs (admin only)

---

## Access Control

### Role-Based Permissions

| Role | View | Create | Update | Delete | Export |
|------|------|--------|--------|--------|--------|
| **SUPER_ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MCC_MANAGER** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **FIELD_AGENT** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **AGENT** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ACCOUNTANT** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **FARMER** | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| **Other Roles** | ❌ | ❌ | ❌ | ❌ | ❌ |

### Access Control Service

**File**: `lib/utils/geo-access-control.ts`

**Functions:**
- `canPerformGeoOperation()` - Check operation permission
- `canViewGeoData()` - Check view permission
- `canEditGeoData()` - Check edit permission
- `getRequiredPermissions()` - Get required permissions

---

## Database Schema Changes

### 1. Add Consent Flags to Entities

```prisma
// Add to farmers model
model farmers {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
}

// Add to mccs model
model mccs {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
}

// Add to User model (for agents)
model User {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
}

// Add to Warehouse model
model Warehouse {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
}

// Add to mcc_customers model
model mcc_customers {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
}

// Add to suppliers model
model suppliers {
  // ... existing fields ...
  geoConsentFlags Json? // Geo-location consent flags
}
```

### 2. Create Audit Log Table

```prisma
model geoAuditLog {
  id          String   @id @default(cuid())
  userId      String
  userName    String?
  userRole    String?
  action      String
  entityType  String
  entityId    String
  entityName  String?
  oldValue    String?
  newValue    String?
  ipAddress   String?
  userAgent   String?
  metadata    String?
  timestamp   DateTime @default(now())
  
  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([timestamp])
  @@map("geo_audit_logs")
}
```

### 3. Migration SQL

```sql
-- Add consent flags to entities
ALTER TABLE "farmers" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "mccs" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "mcc_customers" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;

-- Create audit log table
CREATE TABLE IF NOT EXISTS "geo_audit_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT,
  "userRole" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "entityName" TEXT,
  "oldValue" TEXT,
  "newValue" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "geo_audit_logs_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "geo_audit_logs_userId_idx" ON "geo_audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_entityType_entityId_idx" ON "geo_audit_logs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_action_idx" ON "geo_audit_logs"("action");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_timestamp_idx" ON "geo_audit_logs"("timestamp");
```

---

## Implementation Plan

### Phase 1: Database Schema

- [ ] Add `geoConsentFlags` JSON field to all entities
- [ ] Create `geoAuditLog` table
- [ ] Create indexes
- [ ] Run migration

### Phase 2: Consent Management

- [x] Create `geo-consent.ts` utility
- [ ] Add consent capture to onboarding forms
- [ ] Add consent management UI
- [ ] Add consent validation

### Phase 3: Audit Logging

- [x] Create `geo-audit-service.ts`
- [ ] Integrate audit logging into API endpoints
- [ ] Add audit log viewing UI
- [ ] Add audit log export

### Phase 4: Access Control

- [x] Create `geo-access-control.ts`
- [ ] Integrate access checks into API endpoints
- [ ] Add access denied logging
- [ ] Add permission error messages

### Phase 5: Integration

- [ ] Update farmer location endpoint
- [ ] Update MCC location endpoint
- [ ] Update warehouse location endpoint
- [ ] Update agent location endpoint
- [ ] Add consent checks to all operations

### Phase 6: UI Components

- [ ] Create consent management component
- [ ] Create audit log viewer component
- [ ] Add consent status display
- [ ] Add audit trail display

---

## API Endpoint Updates

### Update Farmer Location Endpoint

**File**: `app/api/v1/mcc/farmers/[id]/location/route.ts`

**Add:**
1. Consent check before operation
2. Access control check
3. Audit logging
4. Consent validation

```typescript
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // 1. Authenticate
  const user = await verifyAuthToken(authToken)
  
  // 2. Check access control
  const accessCheck = canEditGeoData(user.role, "farmer", params.id, user.id)
  if (!accessCheck.allowed) {
    await GeoAuditService.logGeoOperation({
      userId: user.id,
      action: "ACCESS_DENIED",
      entityType: "farmer",
      entityId: params.id,
      metadata: { reason: accessCheck.reason }
    })
    return NextResponse.json({ error: accessCheck.reason }, { status: 403 })
  }
  
  // 3. Check consent
  const farmer = await prisma.farmers.findUnique({ where: { id: params.id } })
  const consentStatus = getConsentStatus(farmer?.geoConsentFlags as any)
  if (!consentStatus.canStore) {
    return NextResponse.json(
      { error: "Location storage consent not granted" },
      { status: 403 }
    )
  }
  
  // 4. Get old value for audit
  const oldValue = {
    latitude: farmer?.latitude ?? null,
    longitude: farmer?.longitude ?? null
  }
  
  // 5. Update location
  const updated = await prisma.farmers.update({
    where: { id: params.id },
    data: { latitude, longitude }
  })
  
  // 6. Log audit
  await GeoAuditService.logGeoOperation({
    userId: user.id,
    action: "UPDATE",
    entityType: "farmer",
    entityId: params.id,
    entityName: farmer?.name,
    oldValue,
    newValue: { latitude, longitude },
    ipAddress: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined
  })
  
  return NextResponse.json({ success: true, data: updated })
}
```

---

## Consent Management UI

### Consent Capture Component

**File**: `components/ui/geo-consent-form.tsx`

**Features:**
- Consent checkboxes
- Consent version display
- Consent date capture
- Consent withdrawal option

### Consent Status Display

**File**: `components/ui/geo-consent-status.tsx`

**Features:**
- Show consent status
- Show consent flags
- Show consent date
- Show withdrawal date (if any)

---

## Audit Log Viewer

### Audit Log Component

**File**: `components/audit/GeoAuditLogViewer.tsx`

**Features:**
- Filter by entity type
- Filter by action
- Filter by date range
- Export audit logs
- View audit details

---

## Compliance Features

### GDPR Compliance

- ✅ **Right to Access** - Users can view their geo-data
- ✅ **Right to Rectification** - Users can update their geo-data
- ✅ **Right to Erasure** - Users can delete their geo-data
- ✅ **Right to Withdraw Consent** - Users can withdraw consent
- ✅ **Audit Trail** - Complete audit trail for compliance

### Transparency

- ✅ **Consent Tracking** - Track when and how consent was given
- ✅ **Access Logs** - Log all access to geo-data
- ✅ **Change History** - Track all changes to geo-data
- ✅ **Audit Reports** - Generate compliance reports

---

## Summary

### Components Created

| Component | File | Purpose |
|-----------|------|---------|
| **GeoConsent** | `lib/utils/geo-consent.ts` | Consent management utilities |
| **GeoAuditService** | `lib/services/geo-audit-service.ts` | Audit logging service |
| **GeoAccessControl** | `lib/utils/geo-access-control.ts` | Access control utilities |

### Database Changes

| Change | Type | Priority |
|--------|------|----------|
| Add `geoConsentFlags` to entities | Schema | 🔴 **HIGH** |
| Create `geoAuditLog` table | Schema | 🔴 **HIGH** |
| Create indexes | Schema | 🔴 **HIGH** |

### Key Features

- ✅ **Consent Management** - Track and manage geo-location consent
- ✅ **Audit Logging** - Complete audit trail
- ✅ **Access Control** - Role-based enforcement
- ✅ **Compliance** - GDPR/privacy compliance
- ✅ **Transparency** - Full accountability

---

**Document Status**: ✅ Complete - Ready for Implementation

**Next Steps**:
1. Review and approve schema changes
2. Create database migration
3. Integrate into API endpoints
4. Create UI components
5. Test compliance features
6. Deploy to production
