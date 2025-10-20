# Stock Orders API Documentation

## 📋 Overview

The Stock Orders API allows DCC (Digital Commerce Company) users to create and manage stock orders. This API provides endpoints for creating new stock orders, viewing existing orders, and managing the order lifecycle.

## 🔐 Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🚀 API Endpoints

### 1. Create Stock Order

**POST** `/api/v1/stock-orders`

Creates a new stock order. Only DCC users can create stock orders.

#### Request Body
```json
{
  "productId": "string",
  "quantity": "number",
  "comment": "string (optional)"
}
```

#### Response
```json
{
  "success": true,
  "stockOrder": {
    "id": "cme70ftwg000djfszv09o7wqt",
    "dccId": "cme6z3q5g0003jfdxywg2zv1b",
    "totalAmount": 1464,
    "status": "pending",
    "priority": "medium",
    "requestDate": "2025-08-11T11:09:24.641Z",
    "estimatedDelivery": null,
    "notes": "Test order with commission calculation",
    "approvedBy": null,
    "approvedAt": null,
    "rejectedBy": null,
    "rejectedAt": null,
    "paymentConfirmedBy": null,
    "paymentConfirmedAt": null,
    "completedBy": null,
    "completedAt": null,
    "createdAt": "2025-08-11T11:09:24.641Z",
    "updatedAt": "2025-08-11T11:09:24.641Z"
  },
  "pricing": {
    "originalPrice": 500,
    "commissionPercentage": 12,
    "commissionAmount": 60,
    "priceAfterCommission": 440,
    "quantity": 2,
    "totalAmount": 880
  }
}
```

#### Example Request
```bash
curl -X POST "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "cmdzkxxvj000bddq9367ip9xb",
    "quantity": 4,
    "comment": "Test salt order"
  }'
```

### 2. Get Stock Orders

**GET** `/api/v1/stock-orders`

Retrieves stock orders for the authenticated user. DCC users see their own orders, while EMPLOYER users see orders they need to approve.

#### Query Parameters
- `type` (optional): "subscribed" or "subscribers" (for subscription context)
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "cme70ftwg000djfszv09o7wqt",
      "dccId": "cme6z3q5g0003jfdxywg2zv1b",
      "totalAmount": 3200,
      "status": "pending",
      "priority": "medium",
      "requestDate": "2025-08-11T11:09:24.641Z",
      "estimatedDelivery": null,
      "notes": "Test salt order",
      "approvedBy": null,
      "approvedAt": null,
      "rejectedBy": null,
      "rejectedAt": null,
      "paymentConfirmedBy": null,
      "paymentConfirmedAt": null,
      "completedBy": null,
      "completedAt": null,
      "createdAt": "2025-08-11T11:09:24.641Z",
      "updatedAt": "2025-08-11T11:09:24.641Z",
      "products": [
        {
          "id": "cme70fu6c000fjfsztz0jsfgf",
          "stockOrderId": "cme70ftwg000djfszv09o7wqt",
          "productId": "cmdzkxxvj000bddq9367ip9xb",
          "quantity": 4,
          "currentStock": 250,
          "requestedStock": 4,
          "price": 800,
          "createdAt": "2025-08-11T11:09:24.997Z",
          "updatedAt": "2025-08-11T11:09:24.997Z",
          "product": {
            "id": "cmdzkxxvj000bddq9367ip9xb",
            "name": "Salt - Iodized",
            "price": 800,
            "sellerId": "cmcsgj0a4000cddsx5mzlxgfg"
          }
        }
      ],
      "payment": {
        "id": "cme70fug6000hjfszckogb5xq",
        "stockOrderId": "cme70ftwg000djfszv09o7wqt",
        "status": "PENDING",
        "amount": 3200,
        "method": "BANK_TRANSFER",
        "reference": null,
        "paidAt": null,
        "createdAt": "2025-08-11T11:09:25.350Z",
        "updatedAt": "2025-08-11T11:09:25.350Z"
      }
    }
  ]
}
```

#### Example Request
```bash
curl -X GET "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Update Stock Order Status

**PATCH** `/api/v1/stock-orders`

Updates the status of a stock order. Only EMPLOYER users can approve/reject orders.

#### Request Body
```json
{
  "orderId": "string",
  "status": "approved|rejected|payment_confirmed|completed"
}
```

#### Response
```json
{
  "success": true,
  "message": "Stock order approved successfully"
}
```

#### Example Request
```bash
curl -X PATCH "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "cme70ftwg000djfszv09o7wqt",
    "status": "approved"
  }'
```

## 🔄 Order Status Flow

1. **pending** - Initial status when order is created
2. **payment_confirmed** - When DCC confirms payment
3. **approved** - When EMPLOYER approves the order
4. **rejected** - When EMPLOYER rejects the order
5. **completed** - When order is fulfilled

## 👥 Role-Based Access

### DCC Users
- ✅ Create stock orders
- ✅ View their own orders
- ✅ Confirm payments

### EMPLOYER Users
- ✅ View all pending orders
- ✅ Approve/reject orders
- ✅ Complete orders

### Other Users
- ❌ No access to stock orders

## 🛡️ Security Features

1. **JWT Authentication** - All requests require valid JWT tokens
2. **Role-Based Authorization** - Access control based on user roles
3. **Input Validation** - All inputs are validated and sanitized
4. **Database Transactions** - Atomic operations for data consistency

## 📊 Database Schema

### StockOrder Model
```prisma
model StockOrder {
  id                     String              @id @default(cuid())
  dccId                  String
  totalAmount            Float
  status                 String
  priority               String
  requestDate            DateTime            @default(now())
  estimatedDelivery      DateTime?
  notes                  String?
  approvedBy             String?
  approvedAt             DateTime?
  rejectedBy             String?
  rejectedAt             DateTime?
  paymentConfirmedBy     String?
  paymentConfirmedAt     DateTime?
  completedBy            String?
  completedAt            DateTime?
  createdAt              DateTime            @default(now())
  updatedAt              DateTime            @updatedAt
  payment                Payment?
  approvedByUser         User?               @relation("ApprovedStockOrders", fields: [approvedBy], references: [id])
  completedByUser        User?               @relation("CompletedStockOrders", fields: [completedBy], references: [id])
  dcc                    User                @relation("RequestedStockOrders", fields: [dccId], references: [id])
  paymentConfirmedByUser User?               @relation("PaymentConfirmedStockOrders", fields: [paymentConfirmedBy], references: [id])
  rejectedByUser         User?               @relation("RejectedStockOrders", fields: [rejectedBy], references: [id])
  products               StockOrderProduct[]
}
```

### StockOrderProduct Model
```prisma
model StockOrderProduct {
  id             String     @id @default(cuid())
  stockOrderId   String
  productId      String
  quantity       Int
  currentStock   Int
  requestedStock Int
  price          Float
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  product        Product    @relation(fields: [productId], references: [id])
  stockOrder     StockOrder @relation(fields: [stockOrderId], references: [id])
}
```

## 🧪 Testing

### Test User Credentials
```json
{
  "email": "test.dcc@djyh.rw",
  "password": "dcc123!"
}
```

### Test Product IDs
- Toilet Paper: `cmdzkxx5p0003ddq9s74trrcr`
- Soap Bar: `cmdzkxxuz0005ddq9pujkqeaa`
- OMO Detergent: `cmdzkxxv80007ddq9n2imnl9i`
- Rice: `cmdzkxxva0009ddq9dfzrg4fh`
- Salt: `cmdzkxxvj000bddq9367ip9xb`

### Complete Test Flow
```bash
# 1. Login as DCC user
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test.dcc@djyh.rw", "password": "dcc123!"}'

# 2. Create stock order
curl -X POST "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "cmdzkxxvj000bddq9367ip9xb",
    "quantity": 4,
    "comment": "Test order"
  }'

# 3. Get stock orders
curl -X GET "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## ⚠️ Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized. Please log in."
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Only DCC users can create stock orders"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Product ID and quantity are required"
}
```

## 🔧 Implementation Details

### Features Implemented ✅
- [x] JWT Authentication
- [x] Role-based access control
- [x] Stock order creation
- [x] Stock order listing
- [x] Status updates
- [x] Payment integration
- [x] Database transactions
- [x] Input validation
- [x] Error handling
- [x] Redirect support for legacy URLs
- [x] **Commission calculation** (price minus commission for DCC users)
- [x] **Transparent pricing** (detailed pricing breakdown in responses)

### API Endpoints Status
- ✅ `POST /api/v1/stock-orders` - Create stock order
- ✅ `GET /api/v1/stock-orders` - List stock orders
- ✅ `PATCH /api/v1/stock-orders` - Update order status
- ✅ `POST /api/v1/stock/orders` - Redirect to correct endpoint

### Database Operations
- ✅ Create StockOrder record
- ✅ Create StockOrderProduct records
- ✅ Create Payment record
- ✅ Update order status
- ✅ Handle stock calculations

## 🚀 Usage Examples

### Frontend Integration
```javascript
// Create stock order
const createStockOrder = async (productId, quantity, comment) => {
  const response = await fetch('/api/v1/stock-orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productId,
      quantity,
      comment
    })
  });
  
  return response.json();
};

// Get stock orders
const getStockOrders = async () => {
  const response = await fetch('/api/v1/stock-orders', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

## 📝 Notes

1. **URL Redirect**: The API supports both `/api/v1/stock-orders` and `/api/v1/stock/orders` URLs for backward compatibility
2. **Payment Integration**: Each stock order automatically creates a pending payment record
3. **Stock Tracking**: The system tracks current stock levels and requested quantities
4. **Audit Trail**: All status changes are logged with timestamps and user information
5. **Commission Calculation**: DCC users automatically get products at reduced prices (original price minus percentage-based commission)
6. **Pricing Transparency**: All commission calculations are clearly shown in API responses

## 🔗 Related APIs

- **Products API**: `/api/products` - Get available products
- **Auth API**: `/api/v1/auth/login` - User authentication
- **Payment API**: Integrated payment handling for stock orders
