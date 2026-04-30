# HarvestPlus (YDEN) – Multi-Commodity Trade Infrastructure

## User journeys

---

## JOURNEY 0: Pre-Collection Agent (NEW, CRITICAL ROLE)

**Purpose:** Surface supply before trucks move.

| | |
|--|--|
| **Actor** | **Pre-Collection Agent (PCA)** — Youth-based field agent **OR** digital self-reporting by farmer **OR** cooperative-appointed scout |

### Journey steps

**0.1 Supply discovery**  
PCA visits farms OR receives farmer input via USSD/app. Captures:

- Commodity type
- Estimated quantity
- Readiness date/time
- Quality indicators (basic)
- Location (GPS or village)
- Storage condition (cold/ambient)

**0.2 Availability signal creation**  
System generates a **Pre-Collection Availability Signal**. Signal is:

- Time-bound
- Non-binding
- Visible to aggregators

**0.3 Aggregator matching**  
Aggregators see:

- Nearby available commodities
- Volumes clustered by route
- Transport requirements

**This prevents empty trips and speculative collection.**

### Value created

- Aggregators plan routes efficiently
- Farmers get visibility without commitment
- System builds predictive supply intelligence

---

## JOURNEY 1: Farmer / Producer

**Purpose:** Turn produce into a verified, paid delivery.

### 1.1 Registration & identity

Farmer joins HarvestPlus via YDEN. Registers as:

- Individual producer
- Group / cooperative member

### 1.2 Pre-collection (optional but encouraged)

Farmer:

- Self-reports availability **OR**
- Confirms PCA-captured signal

### 1.3 Collection day

Aggregator arrives. Commodity is:

- Measured
- Visually checked
- Temporary pickup record created

### 1.4 Delivery confirmation

At collection center:

- Final quality verification
- Quantity confirmed
- Digital Collection Record created

### 1.5 Payment

- If instant pay enabled: farmer paid same day
- Else: farmer sees settlement date

### Farmer gains

- Predictable market access
- Transparent pricing
- Faster payments
- Digital production history (credit-ready)

---

## JOURNEY 2: Aggregator / Transporter

**Purpose:** Move commodities efficiently and get paid without pre-financing.

### 2.1 Route planning (powered by pre-collection)

Aggregator dashboard shows:

- Nearby availability signals
- Volume clusters
- Commodity type
- Urgency (expiry risk)

### 2.2 Route acceptance

Aggregator selects:

- Route
- Expected pickup volumes  
System reserves availability window.

### 2.3 Collection execution

Aggregator:

- Collects from farms
- Confirms pickup in app
- Tracks transport mode (bike, moto, truck)

### 2.4 Delivery to collection center

Aggregator delivers commodity. Collection center verifies:

- Quantity
- Quality  
Aggregator delivery record closed.

### 2.5 Payment

Aggregator:

- Receives instant pay (if enabled) **or**
- Sees scheduled settlement  

**No more pre-financing farmers.**

### Aggregator gains

- Route efficiency
- Reduced working capital pressure
- Digital reputation & performance score

---

## JOURNEY 3: Collection Center / Hub

**Purpose:** Convert physical deliveries into trusted digital assets.

### 3.1 Intake & verification

Staff:

- Validate quantity
- Apply quality tests (commodity-specific)
- Capture storage conditions (temp, moisture)

### 3.2 Digital ledger entry

System creates **Collection Record** tied to:

- Farmer
- Aggregator
- Location
- Commodity profile

### 3.3 Commodity receipt generation

Upon acceptance:

- **Commodity Receipt** is created
- Tagged as: perishable / non-perishable, expiry window, eligible for settlement/financing

### 3.4 Stock exposure to marketplace

Receipt becomes visible inventory in bulk/wholesale marketplace — only to approved offtakers.

### Collection center gains

- Reduced cash stress
- Better utilization
- Quality-based differentiation

---

## JOURNEY 4: Bulk / Wholesale Marketplace (B2B)

**Purpose:** Match verified stock with real demand.

### 4.1 Stock listing (automatic)

Marketplace displays:

- Commodity
- Quantity
- Grade
- Location
- Expiry
- Delivery terms

### 4.2 Buyer discovery

Approved processors / institutions log in. Filter by:

- Volume
- Location
- Quality
- Time window

### 4.3 Offtake request

Buyer places full or partial offtake request. System:

- Locks relevant receipts
- Triggers delivery workflow

### Marketplace gains

- No fake listings
- No speculation
- Real stock only

---

## JOURNEY 5: Processor / Offtaker

**Purpose:** Secure supply without managing upstream chaos.

### 5.1 Login & approval

Processor approved by HarvestPlus/YDEN. Sets:

- Accepted commodities
- Quality thresholds
- Settlement terms (T+N)

### 5.2 Offtake confirmation

Processor:

- Confirms delivery
- Accepts quality  
Receipt becomes payable obligation.

### 5.3 Settlement

Processor pays via fintech (if instant pay) or directly via platform.

### Processor gains

- Reliable supply
- Lower transaction costs
- Cleaner reconciliation

---

## How pre-collection agents change everything

| Without PCA | With PCA |
|-------------|----------|
| Reactive collection | Predictive routing |
| Empty trips | Optimized logistics |
| Price uncertainty | Pre-signaled volumes |
| Fragmented supply | Clustered aggregation |

**This is the intelligence layer that makes the system scalable.**

---

## Summary flow (one-line)

**Pre-collection signals → Verified collection → Digital receipts → Marketplace exposure → Settlement**
