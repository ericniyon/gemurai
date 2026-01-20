# Governance, Consent & Audit Implementation Summary

**Status**: ✅ **Proposal Complete - Ready for Review**

---

## What Was Created

### 1. Consent Management Utilities

**File**: `lib/utils/geo-consent.ts`

**Functions:**
- ✅ `validateGeoConsent()` - Validate consent flags
- ✅ `isConsentActive()` - Check if consent is active
- ✅ `getConsentStatus()` - Get consent status
- ✅ `createDefaultConsentFlags()` - Create default flags
- ✅ `grantConsent()` - Grant consent
- ✅ `withdrawConsent()` - Withdraw consent

### 2. Audit Logging Service

**File**: `lib/services/geo-audit-service.ts`

**Functions:**
- ✅ `logGeoOperation()` - Create audit log entry
- ✅ `getEntityAuditLogs()` - Get logs for entity
- ✅ `getUserAuditLogs()` - Get logs for user
- ✅ `getAllAuditLogs()` - Get all logs (admin only)

### 3. Access Control Utilities

**File**: `lib/utils/geo-access-control.ts`

**Functions:**
- ✅ `canPerformGeoOperation()` - Check operation permission
- ✅ `canViewGeoData()` - Check view permission
- ✅ `canEditGeoData()` - Check edit permission
- ✅ `getRequiredPermissions()` - Get required permissions

### 4. UI Components

**Files:**
- ✅ `components/ui/geo-consent-form.tsx` - Consent management form
- ✅ `components/audit/GeoAuditLogViewer.tsx` - Audit log viewer

### 5. API Endpoints

**Files:**
- ✅ `app/api/v1/geo/audit-logs/route.ts` - Get audit logs (admin only)

### 6. Documentation

**Files:**
- ✅ `GOVERNANCE_CONSENT_AUDIT_PROPOSAL.md` - Complete proposal
- ✅ `GOVERNANCE_IMPLEMENTATION_SUMMARY.md` - This summary

---

## Consent Flag Structure

```typescript
interface GeoConsentFlags {
  locationCollectionConsent: boolean  // Required
  locationStorageConsent: boolean     // Required
  locationSharingConsent?: boolean    // Optional
  locationAnalyticsConsent?: boolean // Optional
  locationMappingConsent?: boolean   // Optional
  consentDate?: Date
  consentVersion?: string
  consentWithdrawnDate?: Date
  consentNotes?: string
}
```

---

## Access Control Matrix

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

---

## Audit Actions Tracked

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

---

## Database Schema Changes

### 1. Add Consent Flags

```sql
ALTER TABLE "farmers" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "mccs" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "mcc_customers" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
```

### 2. Create Audit Log Table

```sql
CREATE TABLE "geo_audit_logs" (
  "id" TEXT PRIMARY KEY,
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
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## Integration Example

### Updated Farmer Location Endpoint

**File**: `app/api/v1/mcc/farmers/[id]/location/route.ts`

```typescript
import { GeoAuditService } from "@/lib/services/geo-audit-service"
import { canEditGeoData } from "@/lib/utils/geo-access-control"
import { getConsentStatus } from "@/lib/utils/geo-consent"

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
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
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

## Quick Usage Examples

### 1. Check Consent

```typescript
import { getConsentStatus } from "@/lib/utils/geo-consent"

const consentStatus = getConsentStatus(farmer.geoConsentFlags)
if (!consentStatus.canStore) {
  // Cannot store location
}
```

### 2. Check Access

```typescript
import { canEditGeoData } from "@/lib/utils/geo-access-control"

const accessCheck = canEditGeoData(user.role, "farmer", farmerId, userId)
if (!accessCheck.allowed) {
  // Access denied
}
```

### 3. Log Audit

```typescript
import { GeoAuditService } from "@/lib/services/geo-audit-service"

await GeoAuditService.logGeoOperation({
  userId: user.id,
  action: "UPDATE",
  entityType: "farmer",
  entityId: farmerId,
  oldValue: { latitude: oldLat, longitude: oldLng },
  newValue: { latitude: newLat, longitude: newLng }
})
```

### 4. View Audit Logs

```tsx
import { GeoAuditLogViewer } from "@/components/audit/GeoAuditLogViewer"

<GeoAuditLogViewer
  entityType="farmer"
  entityId={farmerId}
/>
```

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

## Implementation Checklist

### Phase 1: Database
- [ ] Add `geoConsentFlags` to all entities
- [ ] Create `geoAuditLog` table
- [ ] Create indexes
- [ ] Run migration

### Phase 2: Services
- [x] Create consent utilities
- [x] Create audit service
- [x] Create access control utilities

### Phase 3: API Integration
- [ ] Update farmer location endpoint
- [ ] Update MCC location endpoint
- [ ] Update warehouse location endpoint
- [ ] Update agent location endpoint
- [ ] Add consent checks
- [ ] Add access control checks
- [ ] Add audit logging

### Phase 4: UI Components
- [x] Create consent form component
- [x] Create audit log viewer
- [ ] Integrate into entity views
- [ ] Add consent status display

### Phase 5: Testing
- [ ] Test consent management
- [ ] Test access control
- [ ] Test audit logging
- [ ] Test compliance features

---

## Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `lib/utils/geo-consent.ts` | Consent management utilities | ✅ Created |
| `lib/services/geo-audit-service.ts` | Audit logging service | ✅ Created |
| `lib/utils/geo-access-control.ts` | Access control utilities | ✅ Created |
| `components/ui/geo-consent-form.tsx` | Consent form component | ✅ Created |
| `components/audit/GeoAuditLogViewer.tsx` | Audit log viewer | ✅ Created |
| `app/api/v1/geo/audit-logs/route.ts` | Audit logs API | ✅ Created |
| `GOVERNANCE_CONSENT_AUDIT_PROPOSAL.md` | Complete proposal | ✅ Created |
| `GOVERNANCE_IMPLEMENTATION_SUMMARY.md` | Summary | ✅ Created |

---

## Benefits

### For Farmers
- ✅ **Control** - Control over their location data
- ✅ **Transparency** - See who accessed their data
- ✅ **Compliance** - GDPR/privacy compliant

### For System
- ✅ **Security** - Role-based access enforcement
- ✅ **Compliance** - Full audit trail
- ✅ **Accountability** - Track all operations

### For Administrators
- ✅ **Audit Trail** - Complete operation history
- ✅ **Access Control** - Enforced permissions
- ✅ **Compliance Reports** - Generate reports

---

**Status**: ✅ **Ready for Review and Approval**

All utilities, services, components, and documentation are complete. Ready to integrate into API endpoints and UI.
