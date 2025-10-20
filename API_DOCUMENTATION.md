# Gemurai Platform API Documentation

## Overview

The Gemurai Platform API provides programmatic access to the Gemurai platform's functionality. This RESTful API allows developers to integrate with the platform's features, including user management, applications, products, wallet management, stock operations, and Rwanda administrative divisions.

## Base URL

```
https://api.djyh.rw/api/v1
```

For local development:

```
http://localhost:3000/api/v1
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. To authenticate, you need to include the JWT token in the Authorization header of your requests:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

To obtain a token, use the login endpoint:

```
POST /auth/login
```

## Response Format

All API responses follow a standard format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

For paginated responses:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error type",
  "details": { ... }
}
```

## API Endpoints

### Authentication

#### Login

```
POST /auth/login
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "CONSUMER"
    }
  }
}
```

#### Logout

```
POST /auth/logout
```

**Requires Authentication**

Response:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Verify Token

```
GET /auth/verify
```

**Requires Authentication**

Response:

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "CONSUMER",
    "permissions": ["dashboard.view"]
  }
}
```

#### Forgot Password

```
POST /auth/forgot-password
```

Request body:

```json
{
  "email": "user@example.com"
}
```

Response:

```json
{
  "success": true,
  "message": "If your email exists, a reset link has been sent"
}
```

#### Reset Password

```
POST /auth/reset-password
```

Request body:

```json
{
  "email": "user@example.com",
  "token": "reset_token",
  "password": "new_password"
}
```

Response:

```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

#### Password Reset with National ID Verification

##### Request Password Reset

```
POST /auth/password-reset-request
```

**No Authentication Required**

Request body:

```json
{
  "nationalId": "1234567890123",
  "email": "user@example.com",
  "phone": "+250788123456"
}
```

Response:

```json
{
  "success": true,
  "message": "Password reset instructions have been sent to your registered contact methods",
  "resetToken": "secure_reset_token",
  "expiresAt": "2024-01-01T12:15:00.000Z",
  "contactMethods": {
    "email": true,
    "phone": true
  }
}
```

##### Verify Reset Request

```
POST /auth/password-reset-verify
```

**No Authentication Required**

Request body:

```json
{
  "email": "user@example.com",
  "resetToken": "secure_reset_token",
  "nationalId": "1234567890123",
  "verificationCode": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "National ID and reset token verified successfully",
  "verificationToken": "base64_encoded_verification_token",
  "user": {
    "name": "User Name",
    "email": "user@example.com"
  },
  "nextStep": "set_new_password"
}
```

##### Complete Password Reset

```
POST /auth/password-reset-complete
```

**No Authentication Required**

Request body:

```json
{
  "verificationToken": "base64_encoded_verification_token",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

Response:

```json
{
  "success": true,
  "message": "Password has been reset successfully",
  "user": {
    "name": "User Name",
    "email": "user@example.com"
  },
  "resetAt": "2024-01-01T12:00:00.000Z"
}
```

### Users

#### Get Current User Profile

```
GET /users/me
```

**Requires Authentication**

Response:

```json
{
  "success": true,
  "user": {
    "id": "USR-123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CONSUMER",
    "permissions": ["dashboard.view"],
    "createdAt": "2024-03-01T12:00:00Z"
  }
}
```

#### Update Current User Profile

```
PUT /users/me
```

**Requires Authentication**

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+250700000000"
}
```

Response:

```json
{
  "success": true,
  "user": {
    "id": "USR-123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CONSUMER",
    "updatedAt": "2024-03-01T12:00:00Z"
  }
}
```

#### Register User

```
POST /users/register
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+250700000000"
}
```

Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "USR-123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CONSUMER"
  }
}
```

#### Get All Users

```
GET /users
```

**Requires Authentication (Admin Only)**

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for name or email

Response:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "CONSUMER",
      "permissions": ["dashboard.view"],
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### Update User Password

```
PUT /users/{id}/password
```

**Requires Authentication**

Request body:

```json
{
  "currentPassword": "old_password123",
  "newPassword": "new_password456"
}
```

Response:

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

#### Get DCC Users

```
GET /users/dcc
```

**Requires Authentication** (Any authenticated user can access)

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in email, firstName, lastName, or phone
- `isActive`: Filter by active status (true/false)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "email": "dcc@example.com",
      "name": "John Doe",
      "phone": "+250788123456",
      "avatar": null,
      "isActive": true,
      "role": "DCC",
      "roleDescription": "Digital Community Center staff",
      "roleAssignedAt": "2024-03-01T12:00:00Z",
      "roleActive": true,
      "createdAt": "2024-03-01T12:00:00Z",
      "updatedAt": "2024-03-15T08:30:00Z",
      "dccProfile": {
        "id": "profile_123",
        "level": "LEVEL_C",
        "rating": 4.5,
        "totalSales": "RWF 150,000",
        "monthlySales": "RWF 50,000",
        "productsAvailable": 25,
        "status": "active",
        "location": "Kigali",
        "specialties": ["electronics", "household"]
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Found 25 DCC users"
}
```

### Applications

#### Get All Applications

```
GET /applications
```

**Requires Authentication**

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (pending, approved, rejected)
- `search`: Search term

Response:

```json
{
  "success": true,
  "applications": [
    {
      "id": "APP-123",
      "status": "pending",
      "formData": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+250700000000"
      },
      "createdAt": "2024-03-01T12:00:00Z",
      "updatedAt": "2024-03-01T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### Create Application

```
POST /applications
```

**Requires Authentication**

Request body:

```json
{
  "formData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+250700000000",
    "dateOfBirth": "1990-01-01",
    "gender": "Male",
    "nationalId": "1234567890123456",
    "province": "Northern Province",
    "district": "Musanze",
    "sector": "Muhoza",
    "cell": "Cyabararika",
    "village": "Kagano"
  }
}
```

Response:

```json
{
  "success": true,
  "application": {
    "id": "APP-123",
    "status": "pending",
    "createdAt": "2024-03-01T12:00:00Z",
    "updatedAt": "2024-03-01T12:00:00Z"
  }
}
```

#### Get Application by ID

```
GET /applications/{id}
```

**Requires Authentication**

Response:

```json
{
  "success": true,
  "application": {
    "id": "APP-123",
    "status": "pending",
    "formData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-03-01T12:00:00Z",
    "updatedAt": "2024-03-01T12:00:00Z"
  }
}
```

#### Update Application Status

```
PUT /applications/{id}/status
```

**Requires Authentication**

Request body:

```json
{
  "status": "approved",
  "reason": "Meets all requirements"
}
```

Response:

```json
{
  "success": true,
  "message": "Application status updated",
  "application": {
    "id": "APP-123",
    "status": "approved",
    "updatedAt": "2024-03-01T12:00:00Z"
  }
}
```

#### Evaluate Application

```
POST /applications/evaluate
```

**Requires Authentication**

Request body:

```json
{
  "applicationId": "APP-123",
  "score": 85,
  "feedback": "Good application with all requirements met"
}
```

Response:

```json
{
  "success": true,
  "message": "Application evaluated successfully",
  "evaluation": {
    "id": "EVAL-123",
    "score": 85,
    "feedback": "Good application with all requirements met",
    "createdAt": "2024-03-01T12:00:00Z"
  }
}
```

#### Send Bulk Email

```
POST /applications/bulk-email
```

**Requires Authentication**

Request body:

```json
{
  "applicationIds": ["APP-123", "APP-124"],
  "subject": "Application Update",
  "message": "Your application has been processed"
}
```

Response:

```json
{
  "success": true,
  "message": "Bulk email sent successfully",
  "data": {
    "sent": 2,
    "failed": 0
  }
}
```

#### Get All Applications (Superadmin Only)

```
GET /applications/all
```

**Requires Authentication** (SUPER_ADMIN only)

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `status`: Filter by application status (SUBMITTED, APPROVED, REJECTED, PENDING)
- `search`: Search in application ID, email, phone, or user name
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc/desc, default: desc)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "APP-1751889248174-lxmjpw0",
      "userId": "user_123",
      "phone": "+250788123456",
      "email": "applicant@example.com",
      "status": "SUBMITTED",
      "formData": {
        "personalInfo": {
          "firstName": "John",
          "lastName": "Doe",
          "nationalId": "1199000000000000"
        }
      },
      "nationalId": "1199000000000000",
      "currentStep": 1,
      "notes": null,
      "dccCreated": false,
      "createdAt": "2024-03-01T12:00:00Z",
      "updatedAt": "2024-03-01T12:00:00Z",
      "user": {
        "id": "user_123",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "APPLICANT"
      },
      "evaluations": [
        {
          "id": "eval_123",
          "type": "VULNERABILITY",
          "score": 7.5,
          "totalScore": 10,
          "overallLevel": "MEDIUM",
          "createdAt": "2024-03-02T10:00:00Z",
          "evaluator": {
            "id": "evaluator_123",
            "email": "evaluator@example.com",
            "name": "Jane Smith"
          }
        }
      ],
      "dccProfile": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false,
    "stats": {
      "total": 150,
      "byStatus": {
        "SUBMITTED": 120,
        "APPROVED": 20,
        "REJECTED": 5,
        "PENDING": 5
      },
      "withEvaluations": 80,
      "withDccProfile": 20,
      "dccCreated": 15
    }
  },
  "message": "Retrieved 50 applications out of 150 total"
}
```

### Products

#### Get All Products

```
GET /products
```

**Requires Authentication**

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `search`: Search term

Response:

```json
{
  "success": true,
  "products": [
    {
      "id": "PROD-123",
      "name": "Health Kit",
      "description": "Basic health monitoring kit",
      "price": 50.00,
      "businessPrice": 60.00,
      "currency": "RWF",
      "category": "Health Equipment",
      "inStock": true,
      "quantity": 100
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Create Product

```
POST /products
```

**Requires Authentication**

Request body:

```json
{
  "name": "Health Kit",
  "description": "Basic health monitoring kit",
  "price": 50.00,
  "businessPrice": 60.00,
  "currency": "RWF",
  "category": "Health Equipment",
  "quantity": 100
}
```

Response:

```json
{
  "success": true,
  "product": {
    "id": "PROD-123",
    "name": "Health Kit",
    "description": "Basic health monitoring kit",
    "price": 50.00,
    "businessPrice": 60.00,
    "currency": "RWF",
    "category": "Health Equipment",
    "quantity": 100,
    "createdAt": "2024-03-01T12:00:00Z"
  }
}
```

#### Get Product by ID

```
GET /products/{id}
```

**Requires Authentication**

Response:

```json
{
  "success": true,
  "product": {
    "id": "PROD-123",
    "name": "Health Kit",
    "description": "Basic health monitoring kit",
    "price": 50.00,
    "businessPrice": 60.00,
    "currency": "RWF",
    "category": "Health Equipment",
    "quantity": 100,
    "createdAt": "2024-03-01T12:00:00Z"
  }
}
```

#### Update Product

```
PUT /products/{id}
```

**Requires Authentication**

Request body:

```json
{
  "name": "Advanced Health Kit",
  "description": "Advanced health monitoring kit",
  "price": 75.00,
  "quantity": 150
}
```

Response:

```json
{
  "success": true,
  "product": {
    "id": "PROD-123",
    "name": "Advanced Health Kit",
    "description": "Advanced health monitoring kit",
    "price": 75.00,
    "currency": "RWF",
    "category": "Health Equipment",
    "quantity": 150,
    "updatedAt": "2024-03-01T12:00:00Z"
  }
}
```

### Wallet

#### Get Wallet Balance

```
GET /wallet/balance
```

**Requires Authentication**

Response:

```json
{
  "success": true,
  "balance": {
    "amount": 1000.00,
    "currency": "RWF",
    "lastUpdated": "2024-03-01T12:00:00Z"
  }
}
```

#### Get Wallet Transactions

```
GET /wallet/transactions
```

**Requires Authentication**

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `type`: Filter by transaction type (credit, debit)

Response:

```json
{
  "success": true,
  "transactions": [
    {
      "id": "TXN-123",
      "type": "credit",
      "amount": 100.00,
      "currency": "RWF",
      "description": "Commission from sale",
      "createdAt": "2024-03-01T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Request Withdrawal

```
POST /wallet/withdraw
```

**Requires Authentication**

Request body:

```json
{
  "amount": 500.00,
  "method": "mobile_money",
  "phoneNumber": "+250700000000"
}
```

Response:

```json
{
  "success": true,
  "message": "Withdrawal request submitted",
  "withdrawalRequest": {
    "id": "WDR-123",
    "amount": 500.00,
    "status": "pending",
    "createdAt": "2024-03-01T12:00:00Z"
  }
}
```

### Inventory Management

**⚠️ SYSTEM USER RESTRICTION: Only SUPER_ADMIN users can access inventory management endpoints. ADMIN and other roles do not have system-level access.**

The Inventory Management API provides comprehensive warehouse and stock management capabilities for system administrators.

#### Authentication & Authorization
- **Authentication**: JWT token required
- **Authorization**: SUPER_ADMIN role only
- **System User**: Only SUPER_ADMIN is considered a system user with access to inventory management

#### Warehouses

##### Get All Warehouses

```
GET /inventory/warehouses
```

**Requires Authentication & Role**: SUPER_ADMIN only

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in name, code, or address
- `isActive`: Filter by active status (true/false)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "cmct66pgi0001jldfiv2zc2yf",
      "name": "Main Warehouse",
      "code": "WH001",
      "description": "Main inventory warehouse",
      "address": "Kigali, Rwanda",
      "city": null,
      "country": null,
      "isActive": true,
      "isMain": false,
      "createdAt": "2025-07-07T14:01:47.874Z",
      "updatedAt": "2025-07-07T14:01:47.874Z",
      "locations": [],
      "_count": {
        "locations": 0,
        "stockQuantities": 0
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

##### Create Warehouse

```
POST /inventory/warehouses
```

**Requires Authentication & Role**: SUPER_ADMIN only

Request body:

```json
{
  "name": "Main Warehouse",
  "code": "WH001",
  "address": "Kigali, Rwanda",
    "phone": "+250788123456",
  "email": "warehouse@company.com",
  "description": "Main inventory warehouse",
  "isActive": true
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "cmct66pgi0001jldfiv2zc2yf",
    "name": "Main Warehouse",
    "code": "WH001",
    "description": "Main inventory warehouse",
    "address": "Kigali, Rwanda",
    "isActive": true,
    "createdAt": "2025-07-07T14:01:47.874Z"
  },
  "message": "Warehouse created successfully"
}
```

##### Get Warehouse by ID

```
GET /inventory/warehouses/{id}
```

**Requires Authentication & Role**: SUPER_ADMIN only

Response:

```json
{
  "success": true,
  "data": {
    "id": "cmct66pgi0001jldfiv2zc2yf",
    "name": "Main Warehouse",
    "code": "WH001",
    "locations": [
      {
        "id": "loc_001",
        "name": "Storage Area A",
        "locationType": "STORAGE",
        "isActive": true,
        "stockQuantities": []
      }
    ],
    "_count": {
      "locations": 1,
      "stockQuantities": 5,
      "stockMoves": 10
    }
  }
}
```

##### Update Warehouse

```
PUT /inventory/warehouses/{id}
```

**Requires Authentication & Role**: SUPER_ADMIN only

Request body (all fields optional):

```json
{
  "name": "Updated Warehouse Name",
  "address": "New Address",
  "isActive": false
}
```

##### Delete Warehouse

```
DELETE /inventory/warehouses/{id}
```

**Requires Authentication & Role**: SUPER_ADMIN only

#### Locations

##### Get All Locations

```
GET /inventory/locations
```

**Requires Authentication & Role**: SUPER_ADMIN only

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in name or barcode
- `warehouseId`: Filter by warehouse ID
- `type`: Filter by location type
- `isActive`: Filter by active status

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "loc_001",
      "name": "Storage Area A",
      "code": "SA-A-001",
      "locationType": "STORAGE",
      "warehouseId": "cmct66pgi0001jldfiv2zc2yf",
      "isActive": true,
      "maxCapacity": 1000,
      "currentCapacity": 750,
      "warehouse": {
        "name": "Main Warehouse",
        "code": "WH001"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

##### Create Location

```
POST /inventory/locations
```

**Requires Authentication & Role**: SUPER_ADMIN only

Request body:

```json
{
  "name": "Storage Area B",
  "code": "SA-B-001",
  "warehouseId": "cmct66pgi0001jldfiv2zc2yf",
  "locationType": "STORAGE",
  "parentId": null,
  "maxCapacity": 1000,
  "description": "High-capacity storage area",
  "isActive": true
}
```

#### Stock Quantities

##### Get Stock Quantities

```
GET /inventory/stock
```

**Requires Authentication & Role**: SUPER_ADMIN only

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `warehouseId`: Filter by warehouse
- `locationId`: Filter by location
- `productId`: Filter by product

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "sq_001",
      "productId": "prod_001",
      "warehouseId": "cmct66pgi0001jldfiv2zc2yf",
      "locationId": "loc_001",
      "quantity": 100,
      "reservedQuantity": 10,
      "availableQuantity": 90,
      "lastUpdated": "2025-07-07T14:01:47.874Z",
      "product": {
        "name": "Health Kit",
        "sku": "HK-001"
      },
      "warehouse": {
        "name": "Main Warehouse"
      },
      "location": {
        "name": "Storage Area A"
      }
    }
  ]
}
```

#### Stock Moves

##### Get Stock Moves

```
GET /inventory/moves
```

**Requires Authentication & Role**: SUPER_ADMIN only

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `productId`: Filter by product
- `warehouseId`: Filter by warehouse
- `moveType`: Filter by move type (INCOMING, OUTGOING, INTERNAL, etc.)
- `state`: Filter by state (DRAFT, CONFIRMED, DONE, etc.)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "sm_001",
      "productId": "prod_001",
      "quantity": 50,
      "moveType": "INCOMING",
      "state": "CONFIRMED",
      "date": "2025-07-07T14:01:47.874Z",
      "reference": "PO-2025-001",
      "notes": "Initial stock receipt",
      "product": {
        "name": "Health Kit",
        "sku": "HK-001"
      },
      "warehouse": {
        "name": "Main Warehouse"
      }
    }
  ]
}
```

##### Create Stock Move

```
POST /inventory/moves
```

**Requires Authentication & Role**: SUPER_ADMIN only

Request body:

```json
{
  "productId": "prod_001",
  "warehouseId": "cmct66pgi0001jldfiv2zc2yf",
  "locationId": "loc_001",
  "destinationLocationId": "loc_002",
  "quantity": 25,
  "moveType": "INTERNAL",
  "priority": "normal",
  "scheduledDate": "2025-07-08T10:00:00Z",
  "reference": "TRANS-001",
  "notes": "Moving to picking area"
}
```

##### Confirm Stock Move

```
POST /inventory/moves/{id}/confirm
```

**Requires Authentication & Role**: SUPER_ADMIN only

Request body:

```json
{
  "actualQuantity": 25,
  "notes": "Transfer completed successfully"
}
```

#### Inventory Adjustments

##### Get Inventory Adjustments

```
GET /inventory/adjustments
```

**Requires Authentication & Role**: SUPER_ADMIN only

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `productId`: Filter by product
- `warehouseId`: Filter by warehouse
- `state`: Filter by state (DRAFT, APPROVED, DONE)
- `adjustmentType`: Filter by type (INCREASE, DECREASE, SET)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "adj_001",
      "productId": "prod_001",
      "quantity": 5,
      "adjustmentType": "INCREASE",
      "reason": "Found additional items during cycle count",
      "state": "APPROVED",
      "createdAt": "2025-07-07T14:01:47.874Z",
      "product": {
        "name": "Health Kit",
        "sku": "HK-001"
      }
    }
  ]
}
```

##### Create Inventory Adjustment

```
POST /inventory/adjustments
```

**Requires Authentication & Role**: SUPER_ADMIN only

Request body:

```json
{
  "productId": "prod_001",
  "warehouseId": "cmct66pgi0001jldfiv2zc2yf",
  "locationId": "loc_001",
  "quantity": 5,
  "adjustmentType": "INCREASE",
  "reason": "Found additional items during cycle count",
  "notes": "Items were misplaced but found during audit"
}
```

##### Approve Inventory Adjustment

```
POST /inventory/adjustments/{id}/approve
```

**Requires Authentication & Role**: SUPER_ADMIN only

Request body:

```json
{
  "notes": "Adjustment approved after verification"
}
```

#### Cycle Counts

##### Get Cycle Counts

```
GET /inventory/cycle-counts
```

**Requires Authentication & Role**: SUPER_ADMIN only

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `warehouseId`: Filter by warehouse
- `state`: Filter by state (DRAFT, IN_PROGRESS, DONE)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "cc_001",
      "name": "Monthly Count - Storage Area A",
      "state": "IN_PROGRESS",
      "scheduledDate": "2025-07-10T09:00:00Z",
      "warehouse": {
        "name": "Main Warehouse"
      },
      "location": {
        "name": "Storage Area A"
      }
    }
  ]
}
```

##### Create Cycle Count

```
POST /inventory/cycle-counts
```

**Requires Authentication & Role**: SUPER_ADMIN only

Request body:

```json
{
  "name": "Weekly Count - Storage Area B",
  "warehouseId": "cmct66pgi0001jldfiv2zc2yf",
  "locationId": "loc_002",
  "productId": null,
  "scheduledDate": "2025-07-15T09:00:00Z",
  "notes": "Regular weekly cycle count"
}
```

#### Inventory Reports

##### Get Inventory Reports

```
GET /inventory/reports
```

**Requires Authentication & Role**: SUPER_ADMIN only

Query parameters:
- `type`: Report type (stock-levels, movements, adjustments, cycle-counts)
- `warehouseId`: Filter by warehouse
- `dateFrom`: Start date for report
- `dateTo`: End date for report

Response:

```json
{
  "success": true,
  "data": {
    "reportType": "stock-levels",
    "generatedAt": "2025-07-07T14:01:47.874Z",
    "summary": {
      "totalProducts": 25,
      "totalQuantity": 1250,
      "lowStockItems": 3,
      "outOfStockItems": 1
    },
    "details": [
      {
        "productId": "prod_001",
        "productName": "Health Kit",
        "sku": "HK-001",
        "totalQuantity": 100,
        "availableQuantity": 90,
        "reservedQuantity": 10,
        "locations": [
          {
            "warehouseName": "Main Warehouse",
            "locationName": "Storage Area A",
            "quantity": 100
          }
        ]
      }
    ]
  }
}
```

### Stock Management

#### Get Stock Inventory

```
GET /stock/inventory
```

**Requires Authentication**

Response:

```json
{
  "success": true,
  "inventory": [
    {
      "productId": "PROD-123",
      "productName": "Health Kit",
      "quantity": 100,
      "reserved": 10,
      "available": 90,
      "lastUpdated": "2024-03-01T12:00:00Z"
    }
  ]
}
```

#### Create Stock Order

```
POST /stock/orders
```

**Requires Authentication**

Request body:

```json
{
  "items": [
    {
      "productId": "PROD-123",
      "quantity": 5
    }
  ],
  "deliveryAddress": "Kigali, Rwanda",
  "notes": "Urgent delivery required"
}
```

Response:

```json
{
  "success": true,
  "order": {
    "id": "ORD-123",
    "status": "pending",
    "totalAmount": 250.00,
    "createdAt": "2024-03-01T12:00:00Z"
  }
}
```

#### Get Stock Orders

```
GET /stock/orders
```

**Requires Authentication**

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status

Response:

```json
{
  "success": true,
  "orders": [
    {
      "id": "ORD-123",
      "status": "pending",
      "totalAmount": 250.00,
      "createdAt": "2024-03-01T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```