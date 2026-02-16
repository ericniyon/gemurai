# Rwanda Administrative Data – Investigation

This document describes all Rwanda administrative division data sources, how they are used, and where they live in the codebase.

---

## 1. Hierarchy

Official Rwanda administrative hierarchy (5 levels):

- **Province** → **District** → **Sector** → **Cell** → **Village**

---

## 2. Data Sources

### 2.1 In-memory (primary fallback)

| Location | Description |
|----------|-------------|
| `lib/rwanda-divisions.ts` | Large static array `rwandaAdministrativeDivisions: Province[]` (~3.7k lines). Full nested structure: provinces with `id`, `name`, `districts[]`; each district has `sectors[]`, each sector `cells[]`, each cell `villages[]`. IDs are **slug-like** (e.g. `kigali`, `eastern`, `gasabo`, `bumbogo`). |

- **Provinces**: 5 (Kigali City, Eastern, Northern, Southern, Western).
- **Usage**: `RwandaAdministrativeService` (same file) provides:
  - `getProvinces()`, `getDistrictsByProvince(provinceId)`, `getSectorsByDistrict(districtId)`
  - `getCellsBySector(sectorId, districtId?)`, `getVillagesByCell(cellId, sectorId?)` (optional parent scoping for disambiguation)
  - `getFullAddressPath(villageId)`, `searchLocations(query)`, `validateHierarchy(...)`
- Used when **DB has no Rwanda data** or when API/DB calls fail.

### 2.2 Database (Prisma)

| Location | Description |
|----------|-------------|
| `prisma/schema.prisma` | Models: `rwanda_province`, `rwanda_district`, `rwanda_sector`, `rwanda_cell`, `rwanda_village`. Tables: `rwanda_provinces`, `rwanda_districts`, etc. IDs are **CUIDs**. |
| `lib/rwanda-divisions-db.ts` | DB access: `getProvincesFromDb()`, `getDistrictsByProvinceFromDb(provinceId)`, `getSectorsByDistrictFromDb(districtId)`, `getCellsBySectorFromDb(sectorId)`, `getVillagesByCellFromDb(cellId)`, `searchLocationsFromDb(search)`, `hasRwandaDataInDb()`, `validateHierarchyFromDb(...)`, `getFullAddressPathFromDb(villageId)`, and `RwandaDivisionsDB` object. |

- Used when **`hasRwandaDataInDb()` is true** (i.e. at least one province exists in DB).

### 2.3 Seed data

| Location | Description |
|----------|-------------|
| `scripts/rwanda-administratives.json` | **Small sample**: one province "East", one district "Bugesera", one sector "Gashora", three cells (Biryogo, Kabuye, Kagomasi) with villages. Used by seed script. |
| `scripts/seed-rwanda-administratives.ts` | Reads the JSON and upserts into Prisma `rwanda_*` tables (by slug). Run: `npm run seed-rwanda-administratives`. |
| `scripts/004_rwanda_administrative_divisions.sql` | **Legacy / alternate**: raw SQL for tables `provinces`, `districts`, `sectors`, `cells`, `villages` (different names and schema than Prisma). Not used by the current Next/Prisma app. |

- **Important**: Full Rwanda coverage requires a complete `rwanda-administratives.json` (or equivalent). The current JSON is only a sample (East → Bugesera → Gashora → …).

### 2.4 Validator (in-memory only)

| Location | Description |
|----------|-------------|
| `lib/rwanda-divisions-validator.ts` | `RwandaAddressValidator.validateAddress(provinceId, …)` and `getFullAddressString(...)` using **only** `RwandaAdministrativeService` (in-memory). No DB. |

---

## 3. API

| Endpoint | File | Behavior |
|----------|------|----------|
| `GET /api/rwanda-divisions` | `app/api/rwanda-divisions/route.ts` | Query params: `type` (provinces \| districts \| sectors \| cells \| villages), `parentId`, and for cells/villages optionally `districtId` / `sectorId`. If `search` is set, returns search results. **Data source**: if `hasRwandaDataInDb()` then DB, else in-memory. |

- **List responses**: arrays of `{ id, name }` (and optional extra fields like `slug`), used by dropdowns.
- **Search response**:
  - **DB**: `SearchLocationResult[]` — flat array of `{ type, id, name, path }`.
  - **In-memory**: `{ provinces, districts, sectors, cells, villages }` — object of arrays of full entities.
- **Inconsistency**: Search API response shape differs between DB and in-memory. Clients that support search should handle both or only one.

---

## 4. Consumers

| Consumer | Use |
|----------|-----|
| `components/dependent-dropdown-db.tsx` | Province → District → Sector → Cell → Village dropdowns; calls `/api/rwanda-divisions` with `type` and `parentId` (and `districtId`/`sectorId` for cells/villages). |
| `components/farm-level-data/FarmerProfileManager.tsx` | Same API for location step (provinces, districts, sectors, cells, villages with same params). |
| `components/application-form-fixed.tsx` | Uses `DependentDropdownDB` for address. |
| `app/api/v1/applications/submit-with-address/route.ts` | Validates address hierarchy and gets full address path: uses **DB** (RwandaDivisionsDB) when `hasRwandaDataInDb()` else **in-memory** (RwandaAdministrativeService). |

---

## 5. ID Systems

- **In-memory**: string slugs (e.g. `kigali`, `eastern`, `gasabo`).
- **DB**: CUIDs (e.g. `clxx...`).
- Dropdowns and forms store whatever ID the API returns. If the app first runs without DB seed, users get in-memory IDs; after seeding DB, they get CUIDs. **Mixing** (e.g. saved in-memory IDs vs DB-backed dropdown) can cause “selection not found” or validation failures. Prefer one source: seed DB for production and use DB when available.

---

## 6. Summary Table

| Aspect | In-memory | DB (Prisma) |
|--------|-----------|--------------|
| File(s) | `lib/rwanda-divisions.ts` | `lib/rwanda-divisions-db.ts`, Prisma schema |
| IDs | Slugs | CUIDs |
| Coverage | 5 provinces, many districts/sectors/cells/villages | Whatever is in `rwanda-administratives.json` (currently small sample) |
| Used when | No Rwanda data in DB or DB error | `hasRwandaDataInDb()` is true |
| Search result shape | Object of arrays | Flat `SearchLocationResult[]` |

---

## 7. Recommendations

1. **Seed production**: Replace or extend `scripts/rwanda-administratives.json` with full official data and run `npm run seed-rwanda-administratives` so DB is the single source of truth when possible.
2. **Search API**: Unify search response shape (e.g. always return a flat list with `type`, `id`, `name`, `path`) so clients do not need to handle two formats.
3. **Validator**: If you need server-side validation against DB when DB is seeded, use `validateHierarchyFromDb` / `RwandaDivisionsDB`; the route already falls back to in-memory when DB has no data.
4. **Legacy SQL**: `scripts/004_rwanda_administrative_divisions.sql` is a different schema; remove or document if still needed for another system.
