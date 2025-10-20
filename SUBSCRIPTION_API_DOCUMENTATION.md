# Subscription API Documentation

## Quick Summary

The Subscription API allows CUSTOMER users to subscribe to DCC (Digital Community Champion) users. This enables customers to follow DCCs and receive updates about their products, services, and activities.

### 🎯 **Key Features**
- ✅ **Only CUSTOMER users can subscribe to DCC users** (as requested)
- ✅ **Secure authentication and role-based access control**
- ✅ **DCC user validation and listing**
- ✅ **Unique subscription constraints**
- ✅ **Soft delete functionality**

### 📊 **Implementation Status**
- **Database Schema**: ✅ Complete
- **Authentication**: ✅ Working
- **DCC Listing**: ✅ Working
- **Subscription Creation**: ⚠️ Authentication working, DB operation needs fix
- **Subscription Management**: ⚠️ Needs DB fix

### 🧪 **Testing**
- Test users created and ready
- Authentication working correctly
- DCC listing functional
- Comprehensive test scripts available

## Overview

The Subscription API allows CUSTOMER users to subscribe to DCC (Digital Community Champion) users. This enables customers to follow DCCs and receive updates about their products, services, and activities.

## Authentication

All endpoints require authentication. The API supports both session-based authentication (NextAuth) and token-based authentication.

### Authentication Headers

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Or use session cookies for web-based authentication.

## Current Implementation Status

✅ **Fully Implemented:**
- Database schema with Subscription model
- Authentication and role-based access control
- DCC users listing endpoint
- Role verification and validation

⚠️ **Partially Working:**
- Subscription creation (authentication and validation working, database operation needs debugging)
- Subscription viewing and management endpoints

🔧 **In Progress:**
- Final database operation fixes for subscription creation

## API Endpoints

### 1. Get Subscribable DCC Users ✅

**Endpoint:** `GET /api/v1/dcc-users/subscribable`

**Description:** Get a list of DCC users that can be subscribed to. For CUSTOMER users, this endpoint also indicates which DCCs they're already subscribed to.

**Status:** ✅ **Fully Working**

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for DCC name, email, or phone

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dcc_user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+250700000000",
      "avatar": "avatar_url",
      "createdAt": "2024-01-01T00:00:00Z",
      "dccProfile": {
        "level": "LEVEL_C",
        "rating": 4.5,
        "location": "Kigali",
        "specialties": ["Electronics", "Fashion"],
        "totalSales": "RWF 50000",
        "monthlySales": "RWF 10000",
        "productsAvailable": 25,
        "status": "active"
      },
      "isSubscribed": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Get User's Subscriptions ⚠️

**Endpoint:** `GET /api/v1/subscriptions`

**Description:** Get the current user's subscriptions. For CUSTOMER users, this returns DCCs they're subscribed to. For DCC users, this returns their subscribers.

**Status:** ⚠️ **Needs Database Fix**

**Query Parameters:**
- `type` (optional): "subscribed" (default) or "subscribers"
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response for CUSTOMER users (type=subscribed):**
```json
{
  "success": true,
  "data": [
    {
      "id": "subscription_id",
      "subscriberId": "customer_user_id",
      "dccId": "dcc_user_id",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "dcc": {
        "id": "dcc_user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+250700000000",
        "avatar": "avatar_url",
        "dccProfile": {
          "level": "LEVEL_C",
          "rating": 4.5,
          "location": "Kigali",
          "specialties": ["Electronics", "Fashion"],
          "totalSales": "RWF 50000",
          "monthlySales": "RWF 10000",
          "productsAvailable": 25
        }
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Response for DCC users (type=subscribers):**
```json
{
  "success": true,
  "data": [
    {
      "id": "subscription_id",
      "subscriberId": "customer_user_id",
      "dccId": "dcc_user_id",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "subscriber": {
        "id": "customer_user_id",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+250700000001",
        "avatar": "avatar_url",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3. Subscribe to a DCC ⚠️

**Endpoint:** `POST /api/v1/subscriptions`

**Description:** Subscribe to a DCC user. Only CUSTOMER users can subscribe to DCC users.

**Status:** ⚠️ **Authentication Working, Database Operation Needs Fix**

**Request Body:**
```json
{
  "dccId": "dcc_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to DCC",
  "data": {
    "id": "subscription_id",
    "subscriberId": "customer_user_id",
    "dccId": "dcc_user_id",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "dcc": {
      "id": "dcc_user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "dccProfile": {
        "level": "LEVEL_C",
        "rating": 4.5,
        "location": "Kigali"
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: DCC ID is required
- `400 Bad Request`: Already subscribed to this DCC
- `403 Forbidden`: Only CUSTOMER users can subscribe to DCC users
- `404 Not Found`: Valid DCC user not found

### 4. Unsubscribe from a DCC ⚠️

**Endpoint:** `DELETE /api/v1/subscriptions?dccId={dccId}`

**Description:** Unsubscribe from a DCC user.

**Status:** ⚠️ **Needs Database Fix**

**Query Parameters:**
- `dccId` (required): ID of the DCC to unsubscribe from

**Response:**
```json
{
  "success": true,
  "message": "Successfully unsubscribed from DCC"
}
```

**Error Responses:**
- `400 Bad Request`: DCC ID is required
- `404 Not Found`: Active subscription not found

## Database Schema

### Subscription Model ✅

```prisma
model Subscription {
  id          String   @id @default(cuid())
  subscriberId String  // CUSTOMER user who is subscribing
  dccId       String   // DCC user being subscribed to
  status      String   @default("ACTIVE") // ACTIVE, INACTIVE, BLOCKED
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  subscriber  User     @relation("Subscriber", fields: [subscriberId], references: [id], onDelete: Cascade)
  dcc         User     @relation("DCCSubscribed", fields: [dccId], references: [id], onDelete: Cascade)
  
  @@unique([subscriberId, dccId])
  @@map("subscriptions")
}
```

**Status:** ✅ **Successfully Applied to Database**

### User Model Updates

The User model has been updated to include subscription relationships:

```prisma
model User {
  // ... existing fields ...
  subscriptions                Subscription[]          @relation("Subscriber")
  subscribedTo                 Subscription[]          @relation("DCCSubscribed")
}
```

## Usage Examples

### JavaScript/TypeScript

```javascript
// Get subscribable DCC users ✅
const response = await fetch('/api/v1/dcc-users/subscribable', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
const data = await response.json()

// Subscribe to a DCC ⚠️ (Authentication working, DB operation needs fix)
const subscribeResponse = await fetch('/api/v1/subscriptions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    dccId: 'dcc_user_id'
  })
})

// Get user's subscriptions ⚠️ (Needs DB fix)
const subscriptionsResponse = await fetch('/api/v1/subscriptions', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})

// Unsubscribe from a DCC ⚠️ (Needs DB fix)
const unsubscribeResponse = await fetch('/api/v1/subscriptions?dccId=dcc_user_id', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
```

### cURL

```bash
# Get subscribable DCC users ✅
curl -X GET "http://localhost:3000/api/v1/dcc-users/subscribable" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Subscribe to a DCC ⚠️ (Authentication working, DB operation needs fix)
curl -X POST "http://localhost:3000/api/v1/subscriptions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"dccId": "dcc_user_id"}'

# Get subscriptions ⚠️ (Needs DB fix)
curl -X GET "http://localhost:3000/api/v1/subscriptions" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Unsubscribe from a DCC ⚠️ (Needs DB fix)
curl -X DELETE "http://localhost:3000/api/v1/subscriptions?dccId=dcc_user_id" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200 OK`: Success
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Security Considerations ✅

1. **Authentication Required**: All endpoints require valid authentication ✅
2. **Role-Based Access**: Only CUSTOMER users can subscribe to DCC users ✅
3. **DCC Validation**: Only active DCC users can be subscribed to ✅
4. **Unique Subscriptions**: Users cannot subscribe to the same DCC multiple times ✅
5. **Soft Delete**: Subscriptions are deactivated rather than deleted ✅
6. **Role Verification**: Proper role checking implemented ✅
7. **Input Validation**: DCC ID validation and user existence checks ✅

## Testing

### Test Scripts Available ✅

1. **Basic API Test** (without authentication):
```bash
node test-subscription-api.js
```

2. **Comprehensive Test with Authentication**:
```bash
node test-subscription-with-auth.js
```

3. **Generate Test Users**:
```bash
node generate-test-customer.js
```

### Test Results Summary

```
✅ Authentication working
✅ DCC users listing working  
✅ DCC users found: 4 DCC users
✅ Role verification working
✅ Database schema applied
⚠️ Subscription operations need database fix
```

### Test User Credentials

**CUSTOMER User:**
- Email: `test.customer@djyh.rw`
- Password: `customer123!`

**DCC User:**
- Email: `test.dcc@djyh.rw`
- Password: `dcc123!`

## Implementation Details

### Technical Architecture ✅

1. **Database Layer**:
   - PostgreSQL with Prisma ORM
   - Subscription model with proper relationships
   - Role-based user system with assignments
   - Unique constraints on subscription pairs

2. **Authentication Layer**:
   - JWT token-based authentication
   - Role verification through user role assignments
   - Session-based fallback support

3. **API Layer**:
   - RESTful endpoints with consistent response format
   - Proper error handling and status codes
   - Input validation and sanitization

4. **Security Layer**:
   - Role-based access control (RBAC)
   - User permission validation
   - DCC user validation

### Role System Integration ✅

The subscription API integrates with the existing role assignment system:
- Users are created without direct role fields
- Roles are assigned through `UserRoleAssignment` table
- Authentication extracts role from role assignments
- API endpoints validate roles through the assignment system

## Known Issues & Next Steps

### Current Issues 🔧
1. **Subscription Creation**: Authentication and validation working, but database operation failing
2. **Subscription Viewing**: Endpoint needs database operation fix
3. **Unsubscription**: Endpoint needs database operation fix

### Immediate Next Steps
1. Debug subscription creation database operation
2. Fix subscription viewing endpoint
3. Complete unsubscription functionality
4. Add comprehensive error logging

## Future Enhancements

Potential future features:
1. Subscription notifications
2. Subscription analytics for DCCs
3. Bulk subscription operations
4. Subscription preferences and settings
5. Subscription-based content filtering
6. Subscription-based product recommendations
7. DCC performance metrics for subscribers
