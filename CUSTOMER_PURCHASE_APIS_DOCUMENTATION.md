# Customer Purchase APIs Documentation

## 📋 Overview

The Customer Purchase APIs provide a complete e-commerce solution for customers to browse products, manage their shopping cart, checkout, and track their orders. This system integrates with the existing DCC (Digital Commerce Company) infrastructure.

## 🔐 Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🚀 API Endpoints

### 1. Shopping Cart APIs

#### 1.1 Get Cart Items
**GET** `/api/customer/cart`

Retrieves all items in the customer's shopping cart.

**Response:**
```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "id": "cart-item-id",
        "productId": "product-id",
        "dccId": "dcc-id",
        "quantity": 2,
        "createdAt": "2024-01-01T12:00:00Z",
        "updatedAt": "2024-01-01T12:00:00Z",
        "product": {
          "id": "product-id",
          "name": "Product Name",
          "price": 1000,
          "image": "product-image-url",
          "stock": 50,
          "category": "Electronics"
        },
        "dcc": {
          "id": "dcc-id",
          "name": "DCC Name",
          "email": "dcc@example.com"
        }
      }
    ],
    "subtotal": 2000,
    "totalItems": 2,
    "itemCount": 1
  }
}
```

#### 1.2 Add Item to Cart
**POST** `/api/customer/cart`

Adds a product to the customer's shopping cart.

**Request Body:**
```json
{
  "productId": "product-id",
  "dccId": "dcc-id (optional)",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "item": {
    "id": "cart-item-id",
    "productId": "product-id",
    "dccId": "dcc-id",
    "quantity": 2,
    "product": {
      "id": "product-id",
      "name": "Product Name",
      "price": 1000,
      "image": "product-image-url",
      "stock": 50,
      "category": "Electronics"
    }
  }
}
```

#### 1.3 Update Cart Item Quantity
**PUT** `/api/customer/cart`

Updates the quantity of an item in the cart.

**Request Body:**
```json
{
  "cartItemId": "cart-item-id",
  "quantity": 3
}
```

#### 1.4 Remove Item from Cart
**DELETE** `/api/customer/cart?cartItemId=cart-item-id`

Removes an item from the shopping cart.

### 2. Checkout API

#### 2.1 Process Checkout
**POST** `/api/customer/checkout`

Processes the checkout and creates a new order.

**Request Body:**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Kigali",
    "province": "Kigali",
    "postalCode": "12345",
    "country": "Rwanda"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "Kigali",
    "province": "Kigali",
    "postalCode": "12345",
    "country": "Rwanda"
  },
  "customerNotes": "Please deliver in the morning",
  "paymentMethod": "CASH",
  "estimatedDelivery": "2024-01-08T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "order-id",
    "orderNumber": "ORD-1704067200000-ABC123DEF",
    "status": "PENDING",
    "totalAmount": 2360,
    "subtotal": 2000,
    "taxAmount": 360,
    "shippingAmount": 500,
    "estimatedDelivery": "2024-01-08T12:00:00Z",
    "createdAt": "2024-01-01T12:00:00Z"
  },
  "items": [
    {
      "id": "order-item-id",
      "productId": "product-id",
      "quantity": 2,
      "unitPrice": 1000,
      "totalPrice": 2000
    }
  ],
  "payment": {
    "id": "payment-id",
    "amount": 2360,
    "method": "CASH",
    "status": "PENDING",
    "reference": "PAY-1704067200000"
  }
}
```

### 3. Order Management APIs

#### 3.1 Get Orders List
**GET** `/api/customer/orders`

Retrieves a list of customer orders with optional filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by order status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "order-id",
      "orderNumber": "ORD-1704067200000-ABC123DEF",
      "status": "PENDING",
      "totalAmount": 2360,
      "createdAt": "2024-01-01T12:00:00Z",
      "items": [
        {
          "id": "order-item-id",
          "product": {
            "id": "product-id",
            "name": "Product Name",
            "price": 1000,
            "image": "product-image-url"
          }
        }
      ],
      "payments": [
        {
          "id": "payment-id",
          "amount": 2360,
          "method": "CASH",
          "status": "PENDING"
        }
      ],
      "tracking": [
        {
          "id": "tracking-id",
          "status": "ORDER_CREATED",
          "description": "Order has been created",
          "timestamp": "2024-01-01T12:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 3.2 Get Order Details
**GET** `/api/customer/orders?orderId=order-id`

Retrieves detailed information about a specific order.

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order-id",
    "orderNumber": "ORD-1704067200000-ABC123DEF",
    "status": "PENDING",
    "totalAmount": 2360,
    "subtotal": 2000,
    "taxAmount": 360,
    "shippingAmount": 500,
    "discountAmount": 0,
    "currency": "RWF",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Kigali",
      "province": "Kigali",
      "postalCode": "12345",
      "country": "Rwanda"
    },
    "billingAddress": {
      "street": "123 Main St",
      "city": "Kigali",
      "province": "Kigali",
      "postalCode": "12345",
      "country": "Rwanda"
    },
    "customerNotes": "Please deliver in the morning",
    "estimatedDelivery": "2024-01-08T12:00:00Z",
    "createdAt": "2024-01-01T12:00:00Z",
    "items": [
      {
        "id": "order-item-id",
        "productId": "product-id",
        "dccId": "dcc-id",
        "quantity": 2,
        "unitPrice": 1000,
        "totalPrice": 2000,
        "discount": 0,
        "product": {
          "id": "product-id",
          "name": "Product Name",
          "price": 1000,
          "image": "product-image-url",
          "category": "Electronics"
        },
        "dcc": {
          "id": "dcc-id",
          "name": "DCC Name",
          "email": "dcc@example.com"
        }
      }
    ],
    "payments": [
      {
        "id": "payment-id",
        "amount": 2360,
        "method": "CASH",
        "status": "PENDING",
        "reference": "PAY-1704067200000",
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ],
    "tracking": [
      {
        "id": "tracking-id",
        "status": "ORDER_CREATED",
        "description": "Order has been created and is pending confirmation",
        "location": "System",
        "timestamp": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

#### 3.3 Cancel Order
**POST** `/api/customer/orders`

Cancels an existing order (only if not delivered or already cancelled).

**Request Body:**
```json
{
  "orderId": "order-id",
  "reason": "Changed my mind"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "id": "order-id",
    "status": "CANCELLED",
    "cancelledAt": "2024-01-01T13:00:00Z",
    "cancelledBy": "user-id",
    "cancelledReason": "Changed my mind"
  }
}
```

### 4. Order Tracking APIs

#### 4.1 Get Order Tracking
**GET** `/api/customer/orders/{orderId}/tracking`

Retrieves detailed tracking information for a specific order.

**Response:**
```json
{
  "success": true,
  "tracking": {
    "orderId": "order-id",
    "orderNumber": "ORD-1704067200000-ABC123DEF",
    "status": "PENDING",
    "currentStatus": "ORDER_CREATED",
    "currentDescription": "Order has been created and is pending confirmation",
    "currentLocation": "System",
    "lastUpdate": "2024-01-01T12:00:00Z",
    "estimatedDelivery": "2024-01-08T12:00:00Z",
    "deliveredAt": null,
    "cancelledAt": null,
    "cancelledReason": null,
    "timeline": [
      {
        "id": "tracking-id",
        "status": "ORDER_CREATED",
        "description": "Order has been created and is pending confirmation",
        "location": "System",
        "timestamp": "2024-01-01T12:00:00Z"
      }
    ],
    "payment": {
      "id": "payment-id",
      "amount": 2360,
      "method": "CASH",
      "status": "PENDING",
      "reference": "PAY-1704067200000",
      "processedAt": null
    },
    "orderSummary": {
      "totalItems": 1,
      "totalQuantity": 2,
      "subtotal": 2000,
      "taxAmount": 360,
      "shippingAmount": 500,
      "totalAmount": 2360,
      "currency": "RWF"
    },
    "items": [
      {
        "id": "order-item-id",
        "productId": "product-id",
        "productName": "Product Name",
        "productImage": "product-image-url",
        "quantity": 2,
        "unitPrice": 1000,
        "totalPrice": 2000
      }
    ]
  }
}
```

#### 4.2 Add Tracking Update (Admin/DCC)
**POST** `/api/customer/orders/{orderId}/tracking`

Adds a tracking update to an order (requires admin, DCC, or order owner permissions).

**Request Body:**
```json
{
  "status": "ORDER_SHIPPED",
  "description": "Order has been shipped and is in transit",
  "location": "Kigali Distribution Center"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tracking update added successfully",
  "tracking": {
    "id": "tracking-id",
    "orderId": "order-id",
    "status": "ORDER_SHIPPED",
    "description": "Order has been shipped and is in transit",
    "location": "Kigali Distribution Center",
    "timestamp": "2024-01-01T14:00:00Z"
  }
}
```

## 📊 Order Status Flow

1. **PENDING** - Order created, waiting for confirmation
2. **CONFIRMED** - Order confirmed by admin/DCC
3. **PROCESSING** - Order is being prepared
4. **SHIPPED** - Order has been shipped
5. **DELIVERED** - Order has been delivered
6. **CANCELLED** - Order has been cancelled
7. **REFUNDED** - Order has been refunded

## 💳 Payment Methods

- **CASH** - Cash on delivery
- **BANK_TRANSFER** - Bank transfer
- **MOBILE_MONEY** - Mobile money payment
- **CREDIT_CARD** - Credit card payment
- **DEBIT_CARD** - Debit card payment
- **PAYPAL** - PayPal payment

## 🔧 Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Usage Examples

### Frontend Integration

```javascript
// Add item to cart
const addToCart = async (productId, quantity, dccId = null) => {
  const response = await fetch('/api/customer/cart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productId,
      quantity,
      dccId
    })
  });
  
  return response.json();
};

// Get cart items
const getCart = async () => {
  const response = await fetch('/api/customer/cart', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Process checkout
const checkout = async (checkoutData) => {
  const response = await fetch('/api/customer/checkout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(checkoutData)
  });
  
  return response.json();
};

// Get order tracking
const getOrderTracking = async (orderId) => {
  const response = await fetch(`/api/customer/orders/${orderId}/tracking`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

## 🔗 Related APIs

- **Products API**: `/api/products` - Get available products
- **Auth API**: `/api/auth/login` - User authentication
- **DCC Stock API**: `/api/v1/dcc/stock` - Get DCC products in stock

## 📋 Database Schema

The customer purchase system uses the following new database models:

- **CustomerOrder** - Main order records
- **CustomerOrderItem** - Individual items in orders
- **CustomerPayment** - Payment records for orders
- **OrderTracking** - Tracking updates for orders
- **ShoppingCart** - Customer shopping cart items

## 🚀 Features

- ✅ Shopping cart management
- ✅ Add/remove/update cart items
- ✅ Stock validation
- ✅ Checkout process
- ✅ Order creation with payment
- ✅ Order status tracking
- ✅ Order cancellation
- ✅ Comprehensive order history
- ✅ Real-time tracking updates
- ✅ Payment method support
- ✅ Tax and shipping calculation
- ✅ Multi-role permissions (Customer, DCC, Admin)
