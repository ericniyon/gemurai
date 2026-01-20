# Geo-Location Data Integration Proposal

**Document Version:** 1.0  
**Date:** 2025-01-XX  
**Purpose:** Link geo-location data to existing entities with read-only access and admin-only editing

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Component Design](#component-design)
3. [Entity Integration](#entity-integration)
4. [Access Control](#access-control)
5. [API Endpoints](#api-endpoints)
6. [Implementation Plan](#implementation-plan)

---

## Executive Summary

This proposal links geo-location data to existing entities with:

- ✅ **Read-only display** for all users
- ✅ **Admin-only editing** (SUPER_ADMIN, ADMIN roles)
- ✅ **No impact on existing workflows**
- ✅ **Reusable components** for consistent UI

### Entities to Link

| Entity | Display Location | Edit Location | Status |
|--------|-----------------|---------------|--------|
| **Farmers** | Farmer detail/view dialog | Edit farmer dialog (admin only) | 🔴 To Implement |
| **Agents (Abacunda)** | Agent profile/view | Edit agent (admin only) | 🔴 To Implement |
| **Farms/Plots** | Farmer detail (as part of farmer) | Edit farmer (admin only) | 🔴 To Implement |
| **MCCs** | MCC detail/view page | Edit MCC (admin only) | 🔴 To Implement |
| **Warehouses** | Warehouse detail/view | Edit warehouse (admin only) | 🔴 To Implement |

---

## Component Design

### 1. GeoLocationDisplay Component

**File**: `components/ui/geo-location-display.tsx`

**Purpose**: Read-only display of geo-location data

**Features:**
- Shows coordinates in readable format
- Copy coordinates to clipboard
- Links to Google Maps and OpenStreetMap
- Compact mode for tables/lists
- Full mode for detail pages
- Handles missing location gracefully

**Props:**
```typescript
interface GeoLocationDisplayProps {
  latitude: number | null | undefined
  longitude: number | null | undefined
  className?: string
  title?: string
  description?: string
  showMapLink?: boolean
  compact?: boolean
}
```

**Usage:**
```tsx
<GeoLocationDisplay
  latitude={farmer.latitude}
  longitude={farmer.longitude}
  title="Farmer Location"
  description="GPS coordinates for this farmer"
  showMapLink={true}
/>
```

### 2. GeoLocationEditor Component

**File**: `components/ui/geo-location-editor.tsx`

**Purpose**: Admin-only editing of geo-location data

**Features:**
- Read-only mode for non-admin users
- Edit mode for admin users
- Uses `GeoLocationInput` for editing
- Save/cancel functionality
- Visual indicator for read-only state

**Props:**
```typescript
interface GeoLocationEditorProps {
  latitude: number | null | undefined
  longitude: number | null | undefined
  onSave?: (location: { latitude: number | null; longitude: number | null }) => Promise<void>
  canEdit?: boolean
  className?: string
  title?: string
  description?: string
  entityType?: string
  entityId?: string
}
```

**Usage:**
```tsx
<GeoLocationEditor
  latitude={farmer.latitude}
  longitude={farmer.longitude}
  onSave={async (location) => {
    await updateFarmerLocation(farmer.id, location)
  }}
  canEdit={userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'}
  title="Farmer Location"
  entityType="farmer"
  entityId={farmer.id}
/>
```

---

## Entity Integration

### 1. Farmers

#### Display Location

**File**: `app/[lang]/dashboard/mcc/page.tsx`

**Current**: View Farmer Dialog (lines 1217-1245)

**Add After Location Field:**
```tsx
<div>
  <p className="text-sm text-gray-500">Location</p>
  <p className="font-medium">{(selectedFarmer as any)?.location || 'N/A'}</p>
</div>

{/* Add Geo-Location Display */}
<GeoLocationDisplay
  latitude={(selectedFarmer as any)?.latitude}
  longitude={(selectedFarmer as any)?.longitude}
  title="GPS Location"
  description="Precise location coordinates"
  compact={false}
/>
```

#### Edit Location (Admin Only)

**File**: `app/[lang]/dashboard/mcc/page.tsx`

**Current**: Edit Farmer Dialog (lines 1247-1286)

**Add After Location Field:**
```tsx
{/* Add Geo-Location Editor */}
<GeoLocationEditor
  latitude={editFormData.latitude}
  longitude={editFormData.longitude}
  onSave={async (location) => {
    const token = localStorage.getItem("Gemurai_token")
    const response = await fetch(`/api/v1/mcc/farmers/${selectedFarmer?.id}/location`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(location)
    })
    if (response.ok) {
      toast.success("Location updated successfully")
      fetchFarmers()
    } else {
      toast.error("Failed to update location")
    }
  }}
  canEdit={user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'}
  title="GPS Location"
  entityType="farmer"
  entityId={selectedFarmer?.id}
/>
```

#### Table Display (Compact)

**File**: `app/[lang]/dashboard/mcc/page.tsx`

**Current**: Farmers table (lines 830-896)

**Add Column:**
```tsx
<TableHead>Location</TableHead>
```

```tsx
<TableCell>
  <GeoLocationDisplay
    latitude={farmer.latitude}
    longitude={farmer.longitude}
    compact={true}
    showMapLink={false}
  />
</TableCell>
```

---

### 2. Agents (Abacunda)

#### Display Location

**File**: (To be identified - agent profile/view page)

**Add:**
```tsx
<GeoLocationDisplay
  latitude={agent.latitude}
  longitude={agent.longitude}
  title="Agent Location"
  description="GPS coordinates for this agent"
/>
```

#### Edit Location (Admin Only)

**File**: (To be identified - agent edit page)

**Add:**
```tsx
<GeoLocationEditor
  latitude={agent.latitude}
  longitude={agent.longitude}
  onSave={async (location) => {
    await updateAgentLocation(agent.id, location)
  }}
  canEdit={userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'}
  title="Agent Location"
  entityType="agent"
  entityId={agent.id}
/>
```

---

### 3. Farms/Plots

**Note**: Farms/plots are part of farmer data. Use farmer location or add separate plot location fields if needed.

**Display**: Same as farmer location display

**Edit**: Same as farmer location edit (admin only)

---

### 4. MCCs

#### Display Location

**File**: `app/superadmin/mccs/page.tsx`

**Current**: MCC table (lines 187-242)

**Add Column:**
```tsx
<TableHead>Location</TableHead>
```

```tsx
<TableCell>
  <GeoLocationDisplay
    latitude={mcc.latitude}
    longitude={mcc.longitude}
    compact={true}
  />
</TableCell>
```

#### Edit Location (Admin Only)

**File**: `app/superadmin/mccs/[id]/page.tsx` or edit dialog

**Add:**
```tsx
<GeoLocationEditor
  latitude={mcc.latitude}
  longitude={mcc.longitude}
  onSave={async (location) => {
    await updateMCCLocation(mcc.id, location)
  }}
  canEdit={userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'}
  title="MCC Location"
  entityType="mcc"
  entityId={mcc.id}
/>
```

---

### 5. Warehouses

#### Display Location

**File**: `app/components/inventory/WarehouseManagement.tsx`

**Current**: Warehouse table

**Add Column:**
```tsx
<TableHead>Location</TableHead>
```

```tsx
<TableCell>
  <GeoLocationDisplay
    latitude={warehouse.latitude}
    longitude={warehouse.longitude}
    compact={true}
  />
</TableCell>
```

#### Edit Location (Admin Only)

**File**: `app/components/inventory/WarehouseManagement.tsx`

**Current**: Create/Edit Warehouse Dialog

**Add After Address Fields:**
```tsx
<GeoLocationEditor
  latitude={formData.latitude}
  longitude={formData.longitude}
  onSave={async (location) => {
    // Include in warehouse update
    const warehouseData = {
      ...formData,
      latitude: location.latitude,
      longitude: location.longitude,
    }
    await updateWarehouse(warehouse.id, warehouseData)
  }}
  canEdit={userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'}
  title="Warehouse Location"
  entityType="warehouse"
  entityId={warehouse.id}
/>
```

---

## Access Control

### Role-Based Permissions

| Role | View Geo-Location | Edit Geo-Location |
|------|------------------|-------------------|
| **SUPER_ADMIN** | ✅ Yes | ✅ Yes |
| **ADMIN** | ✅ Yes | ✅ Yes |
| **MCC_MANAGER** | ✅ Yes | ❌ No |
| **FIELD_AGENT** | ✅ Yes | ❌ No |
| **Other Roles** | ✅ Yes | ❌ No |

### Implementation

**Check Edit Permission:**
```typescript
const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
```

**Component Usage:**
```tsx
<GeoLocationEditor
  canEdit={canEdit}
  // ... other props
/>
```

---

## API Endpoints

### 1. Update Farmer Location

**Endpoint**: `PUT /api/v1/mcc/farmers/[id]/location`

**File**: `app/api/v1/mcc/farmers/[id]/location/route.ts`

**Authorization**: SUPER_ADMIN or ADMIN only

**Request:**
```json
{
  "latitude": -1.9441,
  "longitude": 30.0619
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "id": "farmer_id",
    "latitude": -1.9441,
    "longitude": 30.0619
  }
}
```

**Implementation:**
```typescript
import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { latitude, longitude } = body

    // Validate coordinates
    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      return NextResponse.json(
        { error: "Invalid latitude. Must be between -90 and 90." },
        { status: 400 }
      )
    }
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      return NextResponse.json(
        { error: "Invalid longitude. Must be between -180 and 180." },
        { status: 400 }
      )
    }

    const updated = await prisma.farmers.update({
      where: { id: params.id },
      data: {
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Location updated successfully",
      data: {
        id: updated.id,
        latitude: updated.latitude,
        longitude: updated.longitude,
      },
    })
  } catch (error) {
    console.error("Update farmer location error:", error)
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    )
  }
}
```

### 2. Update MCC Location

**Endpoint**: `PUT /api/v1/mcc/[id]/location`

**File**: `app/api/v1/mcc/[id]/location/route.ts`

**Authorization**: SUPER_ADMIN or ADMIN only

**Similar implementation to farmer location endpoint**

### 3. Update Warehouse Location

**Endpoint**: `PUT /api/v1/superadmin/warehouses/[id]/location`

**File**: `app/api/v1/superadmin/warehouses/[id]/location/route.ts`

**Authorization**: SUPER_ADMIN or ADMIN only

**Similar implementation to farmer location endpoint**

### 4. Update Agent Location

**Endpoint**: `PUT /api/v1/users/[id]/location`

**File**: `app/api/v1/users/[id]/location/route.ts`

**Authorization**: SUPER_ADMIN or ADMIN only

**Similar implementation to farmer location endpoint**

---

## Implementation Plan

### Phase 1: Components

- [x] Create `GeoLocationDisplay` component
- [x] Create `GeoLocationEditor` component
- [ ] Test components in isolation

### Phase 2: API Endpoints

- [ ] Create farmer location update endpoint
- [ ] Create MCC location update endpoint
- [ ] Create warehouse location update endpoint
- [ ] Create agent location update endpoint
- [ ] Test all endpoints with proper authorization

### Phase 3: Farmer Integration

- [ ] Add geo-location display to farmer view dialog
- [ ] Add geo-location editor to farmer edit dialog (admin only)
- [ ] Add compact geo-location to farmers table
- [ ] Test farmer location updates

### Phase 4: MCC Integration

- [ ] Add geo-location display to MCC detail pages
- [ ] Add geo-location editor to MCC edit (admin only)
- [ ] Add compact geo-location to MCC table
- [ ] Test MCC location updates

### Phase 5: Warehouse Integration

- [ ] Add geo-location display to warehouse detail
- [ ] Add geo-location editor to warehouse edit (admin only)
- [ ] Add compact geo-location to warehouse table
- [ ] Test warehouse location updates

### Phase 6: Agent Integration

- [ ] Identify agent profile/view pages
- [ ] Add geo-location display to agent views
- [ ] Add geo-location editor to agent edit (admin only)
- [ ] Test agent location updates

### Phase 7: Testing & Validation

- [ ] Test read-only access for non-admin users
- [ ] Test edit access for admin users
- [ ] Test all error scenarios
- [ ] Verify no impact on existing workflows
- [ ] Test on various devices and browsers

---

## Summary

### Components Created

| Component | File | Purpose |
|-----------|------|---------|
| **GeoLocationDisplay** | `components/ui/geo-location-display.tsx` | Read-only display |
| **GeoLocationEditor** | `components/ui/geo-location-editor.tsx` | Admin-only editing |

### API Endpoints Needed

| Endpoint | Method | Authorization |
|----------|--------|---------------|
| `/api/v1/mcc/farmers/[id]/location` | PUT | SUPER_ADMIN, ADMIN |
| `/api/v1/mcc/[id]/location` | PUT | SUPER_ADMIN, ADMIN |
| `/api/v1/superadmin/warehouses/[id]/location` | PUT | SUPER_ADMIN, ADMIN |
| `/api/v1/users/[id]/location` | PUT | SUPER_ADMIN, ADMIN |

### Key Features

- ✅ **Read-only for all users** - Safe to display anywhere
- ✅ **Admin-only editing** - Protected by role checks
- ✅ **No breaking changes** - Optional fields, graceful handling
- ✅ **Reusable components** - Consistent UI across entities
- ✅ **Map integration** - Links to Google Maps and OpenStreetMap
- ✅ **Copy to clipboard** - Easy coordinate sharing

---

**Document Status**: ✅ Complete - Ready for Implementation

**Next Steps**:
1. Review and approve component design
2. Implement API endpoints
3. Integrate into entity views
4. Test access control
5. Deploy to production
