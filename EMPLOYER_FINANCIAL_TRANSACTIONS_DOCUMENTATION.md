# Employer Financial Transactions Documentation

## 📋 Overview

The Employer Financial Transactions feature allows EMPLOYER users to view and track DCC stock orders with payment confirmed status. This provides employers with a comprehensive view of their revenue from confirmed DCC payments.

## 🎯 Features

- **Payment Confirmed Orders**: View all DCC stock orders with confirmed payments
- **Revenue Tracking**: Track total revenue from confirmed payments
- **DCC Information**: See details about DCC users who made payments
- **Product Details**: View products and quantities in each order
- **Payment Methods**: Track payment methods used by DCC users
- **Pagination**: Navigate through large numbers of transactions
- **Summary Statistics**: Overview of total orders, revenue, and average order value

## 🚀 API Endpoint

### GET `/api/v1/employer/financial-transactions`

**Description**: Fetch DCC stock orders with payment confirmed status for the authenticated EMPLOYER

**Authentication**: Bearer Token required (EMPLOYER role only)

**Query Parameters**:
- `page` (integer, optional): Page number for pagination (default: 1)
- `limit` (integer, optional): Number of items per page (default: 10)

**Example Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/employer/financial-transactions?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "stockOrders": [
      {
        "id": "order_123",
        "dcc": {
          "id": "dcc_456",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+250123456789"
        },
        "totalAmount": 8500,
        "status": "payment_confirmed",
        "requestDate": "2024-01-15T10:30:00Z",
        "paymentConfirmedAt": "2024-01-15T14:45:00Z",
        "paymentConfirmedBy": {
          "id": "employer_789",
          "name": "Employer Name",
          "email": "employer@example.com"
        },
        "products": [
          {
            "id": "product_order_123",
            "productId": "product_456",
            "quantity": 10,
            "price": 850,
            "product": {
              "id": "product_456",
              "name": "Health Kit",
              "description": "Complete health kit",
              "price": 1000,
              "stock": 50,
              "image": "health-kit.jpg",
              "images": ["health-kit-1.jpg", "health-kit-2.jpg"],
              "category": "Health"
            }
          }
        ],
        "payment": {
          "id": "payment_123",
          "status": "CONFIRMED",
          "amount": 8500,
          "method": "MOBILE_MONEY",
          "paidAt": "2024-01-15T14:45:00Z",
          "createdAt": "2024-01-15T10:30:00Z"
        }
      }
    ],
    "summary": {
      "totalOrders": 25,
      "totalAmount": 125000,
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

## 🎨 User Interface

### Dashboard Location
- **URL**: `http://localhost:3000/en/dashboard/financial-transactions`
- **Access**: Only available to users with EMPLOYER role
- **Navigation**: Available in the sidebar under "Financial Transactions"

### UI Components

#### 1. Summary Cards
- **Total Orders**: Number of payment confirmed orders
- **Total Revenue**: Sum of all confirmed payment amounts
- **Average Order Value**: Average amount per confirmed order

#### 2. Data Table
- **DCC Information**: Name and email of the DCC user
- **Products**: List of products and quantities in the order
- **Amount**: Total order amount
- **Payment Method**: Method used for payment (Mobile Money, Bank Transfer, etc.)
- **Confirmed Date**: When the payment was confirmed
- **Status**: Payment confirmed badge

#### 3. Pagination
- Navigate through multiple pages of transactions
- Configurable items per page

## 🔐 Security

- **Role-based Access**: Only EMPLOYER users can access this feature
- **Data Isolation**: Employers only see orders for their own products
- **Authentication Required**: Valid JWT token required for all API calls

## 📊 Data Flow

1. **DCC Creates Order**: DCC user creates a stock order
2. **Payment Processing**: DCC makes payment for the order
3. **Employer Confirms**: Employer confirms the payment
4. **Status Update**: Order status changes to "payment_confirmed"
5. **Financial Transaction**: Order appears in employer's financial transactions

## 🧪 Testing

Use the provided test script to verify the API functionality:

```bash
# Update the EMPLOYER_TOKEN in the test file
node test-employer-financial-transactions.js
```

## 🔧 Implementation Details

### Database Queries
The API queries the `StockOrder` table with the following filters:
- `status = "payment_confirmed"`
- Products belong to the authenticated employer (`sellerId = user.id`)

### Related Tables
- `StockOrder`: Main order information
- `StockOrderProduct`: Products in each order
- `Product`: Product details
- `User`: DCC and employer information
- `Payment`: Payment details

### Performance Considerations
- Pagination implemented to handle large datasets
- Indexes on `status` and `sellerId` for efficient queries
- Includes only necessary fields to minimize data transfer

## 🚀 Future Enhancements

- **Export Functionality**: Export transactions to CSV/Excel
- **Date Range Filtering**: Filter by date ranges
- **Advanced Search**: Search by DCC name, product name, or order ID
- **Analytics Dashboard**: Charts and graphs for revenue analysis
- **Email Notifications**: Notify employers of new confirmed payments
