# Database Schema Comparison

## Reference Schema vs Current Prisma Schema

### Key Differences

#### 1. ID Types
- **Reference Schema**: Uses `SERIAL PRIMARY KEY` (auto-incrementing integers)
- **Current Prisma**: Uses `String @id @default(cuid())` (UUID-like strings)

#### 2. Field Naming Conventions
- **Reference Schema**: Uses snake_case (e.g., `collected_at`, `farmer_id`, `mcc_id`)
- **Current Prisma**: Uses camelCase (e.g., `collectionDate`, `farmerId`, `mccId`)

#### 3. Table Structure Comparison

##### farmers
**Reference:**
```sql
CREATE TABLE farmers (
  id SERIAL PRIMARY KEY,
  farmer_code VARCHAR(32) UNIQUE,
  name TEXT NOT NULL,
  phone VARCHAR(20),
  village TEXT,
  coop_id INT,
  gps_point GEOGRAPHY(POINT),
  created_at TIMESTAMP DEFAULT now()
);
```

**Current Prisma:**
- Uses `String` IDs (cuid)
- Has additional fields: `nfcId`, `nationalId`, `herdSize`, `gpsLatitude`, `gpsLongitude`, `creditLimit`, `emergencyContact`, `email`, `address`
- Uses `Json` for geolocation instead of PostGIS `GEOGRAPHY(POINT)`
- Has `mccId` foreign key

##### milk_collections
**Reference:**
```sql
CREATE TABLE milk_collections (
  id SERIAL PRIMARY KEY,
  farmer_id INT REFERENCES farmers(id),
  mcc_id INT,
  agent_id INT,
  collected_at TIMESTAMP NOT NULL,
  liters NUMERIC(8,2) NOT NULL,
  fat NUMERIC(5,2),
  protein NUMERIC(5,2),
  lactometer_reading NUMERIC(6,2),
  antibiotic_test BOOLEAN,
  quality_status VARCHAR(20) DEFAULT 'Accepted',
  price_per_liter NUMERIC(10,2),
  amount_due NUMERIC(12,2),
  paid BOOLEAN DEFAULT FALSE,
  payment_id INT,
  batch_id INT,
  sample_tag VARCHAR(64),
  synced BOOLEAN DEFAULT FALSE
);
```

**Current Prisma:**
- Uses `String` IDs
- Field names: `collectionDate` (vs `collected_at`), `totalLiters` (vs `liters`), `unitPrice` (vs `price_per_liter`), `totalAmount` (vs `amount_due`)
- Has additional fields: `mccPeriodId`, `stockMoveId`, `warehouseId`, `locationId`, `productId`, `deductions` (Json), `advances`, `totalDeductions`, `netPayment`, `status` (enum), `tempCelsius`, `timeSinceMilkingHours`, `qualityNotes`, `photoUrl`, `geolocation` (Json)
- Uses enum for `status` instead of VARCHAR
- Has relations to multiple tables

##### products
**Reference:**
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(32) UNIQUE,
  name TEXT NOT NULL,
  category VARCHAR(50),
  unit VARCHAR(20),
  sell_price NUMERIC(12,2),
  purchase_price NUMERIC(12,2),
  stock_qty NUMERIC(12,2) DEFAULT 0,
  expiry_date DATE
);
```

**Current Prisma:**
- Similar structure but with additional fields
- Uses `Float` instead of `NUMERIC`
- Has `stock` instead of `stock_qty`
- Has additional fields for MCC integration

##### sales
**Reference:**
```sql
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  mcc_id INT,
  farmer_id INT,
  agent_id INT,
  sale_at TIMESTAMP DEFAULT now(),
  total_amount NUMERIC(12,2),
  payment_method VARCHAR(20),
  paid BOOLEAN DEFAULT FALSE
);
```

**Current Prisma:**
- Uses `String` IDs
- Field names: `saleAt` (vs `sale_at`), `totalAmount` (vs `total_amount`), `paymentMethod` (enum vs VARCHAR)
- Has `invoiceNo` field
- Has relation to `sale_items` table

##### assets & rentals
**Reference:**
```sql
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  serial VARCHAR(64) UNIQUE,
  name TEXT,
  asset_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'available',
  location TEXT
);

CREATE TABLE rentals (
  id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES assets(id),
  farmer_id INT REFERENCES farmers(id),
  rent_start TIMESTAMP,
  rent_end TIMESTAMP,
  rent_fee_per_day NUMERIC(12,2),
  deposit NUMERIC(12,2),
  returned BOOLEAN DEFAULT FALSE,
  contract_doc VARCHAR(255)
);
```

**Current Prisma:**
- Similar structure
- Uses `String` IDs
- Field names: `assetType` (vs `asset_type`), `rentStart` (vs `rent_start`), `rentEnd` (vs `rent_end`), `rentFeePerDay` (vs `rent_fee_per_day`)
- Has `mccId` field in rentals
- Has `currentHolderType` and `currentHolderId` in assets for tracking

##### farmer_accounts
**Reference:**
```sql
CREATE TABLE farmer_accounts (
  id SERIAL PRIMARY KEY,
  farmer_id INT REFERENCES farmers(id),
  balance NUMERIC(14,2) DEFAULT 0
);
```

**Current Prisma:**
- Similar structure
- Uses `String` IDs
- Has `lastUpdated` field

##### payments
**Reference:**
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  farmer_id INT,
  amount NUMERIC(12,2),
  method VARCHAR(30),
  reference VARCHAR(100),
  paid_at TIMESTAMP DEFAULT now()
);
```

**Current Prisma:**
- Has `mcc_payments` table with more fields
- Includes: `collectionId`, `mccId`, `totalAmount`, `deductions`, `advances`, `netPayment`, `paymentMethod` (enum), `mobileMoneyPhone`, `mobileMoneyReference`, `bankReference`, `paymentStatus` (enum), `paymentDate`

### Recommendations

1. **Keep Current Prisma Schema**: The current schema is more comprehensive and includes:
   - Better traceability (sample tags, geolocation, photos)
   - Quality tracking (fat, protein, lactometer, antibiotic tests)
   - Financial management (deductions, advances, net payment)
   - MCC integration (mccId in multiple tables)
   - Modern field types (enums, Json for flexible data)

2. **Field Name Consistency**: Consider if you want to migrate to snake_case for database compatibility, but keep camelCase in Prisma for JavaScript/TypeScript consistency.

3. **ID Type**: Current cuid() strings are better for distributed systems and avoid integer overflow issues.

4. **Missing in Reference**: The reference schema is simpler and missing:
   - Quality test fields
   - Traceability fields
   - Financial tracking (deductions, advances)
   - MCC-specific features (bulk batches, staff, power assets, etc.)

### Conclusion

The current Prisma schema is more feature-rich and suitable for the comprehensive MCC management system. The reference schema appears to be a simpler starting point, but the current implementation has evolved to include all necessary features for the full system.

