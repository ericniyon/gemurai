# Complete List of System Roles

## Overview
This document lists all roles that should exist in the Gemurai system, organized by category and access level.

---

## System Administration Roles

### 1. SUPER_ADMIN
- **ID**: `SUPER_ADMIN`
- **Name**: Super Admin
- **Level**: 100 (Highest)
- **Description**: Full system access with highest level privileges - ONLY system user
- **Permissions**: All permissions (`*`)
- **Use Cases**: 
  - Complete system control
  - User management
  - Role management
  - System configuration
  - All MCC management

### 2. ADMIN
- **ID**: `ADMIN`
- **Name**: Admin
- **Level**: 60
- **Description**: Administrative access with limited permissions - NOT a system user
- **Permissions**: 
  - Dashboard & analytics
  - Users view (no create/edit/delete)
  - Applications management
  - Products management
  - Orders management
  - Learning management
  - Jobs management
  - Finance view
  - Profile management
- **Use Cases**: Day-to-day administration, content management

---

## Business/Organization Roles

### 3. EMPLOYER
- **ID**: `EMPLOYER`
- **Name**: Employer
- **Level**: 70
- **Description**: Business owner or employer
- **Permissions**:
  - Dashboard access
  - Application management (create, evaluate, approve, reject)
  - Product management
  - Stock management
  - Order management
  - Job posting and management
  - Learning enrollment
  - Finance requests
- **Use Cases**: Posting jobs, managing applications, hiring, inventory management

### 4. DCC (Digital Community Champion)
- **ID**: `DCC`
- **Name**: DCC
- **Level**: 40
- **Description**: Digital Commerce Company representative
- **Permissions**:
  - Dashboard access
  - Application management
  - Product management
  - Learning enrollment
  - Job posting and applications
  - Finance requests
  - Stock creation
  - Sales creation
- **Use Cases**: Community services, product sales, digital commerce

### 5. AGENT
- **ID**: `AGENT`
- **Name**: Agent
- **Level**: 20
- **Description**: Service agent with customer support capabilities
- **Permissions**:
  - Dashboard access
  - Own applications view
  - Application creation
  - Product viewing
  - Order viewing
  - Learning enrollment
  - Job applications
  - Customer support
  - Profile management
- **Use Cases**: Customer support, application assistance

### 6. CONSUMER / CUSTOMER
- **ID**: `CONSUMER` (maps from `CUSTOMER`)
- **Name**: Consumer / Customer
- **Level**: 10 (Lowest)
- **Description**: Regular customer/consumer
- **Permissions**:
  - Dashboard access
  - Product viewing and purchasing
  - Order creation and viewing
  - Learning enrollment
  - Job applications
  - Finance requests
  - Profile management
- **Use Cases**: Shopping, basic platform interaction

---

## Internal Organization Roles

### 7. BRANCH_MANAGER
- **ID**: `BRANCH_MANAGER`
- **Name**: Branch Manager
- **Level**: 55
- **Description**: Branch manager with access to applications, vouchers, and inventory view
- **Permissions**:
  - Dashboard access
  - Applications view
  - Products view
  - Stock view
  - Wallet view
- **Use Cases**: Branch operations oversight

### 8. EMPLOYEE
- **ID**: `EMPLOYEE`
- **Name**: Employee
- **Level**: 50
- **Description**: Company employee with inventory management capabilities
- **Permissions**:
  - Dashboard access
  - Product management
  - Stock management (view, create, edit)
  - Stock orders management
  - Inventory operations
  - Profile management
- **Use Cases**: Inventory operations, stock management

### 9. TEAM_LEADER
- **ID**: `TEAM_LEADER`
- **Name**: Team Leader
- **Level**: 60
- **Description**: Team management and oversight capabilities
- **Permissions**:
  - Dashboard & analytics
  - Users view
  - Application management
  - Product management
  - Order management
  - Learning management
  - Job management
  - Finance view
  - Team management
  - Reports view
  - Profile management
- **Use Cases**: Team oversight, management

---

## Digital Services Role

### 10. DIGITAL_SERVICE
- **ID**: `DIGITAL_SERVICE`
- **Name**: Digital Service
- **Level**: 45
- **Description**: Digital service provider for Irembo, Mobile Money, Canal packages, and other digital solutions
- **Permissions**:
  - Dashboard & analytics
  - Digital services management
  - Irembo services management
  - Mobile Money management
  - Canal packages management
  - Digital payments management
  - Wallet management
  - Customer support
  - Reports generation
  - Profile management
- **Use Cases**: Digital service provision, mobile money, Irembo services

---

## Milk Collection Center (MCC) Roles

### 11. MCC_MANAGER
- **ID**: `MCC_MANAGER`
- **Name**: MCC Manager
- **Level**: 75
- **Description**: Administrator for a Milk Collection Center - manages MCC operations, staff, farmers, and collections
- **Permissions**:
  - Dashboard & analytics
  - MCC management (view, manage)
  - Farmer management (view, create, edit, manage)
  - Collection management (view, create, edit, approve, reject, manage)
  - Payment management (view, create, process, manage)
  - Sales management (view, create, manage)
  - Staff management (view, create, edit, manage)
  - Inventory management (view, manage)
  - Procurement management (view, create, manage)
  - Asset management (view, manage)
  - Rental management (view, create, manage)
  - Reports (view, generate)
  - Capacity assessment (view, assess)
  - Profile management
- **Use Cases**: Managing a single MCC, overseeing operations, staff, and farmers

### 12. FIELD_AGENT
- **ID**: `FIELD_AGENT`
- **Name**: Field Agent
- **Level**: 25
- **Description**: Collection Agent - captures milk collections in the field with offline capability
- **Permissions**:
  - Dashboard access
  - Collection management (view, create, edit)
  - Farmer management (view, create, edit)
  - Quality testing and recording
  - Traceability recording
  - Offline sync capability
  - Profile management
- **Use Cases**: Field collection, quality testing, offline data capture

### 13. COOP_ADMIN (Cooperative Admin)
- **ID**: `COOP_ADMIN`
- **Name**: Cooperative Admin
- **Level**: 80
- **Description**: Regional Manager / Cooperative Administrator - oversees multiple MCCs and regional operations
- **Permissions**:
  - Dashboard & analytics
  - MCC management (view, manage, create, edit)
  - Farmer management (view, manage)
  - Collection management (view, manage)
  - Payment management (view, manage)
  - Sales management (view, manage)
  - Staff management (view, manage)
  - Regional management (view, manage)
  - Capacity assessment (view, assess, manage)
  - Reports (view, generate)
  - Profile management
- **Use Cases**: Overseeing multiple MCCs, regional operations, cooperative management

### 14. FARMER
- **ID**: `FARMER`
- **Name**: Farmer
- **Level**: 5
- **Description**: Farmer with limited mobile view / SMS access - can view own collections and payments
- **Permissions**:
  - Dashboard access
  - Own collections view
  - Own payments view
  - Own account view
  - Own ledger view
  - Own sales view
  - Own rentals view
  - Profile management
  - SMS receive
- **Use Cases**: Viewing own milk collections, payments, account balance, receiving SMS notifications

### 15. ACCOUNTANT
- **ID**: `ACCOUNTANT`
- **Name**: Accountant
- **Level**: 70
- **Description**: Accountant - manages financial transactions, payments, and reconciliation
- **Permissions**:
  - Dashboard & analytics
  - Payment management (view, create, process, manage, reconcile)
  - Account management (view, manage)
  - Ledger management (view, manage)
  - Financial management (view, manage)
  - Financial reports (view, generate)
  - Reports (view, generate)
  - Finance management
  - Profile management
- **Use Cases**: Financial management, payment processing, reconciliation, financial reporting

---

## Role Summary by Category

### System Administration
1. **SUPER_ADMIN** (Level 100) - Full system control
2. **ADMIN** (Level 60) - Administrative access

### Business/Organization
3. **EMPLOYER** (Level 70) - Business owner
4. **DCC** (Level 40) - Digital Community Champion
5. **AGENT** (Level 20) - Service agent
6. **CONSUMER** (Level 10) - Regular customer

### Internal Organization
7. **BRANCH_MANAGER** (Level 55) - Branch operations
8. **EMPLOYEE** (Level 50) - Company employee
9. **TEAM_LEADER** (Level 60) - Team management

### Digital Services
10. **DIGITAL_SERVICE** (Level 45) - Digital service provider

### Milk Collection Center (MCC)
11. **MCC_MANAGER** (Level 75) - MCC administrator
12. **FIELD_AGENT** (Level 25) - Collection agent
13. **COOP_ADMIN** (Level 80) - Regional/Cooperative admin
14. **FARMER** (Level 5) - Farmer (limited access)
15. **ACCOUNTANT** (Level 70) - Financial management

---

## Role Hierarchy (by Level)

1. **SUPER_ADMIN** - 100
2. **COOP_ADMIN** - 80
3. **MCC_MANAGER** - 75
4. **EMPLOYER** - 70
5. **ACCOUNTANT** - 70
6. **ADMIN** - 60
7. **TEAM_LEADER** - 60
8. **BRANCH_MANAGER** - 55
9. **EMPLOYEE** - 50
10. **DIGITAL_SERVICE** - 45
11. **DCC** - 40
12. **FIELD_AGENT** - 25
13. **AGENT** - 20
14. **CONSUMER** - 10
15. **FARMER** - 5

---

## Notes

- **CONSUMER** and **CUSTOMER** are the same role (CUSTOMER maps to CONSUMER in the database)
- **SUPER_ADMIN** is the only role with full system access (`*` permissions)
- MCC roles are specifically for Milk Collection Center operations
- Role levels determine access hierarchy (higher level can access lower level resources)
- All roles should exist in both the Prisma `UserRole` enum and the database `roles` table

---

## Current Status

### ✅ Defined in Prisma Schema (UserRole enum):
- SUPER_ADMIN
- ADMIN
- DCC
- EMPLOYER
- CONSUMER
- AGENT
- MCC_MANAGER
- FIELD_AGENT
- COOP_ADMIN
- FARMER
- ACCOUNTANT

### ⚠️ Defined in lib/roles.ts but NOT in Prisma enum:
- BRANCH_MANAGER
- EMPLOYEE
- TEAM_LEADER
- CUSTOMER (maps to CONSUMER)
- DIGITAL_SERVICE

### 🔧 Recommendation:
Add missing roles to Prisma `UserRole` enum:
- BRANCH_MANAGER
- EMPLOYEE
- TEAM_LEADER
- DIGITAL_SERVICE

Note: CUSTOMER is already handled as CONSUMER in the database.












