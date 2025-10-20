# DCC Approved Stock Requests API Documentation

## 📋 Overview

The DCC Approved Stock Requests API allows DCC (Digital Commerce Company) users to retrieve products with stock requests that have payment confirmed status. This API provides a comprehensive view of all stock orders where the DCC has confirmed payment and is waiting for employer approval.

## 🔐 Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🚀 API Endpoints

### Get Approved Stock Requests

**GET** `/api/v1/dcc/approved-stock-requests`

Retrieves all stock orders with payment confirmed status for the authenticated DCC user.

#### Query Parameters
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)

#### Response
```json
{
  "success": true,
  "data": [
    {
      "orderId": "cme70q17f000pjfszac4rzmbi",
      "orderStatus": "payment_confirmed",
      "totalAmount": 3500,
      "requestDate": "2025-08-11T11:17:20.668Z",
      "notes": "Payment confirmed for OMO detergent",
      "payment": {
        "id": "cme70q1u0000tjfszuyof51zv",
        "status": "PENDING",
        "amount": 3500,
        "method": "BANK_TRANSFER",
        "paidAt": null,
        "createdAt": "2025-08-11T11:17:21.481Z"
      },
      "products": [
        {
          "productId": "cmdzkxxv80007ddq9n2imnl9i",
          "productName": "OMO Detergent Powder",
          "productDescription": "Laundry detergent powder",
          "productPrice": 3500,
          "productImage": null,
          "productCategory": "Household",
          "currentStock": 120,
          "requestedStock": 1,
          "orderPrice": 3500,
          "seller": {
            "id": "cmcsgj0a4000cddsx5mzlxgfg",
            "name": "Employer Gemurai",
            "email": "employer@Gemurai.rw"
          },
          "stockRequestInfo": {
            "quantity": 1,
            "currentStock": 120,
            "requestedStock": 1,
            "price": 3500,
            "totalValue": 3500
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  },
  "summary": {
    "totalOrders": 2,
    "totalProducts": 2,
    "totalValue": 6500
  }
}
```

#### Example Request
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/approved-stock-requests" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### Example Request with Pagination
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/approved-stock-requests?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## 📊 Response Structure

### Order Information
- `orderId`: Unique identifier for the stock order
- `orderStatus`: Current status of the order (should be "payment_confirmed")
- `totalAmount`: Total amount for the order
- `requestDate`: Date when the order was created
- `notes`: Additional notes for the order

### Payment Information
- `id`: Payment record ID
- `status`: Payment status
- `amount`: Payment amount
- `method`: Payment method used
- `paidAt`: Date when payment was made (null if pending)
- `createdAt`: Date when payment record was created

### Product Information
- `productId`: Unique product identifier
- `productName`: Name of the product
- `productDescription`: Product description
- `productPrice`: Current product price
- `productImage`: Product image URL
- `productCategory`: Product category
- `currentStock`: Current available stock
- `requestedStock`: Stock requested in this order
- `orderPrice`: Price at the time of order
- `seller`: Seller information (id, name, email)

### Stock Request Information
- `quantity`: Quantity requested
- `currentStock`: Stock available at time of order
- `requestedStock`: Stock requested
- `price`: Price per unit
- `totalValue`: Total value for this product

### Pagination Information
- `page`: Current page number
- `limit`: Items per page
- `total`: Total number of orders
- `pages`: Total number of pages

### Summary Information
- `totalOrders`: Total number of orders returned
- `totalProducts`: Total number of products across all orders
- `totalValue`: Total value of all orders

## 👥 Role-Based Access

### DCC Users
- ✅ Access to their own approved stock requests
- ✅ View detailed product and payment information
- ✅ See summary statistics

### Other Users
- ❌ No access to this endpoint

## 🛡️ Security Features

1. **JWT Authentication** - All requests require valid JWT tokens
2. **Role-Based Authorization** - Only DCC users can access this endpoint
3. **User Isolation** - DCC users can only see their own orders
4. **Input Validation** - Query parameters are validated and sanitized

## 🔄 Order Status Flow

This API specifically returns orders with the following status:

1. **pending** → DCC creates order
2. **payment_confirmed** → DCC confirms payment ← **This API returns these orders**
3. **approved** → Employer approves order
4. **rejected** → Employer rejects order
5. **completed** → Order is fulfilled

## 🧪 Testing

### Test User Credentials
```json
{
  "email": "test.dcc@djyh.rw",
  "password": "dcc123!"
}
```

### Complete Test Flow
```bash
# 1. Login as DCC user
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test.dcc@djyh.rw", "password": "dcc123!"}'

# 2. Create a stock order
curl -X POST "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "cmdzkxxv80007ddq9n2imnl9i",
    "quantity": 1,
    "comment": "Test order"
  }'

# 3. Confirm payment for the order
curl -X PATCH "http://localhost:3000/api/stock-orders/ORDER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "confirm_payment",
    "note": "Payment confirmed"
  }'

# 4. Get approved stock requests
curl -X GET "http://localhost:3000/api/v1/dcc/approved-stock-requests" \
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
  "message": "Only DCC users can access approved stock requests"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "User not found or inactive"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch approved stock requests"
}
```

## 🔧 Implementation Details

### Features Implemented ✅
- [x] JWT Authentication
- [x] Role-based access control (DCC only)
- [x] User isolation (own orders only)
- [x] Pagination support
- [x] Comprehensive product information
- [x] Payment details
- [x] Summary statistics
- [x] Error handling
- [x] Input validation

### Database Queries
- ✅ Filter by DCC user ID
- ✅ Filter by payment confirmed status
- ✅ Include product details
- ✅ Include payment information
- ✅ Include seller information
- ✅ Order by creation date (newest first)

### Performance Optimizations
- ✅ Pagination to limit result size
- ✅ Selective field inclusion
- ✅ Efficient database queries
- ✅ Proper indexing support

## 🚀 Usage Examples

### Frontend Integration
```javascript
// Get approved stock requests
const getApprovedStockRequests = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/v1/dcc/approved-stock-requests?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Display approved stock requests
const displayApprovedRequests = async () => {
  try {
    const result = await getApprovedStockRequests();
    
    if (result.success) {
      console.log(`Total Orders: ${result.summary.totalOrders}`);
      console.log(`Total Value: ${result.summary.totalValue}`);
      
      result.data.forEach(order => {
        console.log(`Order ${order.orderId}: ${order.totalAmount} RWF`);
        order.products.forEach(product => {
          console.log(`  - ${product.productName}: ${product.stockRequestInfo.quantity} units`);
        });
      });
    }
  } catch (error) {
    console.error('Error fetching approved stock requests:', error);
  }
};
```

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const ApprovedStockRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const fetchApprovedRequests = async () => {
    try {
      const response = await fetch('/api/v1/dcc/approved-stock-requests');
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Approved Stock Requests</h2>
      <div className="summary">
        <p>Total Orders: {pagination.total}</p>
        <p>Total Value: {requests.reduce((sum, order) => sum + order.totalAmount, 0)} RWF</p>
      </div>
      
      {requests.map(order => (
        <div key={order.orderId} className="order-card">
          <h3>Order #{order.orderId}</h3>
          <p>Status: {order.orderStatus}</p>
          <p>Total Amount: {order.totalAmount} RWF</p>
          <p>Notes: {order.notes}</p>
          
          <div className="products">
            {order.products.map(product => (
              <div key={product.productId} className="product-item">
                <h4>{product.productName}</h4>
                <p>Quantity: {product.stockRequestInfo.quantity}</p>
                <p>Price: {product.orderPrice} RWF</p>
                <p>Seller: {product.seller.name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovedStockRequests;
```

## 📝 Notes

1. **Payment Status**: The API returns orders with "payment_confirmed" status, which indicates the DCC has confirmed payment
2. **Real-time Data**: The API provides real-time data from the database
3. **Comprehensive Information**: Each order includes complete product, payment, and seller information
4. **Pagination**: Large datasets are paginated for better performance
5. **Summary Statistics**: The API provides summary statistics for quick overview

## 🔗 Related APIs

- **Stock Orders API**: `/api/v1/stock-orders` - Create and manage stock orders
- **Products API**: `/api/products` - Get available products
- **Auth API**: `/api/v1/auth/login` - User authentication
- **Payment Confirmation**: `/api/stock-orders/[id]` - Confirm payments for orders

## 🎯 Use Cases

1. **DCC Dashboard**: Display all orders waiting for employer approval
2. **Order Tracking**: Track the status of confirmed payments
3. **Inventory Planning**: Plan inventory based on confirmed orders
4. **Financial Reporting**: Generate reports on confirmed order values
5. **Customer Service**: Provide order status updates to customers
