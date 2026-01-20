# Form Integration Examples - Geo-Location

**Quick Reference**: Exact code snippets for integrating geo-location into each form

---

## 1. AddFarmerForm Integration

**File**: `app/[lang]/dashboard/mcc/components/AddFarmerForm.tsx`

### Step 1: Add Import

```tsx
import { GeoLocationInput } from "@/components/ui/geo-location-input"
```

### Step 2: Update Interface

```tsx
interface FarmerFormData {
  // ... existing fields ...
  latitude?: number | null
  longitude?: number | null
}
```

### Step 3: Update Initial State

```tsx
const [formData, setFormData] = useState<FarmerFormData>({
  // ... existing fields ...
  latitude: null,
  longitude: null,
})
```

### Step 4: Add to Form Submission

```tsx
const farmerData = {
  mccId: "mcc_1760697250506",
  name: formData.name,
  // ... existing fields ...
  latitude: formData.latitude || undefined,
  longitude: formData.longitude || undefined,
}
```

### Step 5: Add UI Section (After Location Information Card)

```tsx
{/* GPS Location Section - Add after Location Information Card */}
<Card className="bg-white border border-gray-200 shadow-sm">
  <CardHeader>
    <CardTitle className="text-lg">GPS Location (Optional)</CardTitle>
    <CardDescription>
      Capture precise location coordinates for mapping and route planning
    </CardDescription>
  </CardHeader>
  <CardContent>
    <GeoLocationInput
      latitude={formData.latitude}
      longitude={formData.longitude}
      onLocationChange={(location) => {
        setFormData(prev => ({
          ...prev,
          latitude: location.latitude,
          longitude: location.longitude
        }))
      }}
      label="Location Coordinates"
    />
  </CardContent>
</Card>
```

### Step 6: Update Form Reset

```tsx
setFormData({
  // ... existing resets ...
  latitude: null,
  longitude: null,
})
```

---

## 2. AddCustomerForm Integration

**File**: `app/[lang]/dashboard/mcc/components/AddCustomerForm.tsx`

### Step 1: Add Import

```tsx
import { GeoLocationInput } from "@/components/ui/geo-location-input"
```

### Step 2: Update Interface

```tsx
interface CustomerFormData {
  // ... existing fields ...
  latitude?: number | null
  longitude?: number | null
}
```

### Step 3: Update Initial State

```tsx
const [formData, setFormData] = useState<CustomerFormData>({
  // ... existing fields ...
  latitude: null,
  longitude: null,
})
```

### Step 4: Add to Form Submission

```tsx
body: JSON.stringify({
  name: formData.name.trim(),
  contact: formData.contact.trim(),
  // ... existing fields ...
  latitude: formData.latitude || null,
  longitude: formData.longitude || null,
  mccId: user?.mccId,
})
```

### Step 5: Add UI Section (After address/district fields)

```tsx
{/* Add after district field */}
<div className="space-y-2">
  <GeoLocationInput
    latitude={formData.latitude}
    longitude={formData.longitude}
    onLocationChange={(location) => {
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude
      }))
    }}
    label="Location Coordinates (Optional)"
  />
</div>
```

### Step 6: Update Form Reset

```tsx
setFormData({
  // ... existing resets ...
  latitude: null,
  longitude: null,
})
```

---

## 3. WarehouseManagement Integration

**File**: `app/components/inventory/WarehouseManagement.tsx`

### Step 1: Add Import

```tsx
import { GeoLocationInput } from "@/components/ui/geo-location-input"
```

### Step 2: Update Form State

```tsx
const [formData, setFormData] = useState({
  name: "",
  code: "",
  description: "",
  district: "",
  country: "Rwanda",
  isMain: false,
  latitude: null as number | null,
  longitude: null as number | null,
})
```

### Step 3: Add to Form Submission

```tsx
const warehouseData = {
  ...formData,
  city: formData.district,
  code: formData.code || undefined,
  latitude: formData.latitude || undefined,
  longitude: formData.longitude || undefined,
}
```

### Step 4: Add UI Section (In create dialog, after address fields)

```tsx
{/* Add after country field in create dialog */}
<div className="space-y-2">
  <GeoLocationInput
    latitude={formData.latitude}
    longitude={formData.longitude}
    onLocationChange={(location) => {
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude
      }))
    }}
    label="Warehouse Location (Optional)"
  />
</div>
```

### Step 5: Update Form Reset

```tsx
setFormData({
  name: "",
  code: "",
  description: "",
  district: "",
  country: "Rwanda",
  isMain: false,
  latitude: null,
  longitude: null,
})
```

---

## 4. MCC Setup Form Integration

**File**: `app/superadmin/mccs/new/page.tsx`

### Step 1: Add Import

```tsx
import { GeoLocationInput } from "@/components/ui/geo-location-input"
```

### Step 2: Update Form State

```tsx
const [formData, setFormData] = useState({
  // ... existing fields ...
  latitude: null as number | null,
  longitude: null as number | null,
})
```

### Step 3: Add to Form Submission

```tsx
const mccData = {
  // ... existing fields ...
  latitude: formData.latitude || undefined,
  longitude: formData.longitude || undefined,
}
```

### Step 4: Add UI Section (After location/address fields)

```tsx
{/* Add after address field */}
<div className="space-y-2">
  <GeoLocationInput
    latitude={formData.latitude}
    longitude={formData.longitude}
    onLocationChange={(location) => {
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude
      }))
    }}
    label="MCC Location (Optional)"
  />
</div>
```

---

## 5. Supplier Form Integration

**File**: (To be identified - likely `app/[lang]/dashboard/mcc/components/AddSupplierForm.tsx`)

### Step 1: Add Import

```tsx
import { GeoLocationInput } from "@/components/ui/geo-location-input"
```

### Step 2: Update Interface

```tsx
interface SupplierFormData {
  name: string
  phone: string
  email: string
  address: string
  latitude?: number | null
  longitude?: number | null
}
```

### Step 3: Update Initial State

```tsx
const [formData, setFormData] = useState<SupplierFormData>({
  name: '',
  phone: '',
  email: '',
  address: '',
  latitude: null,
  longitude: null,
})
```

### Step 4: Add to Form Submission

```tsx
const supplierData = {
  name: formData.name,
  phone: formData.phone,
  email: formData.email,
  address: formData.address,
  latitude: formData.latitude || undefined,
  longitude: formData.longitude || undefined,
}
```

### Step 5: Add UI Section

```tsx
{/* Add after address field */}
<div className="space-y-2">
  <GeoLocationInput
    latitude={formData.latitude}
    longitude={formData.longitude}
    onLocationChange={(location) => {
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude
      }))
    }}
    label="Supplier Location (Optional)"
  />
</div>
```

---

## 6. Agent Registration Integration

**File**: `app/[lang]/register/page.tsx`

### Step 1: Add Import

```tsx
import { GeoLocationInput } from "@/components/ui/geo-location-input"
```

### Step 2: Update Form State

```tsx
const [formData, setFormData] = useState({
  // ... existing fields ...
  latitude: null as number | null,
  longitude: null as number | null,
})
```

### Step 3: Add to Form Submission

```tsx
const registrationData = {
  // ... existing fields ...
  latitude: formData.latitude || undefined,
  longitude: formData.longitude || undefined,
}
```

### Step 4: Add UI Section (Conditional for FIELD_AGENT role)

```tsx
{/* Add after location/address fields, only for FIELD_AGENT */}
{activeTab === "individual" && formData.role === "FIELD_AGENT" && (
  <div className="space-y-2">
    <GeoLocationInput
      latitude={formData.latitude}
      longitude={formData.longitude}
      onLocationChange={(location) => {
        setFormData(prev => ({
          ...prev,
          latitude: location.latitude,
          longitude: location.longitude
        }))
      }}
      label="Agent Location (Optional)"
    />
  </div>
)}
```

---

## Common Patterns

### Pattern 1: Card Section (For Major Forms)

```tsx
<Card className="bg-white border border-gray-200 shadow-sm">
  <CardHeader>
    <CardTitle className="text-lg">GPS Location (Optional)</CardTitle>
    <CardDescription>
      Capture precise location coordinates
    </CardDescription>
  </CardHeader>
  <CardContent>
    <GeoLocationInput
      latitude={formData.latitude}
      longitude={formData.longitude}
      onLocationChange={(location) => {
        setFormData(prev => ({
          ...prev,
          latitude: location.latitude,
          longitude: location.longitude
        }))
      }}
      label="Location Coordinates"
    />
  </CardContent>
</Card>
```

### Pattern 2: Inline Section (For Simple Forms)

```tsx
<div className="space-y-2">
  <GeoLocationInput
    latitude={formData.latitude}
    longitude={formData.longitude}
    onLocationChange={(location) => {
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude
      }))
    }}
    label="Location Coordinates (Optional)"
  />
</div>
```

---

## Testing Checklist

For each form integration:

- [ ] Component renders correctly
- [ ] Auto-capture button works
- [ ] Manual entry works
- [ ] Confirmation dialog appears
- [ ] Coordinates validate correctly
- [ ] Form submits with geo-location
- [ ] Form submits without geo-location
- [ ] GPS unavailable handled gracefully
- [ ] Permission denied handled gracefully
- [ ] Form reset clears geo-location
- [ ] Visual feedback works (green border, checkmark)

---

**Note**: All changes are optional - forms work without geo-location data.
