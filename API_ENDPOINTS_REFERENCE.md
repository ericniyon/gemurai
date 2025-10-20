# 📋 API Endpoints Reference

## 🚀 **Complete List of Available API Endpoints**

### **Base URL**: `http://localhost:3000`

---

## 📦 **Stock Management APIs**

### 1. **DCC Stock API** ⭐ **NEW**
```
GET /api/v1/dcc/stock
```
**Description**: List DCC users with their products in stock  
**Authentication**: Bearer Token required  
**Features**: Search, filtering, pagination, commission calculation, business pricing  
**Documentation**: [📖 Full Documentation](./DCC_STOCK_API_DOCUMENTATION.md)

**Example Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/stock" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters**:
- `page` (integer): Page number for pagination (default: 1)
- `limit` (integer): Number of items per page (default: 10)
- `search` (string): Search DCC users by name, email, or phone
- `category` (string): Filter products by category
- `minStock` (integer): Minimum stock quantity filter
- `sortBy` (string): Sort by "name", "stock", or "price"
- `sortOrder` (string): Sort order "asc" or "desc"

---

### 2. **Stock Orders API**
```
POST /api/v1/stock-orders
```
**Description**: Create and manage stock orders for DCC users  
**Authentication**: Bearer Token required (DCC role)  
**Features**: Commission calculation, payment tracking, status management  
**Documentation**: [📖 Full Documentation](./STOCK_ORDERS_API_DOCUMENTATION.md)

**Example Request**:
```bash
curl -X POST "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-id",
    "quantity": 2,
    "comment": "Order request"
  }'
```

**Request Body**:
- `productId` (string, required): Product ID to order
- `quantity` (integer, required): Quantity to order
- `comment` (string, optional): Order comment

---

### 3. **DCC Approved Stock Requests API**
```
GET /api/v1/dcc/approved-stock-requests
```
**Description**: Get products with approved stock requests for DCC users  
**Authentication**: Bearer Token required (DCC role)  
**Features**: Payment confirmation tracking, product details  
**Documentation**: [📖 Full Documentation](./DCC_APPROVED_STOCK_REQUESTS_API_DOCUMENTATION.md)

**Example Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/approved-stock-requests" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters**:
- `page` (integer): Page number for pagination (default: 1)
- `limit` (integer): Number of items per page (default: 10)

---

## 👥 **User Management APIs**

### 4. **DCC Users API**
```
GET /api/v1/dcc-users
```
**Description**: List DCC users with their products and profiles  
**Authentication**: Bearer Token required  
**Features**: Search, product inclusion, DCC profile data  
**Documentation**: [📖 Full Documentation](./API_DCC_USERS.md)

**Example Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/dcc-users" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters**:
- `search` (string): Search term to filter users
- `includeProducts` (boolean): Include user's products in response
- `includeDCCProfile` (boolean): Include DCC profile information

---

### 5. **Subscription API**
```
GET /api/v1/subscriptions
POST /api/v1/subscriptions
DELETE /api/v1/subscriptions
```
**Description**: Manage subscriptions between CONSUMER and DCC users  
**Authentication**: Bearer Token required  
**Features**: Subscribe/unsubscribe, status management  
**Documentation**: [📖 Full Documentation](./SUBSCRIPTION_API_DOCUMENTATION.md)

**GET Example** (List subscriptions):
```bash
curl -X GET "http://localhost:3000/api/v1/subscriptions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**POST Example** (Create subscription):
```bash
curl -X POST "http://localhost:3000/api/v1/subscriptions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dccId": "dcc-user-id"
  }'
```

**DELETE Example** (Unsubscribe):
```bash
curl -X DELETE "http://localhost:3000/api/v1/subscriptions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dccId": "dcc-user-id"
  }'
```

---

## 🔐 **Authentication APIs**

### 6. **Auth API**
```
POST /api/v1/auth/login
```
**Description**: User authentication and token generation  
**Authentication**: None (public endpoint)  
**Features**: JWT tokens, role-based access  
**Documentation**: See authentication section in individual API docs

**Example Request**:
```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Request Body**:
- `email` (string, required): User email
- `password` (string, required): User password

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "DCC",
    "permissions": [...]
  },
  "token": "jwt-token-here"
}
```

---

## 🎯 **Quick Test Commands**

### **Test All APIs**
```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test.dcc@djyh.rw", "password": "dcc123!"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Test DCC Stock API
curl -X GET "http://localhost:3000/api/v1/dcc/stock" \
  -H "Authorization: Bearer $TOKEN"

# 3. Test Stock Orders API
curl -X GET "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer $TOKEN"

# 4. Test DCC Users API
curl -X GET "http://localhost:3000/api/v1/dcc-users" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 **API Status Summary**

| API | Method | Endpoint | Status | Features |
|-----|--------|----------|--------|----------|
| **DCC Stock** | `GET` | `/api/v1/dcc/stock` | ✅ Working | Search, filtering, pagination |
| **Stock Orders** | `POST` | `/api/v1/stock-orders` | ✅ Working | Commission calculation |
| **Approved Requests** | `GET` | `/api/v1/dcc/approved-stock-requests` | ✅ Working | Payment tracking |
| **DCC Users** | `GET` | `/api/v1/dcc-users` | ✅ Working | User profiles |
| **Subscriptions** | `GET/POST/DELETE` | `/api/v1/subscriptions` | ✅ Working | Subscription management |
| **Auth** | `POST` | `/api/v1/auth/login` | ✅ Working | JWT authentication |

---

## 🔗 **Related Documentation**

- **[📖 Main Documentation](./README_API_DOCUMENTATION.md)** - Complete API documentation
- **[📋 API Index](./API_DOCUMENTATION_INDEX.md)** - Overview of all APIs
- **[📊 Status Report](./API_DOCUMENTATION_STATUS.md)** - Current API status
- **[🧪 Test Scripts](./test-dcc-stock-api.js)** - API testing tools

---

## 💡 **Usage Tips**

1. **Authentication**: Always include the Bearer token in the Authorization header
2. **Error Handling**: Check the `success` field in responses
3. **Pagination**: Use `page` and `limit` parameters for large datasets
4. **Filtering**: Use query parameters to filter results
5. **Testing**: Use the provided test scripts for validation

---

**Last Updated**: August 11, 2025  
**Total Endpoints**: 6  
**Status**: All APIs Working ✅
