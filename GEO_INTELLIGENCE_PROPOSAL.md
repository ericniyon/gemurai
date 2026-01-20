# Geo-Intelligence with Map Visualization Proposal

**Document Version:** 1.0  
**Date:** 2025-01-XX  
**Purpose:** Add map visualization and distance calculations to geo-location data

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Components](#components)
4. [Distance Calculations](#distance-calculations)
5. [Integration Examples](#integration-examples)
6. [Use Cases](#use-cases)
7. [Implementation Plan](#implementation-plan)

---

## Executive Summary

This proposal adds **map visualization** and **distance calculations** to the existing geo-location system using:

- ✅ **Leaflet** - Free, open-source mapping library (no API key required)
- ✅ **React Leaflet** - React wrapper for Leaflet
- ✅ **Haversine Formula** - Distance calculations between coordinates
- ✅ **Next.js Compatible** - Works with SSR and client-side rendering

### Key Features

- 🗺️ **Interactive Maps** - Display entities on maps
- 📍 **Multiple Markers** - Show farmers, MCCs, warehouses together
- 📏 **Distance Calculations** - Calculate distances between points
- 🔍 **Nearest Entity** - Find closest farmer/MCC/warehouse
- 📊 **Radius Search** - Find entities within a radius
- 🎨 **Customizable** - Custom markers, colors, labels

---

## Technology Stack

### Dependencies to Add

```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8"
  }
}
```

### Why Leaflet?

- ✅ **Free** - No API key required
- ✅ **Open Source** - OpenStreetMap tiles
- ✅ **Lightweight** - Smaller bundle size than Google Maps
- ✅ **Next.js Compatible** - Works with SSR
- ✅ **Customizable** - Easy to style and extend
- ✅ **Mobile Friendly** - Touch gestures supported

---

## Components

### 1. GeoMapViewer Component

**File**: `components/ui/geo-map-viewer.tsx`

**Purpose**: Display interactive map with markers

**Features:**
- Multiple markers with custom colors/labels
- Zoom controls
- Fullscreen mode
- Distance display (optional)
- Click handlers for markers
- Auto-fit bounds for multiple markers

**Props:**
```typescript
interface GeoMapViewerProps {
  markers: MapMarker[]
  center?: Coordinates
  zoom?: number
  height?: string
  className?: string
  title?: string
  description?: string
  showControls?: boolean
  showDistance?: boolean
  onMarkerClick?: (marker: MapMarker) => void
}
```

**Usage:**
```tsx
<GeoMapViewer
  markers={[
    {
      id: "farmer1",
      latitude: -1.9441,
      longitude: 30.0619,
      label: "Farmer John",
      color: "#3b82f6"
    }
  ]}
  title="Farmer Locations"
  showDistance={true}
/>
```

### 2. GeoDistanceDisplay Component

**File**: `components/ui/geo-distance-display.tsx`

**Purpose**: Display distance between two points

**Features:**
- Distance in kilometers and meters
- Compact mode for tables
- Full mode with details
- Formatted display (e.g., "2.5km", "150m")

**Props:**
```typescript
interface GeoDistanceDisplayProps {
  from: Coordinates
  to: Coordinates
  className?: string
  title?: string
  showDetails?: boolean
  compact?: boolean
}
```

**Usage:**
```tsx
<GeoDistanceDisplay
  from={{ latitude: -1.9441, longitude: 30.0619 }}
  to={{ latitude: -1.9500, longitude: 30.0700 }}
  showDetails={true}
/>
```

### 3. Geo Calculations Utility

**File**: `lib/utils/geo-calculations.ts`

**Purpose**: Distance and location calculations

**Functions:**
- `calculateDistance()` - Distance between two points (Haversine)
- `findNearest()` - Find nearest entity
- `findWithinRadius()` - Find entities within radius
- `calculateBoundingBox()` - Calculate map bounds
- `calculateCenter()` - Calculate center point
- `formatDistance()` - Format distance for display

---

## Distance Calculations

### Haversine Formula

Used for calculating great-circle distances between two points on Earth.

**Implementation:**
```typescript
function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude)
  const dLon = toRadians(point2.longitude - point1.longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
```

### Use Cases

1. **Nearest Farmer to MCC**
   ```typescript
   const nearest = findNearest(mccLocation, farmers)
   // Returns: { entity: farmer, distance: 2.5 }
   ```

2. **Farmers Within 5km**
   ```typescript
   const nearby = findWithinRadius(mccLocation, 5, farmers)
   // Returns: Array of farmers within 5km
   ```

3. **Route Optimization**
   ```typescript
   // Calculate distances for collection routes
   const distances = farmers.map(farmer => ({
     farmer,
     distance: calculateDistance(mccLocation, farmer)
   }))
   ```

---

## Integration Examples

### 1. Farmer Map View

**Location**: `app/[lang]/dashboard/mcc/page.tsx`

**Add Map Tab:**
```tsx
<TabsContent value="map">
  <GeoMapViewer
    markers={farmers
      .filter(f => f.latitude && f.longitude)
      .map(farmer => ({
        id: farmer.id,
        latitude: farmer.latitude!,
        longitude: farmer.longitude!,
        label: farmer.name,
        color: farmer.isActive ? "#10b981" : "#ef4444"
      }))}
    title="Farmer Locations"
    description="View all farmers on the map"
    showDistance={false}
    onMarkerClick={(marker) => {
      const farmer = farmers.find(f => f.id === marker.id)
      openViewFarmer(farmer)
    }}
  />
</TabsContent>
```

### 2. Distance to MCC

**Location**: Farmer detail view

**Add Distance Display:**
```tsx
{farmer.latitude && farmer.longitude && mccLocation && (
  <GeoDistanceDisplay
    from={{
      latitude: farmer.latitude,
      longitude: farmer.longitude
    }}
    to={{
      latitude: mccLocation.latitude,
      longitude: mccLocation.longitude
    }}
    title="Distance to MCC"
    showDetails={true}
  />
)}
```

### 3. Nearest Farmers Widget

**Location**: MCC Dashboard

**Add Widget:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Nearest Farmers</CardTitle>
  </CardHeader>
  <CardContent>
    {nearestFarmers.map(({ entity, distance }) => (
      <div key={entity.id} className="flex justify-between">
        <span>{entity.name}</span>
        <Badge>{formatDistance(distance)}</Badge>
      </div>
    ))}
  </CardContent>
</Card>
```

### 4. Collection Route Map

**Location**: Collections page

**Show Collection Points:**
```tsx
<GeoMapViewer
  markers={collections
    .filter(c => c.latitude && c.longitude)
    .map(collection => ({
      id: collection.id,
      latitude: collection.latitude!,
      longitude: collection.longitude!,
      label: `${collection.farmers.name} - ${collection.totalLiters}L`,
      color: "#3b82f6"
    }))}
  title="Collection Points"
  showDistance={true}
/>
```

---

## Use Cases

### 1. Farmer Management

**Use Case**: View all farmers on a map
- **Component**: `GeoMapViewer`
- **Markers**: One per farmer
- **Colors**: Green (active), Red (inactive)
- **Click**: Open farmer details

### 2. Route Planning

**Use Case**: Plan milk collection routes
- **Component**: `GeoMapViewer` + distance calculations
- **Markers**: Collection points
- **Distance**: Show distances between points
- **Optimization**: Sort by distance

### 3. Nearest Entity Finder

**Use Case**: Find nearest MCC to a farmer
- **Component**: Distance calculations
- **Display**: `GeoDistanceDisplay`
- **Action**: Show nearest MCC with distance

### 4. Coverage Analysis

**Use Case**: Analyze MCC coverage area
- **Component**: `GeoMapViewer` with radius circles
- **Markers**: Farmers within radius
- **Visualization**: Show coverage area

### 5. Warehouse Location

**Use Case**: View warehouse locations
- **Component**: `GeoMapViewer`
- **Markers**: Warehouses
- **Distance**: Distance from MCC

---

## Implementation Plan

### Phase 1: Install Dependencies

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

### Phase 2: Create Utilities

- [x] Create `lib/utils/geo-calculations.ts`
- [ ] Test distance calculations
- [ ] Test nearest/findWithinRadius functions

### Phase 3: Create Components

- [x] Create `GeoMapViewer` component
- [x] Create `GeoDistanceDisplay` component
- [ ] Test components in isolation
- [ ] Add error handling

### Phase 4: Integrate Maps

- [ ] Add map tab to farmer list
- [ ] Add distance display to farmer details
- [ ] Add map to MCC dashboard
- [ ] Add map to collections page

### Phase 5: Add Distance Logic

- [ ] Add nearest farmer widget
- [ ] Add distance to collection forms
- [ ] Add route optimization
- [ ] Add coverage analysis

### Phase 6: Testing & Optimization

- [ ] Test on various devices
- [ ] Test with many markers
- [ ] Optimize map performance
- [ ] Add loading states

---

## Next.js Configuration

### Dynamic Import for Leaflet

Leaflet requires client-side rendering. Use dynamic imports:

```tsx
"use client"

import dynamic from 'next/dynamic'

const GeoMapViewer = dynamic(
  () => import('@/components/ui/geo-map-viewer').then(mod => ({ default: mod.GeoMapViewer })),
  { ssr: false }
)
```

### CSS Import

Add Leaflet CSS in component or global CSS:

```tsx
import 'leaflet/dist/leaflet.css'
```

---

## Performance Considerations

### 1. Lazy Loading

- Load map only when needed
- Use dynamic imports
- Load markers progressively

### 2. Marker Clustering

For many markers, consider clustering:

```bash
npm install react-leaflet-cluster
```

### 3. Map Caching

- Cache map tiles
- Cache calculated distances
- Use React.memo for components

---

## Summary

### Components Created

| Component | File | Purpose |
|-----------|------|---------|
| **GeoMapViewer** | `components/ui/geo-map-viewer.tsx` | Interactive map display |
| **GeoDistanceDisplay** | `components/ui/geo-distance-display.tsx` | Distance display |
| **Geo Calculations** | `lib/utils/geo-calculations.ts` | Distance utilities |

### Dependencies Needed

```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "@types/leaflet": "^1.9.8"
}
```

### Key Features

- ✅ **Interactive Maps** - Leaflet-based visualization
- ✅ **Distance Calculations** - Haversine formula
- ✅ **Nearest Entity** - Find closest entities
- ✅ **Radius Search** - Find within radius
- ✅ **Next.js Compatible** - Works with SSR
- ✅ **No API Key** - Free OpenStreetMap tiles

---

**Document Status**: ✅ Complete - Ready for Implementation

**Next Steps**:
1. Install dependencies
2. Test components
3. Integrate into entity views
4. Add distance logic to workflows
5. Deploy to production
