# DCC Sales API Documentation

## Overview
The DCC Sales API provides endpoints to manage and retrieve DCC (Digital Community Champion) sales data. This API allows you to fetch all DCC sales with filtering and pagination, as well as create new sales records.

## Base URL
```
http://localhost:3000/api/dcc-sales
```

## Endpoints

### 1. GET /api/dcc-sales
Retrieve all DCC sales with optional filtering and pagination.

#### Query Parameters
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number for pagination | 1 |
| `limit` | number | No | Number of records per page | 50 |
| `dccId` | string | No | Filter by specific DCC ID | - |
| `startDate` | string | No | Filter sales from this date (YYYY-MM-DD) | - |
| `endDate` | string | No | Filter sales until this date (YYYY-MM-DD) | - |
| `status` | string | No | Filter by sale status | - |

#### Example Request
```bash
# Get all sales
GET /api/dcc-sales

# Get sales with pagination
GET /api/dcc-sales?page=1&limit=10

# Get sales for specific DCC
GET /api/dcc-sales?dccId=123

# Get sales within date range
GET /api/dcc-sales?startDate=2024-01-01&endDate=2024-12-31

# Get sales with status filter
GET /api/dcc-sales?status=completed
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "sales": [
      {
        "id": "sale-id",
        "dccId": "dcc-id",
        "totalAmount": 5000,
        "status": "completed",
        "customerInfo": {
          "name": "John Doe",
          "phone": "+250123456789",
          "email": "john@example.com"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "dcc": {
          "id": "dcc-id",
          "name": "DCC Name",
          "email": "dcc@example.com",
          "phone": "+250123456789"
        },
        "products": [
          {
            "id": "sale-product-id",
            "productId": "product-id",
            "quantity": 2,
            "price": 2500,
            "product": {
              "id": "product-id",
              "name": "Product Name",
              "price": 2500,
              "image": "product-image-url"
            }
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 250,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "limit": 50
    },
    "summary": {
      "totalRevenue": 125000,
      "totalSales": 50
    }
  },
  "message": "DCC sales retrieved successfully"
}
```

### 2. POST /api/dcc-sales
Create a new DCC sale record.

#### Request Body
```json
{
  "dccId": "dcc-id",
  "products": [
    {
      "productId": "product-id",
      "quantity": 2,
      "price": 2500
    }
  ],
  "totalAmount": 5000,
  "customerInfo": {
    "name": "Customer Name",
    "phone": "+250123456789",
    "email": "customer@example.com"
  }
}
```

#### Required Fields
- `dccId`: The ID of the DCC making the sale
- `products`: Array of products being sold
  - `productId`: ID of the product
  - `quantity`: Number of units sold
  - `price`: Price per unit

#### Optional Fields
- `totalAmount`: Total amount of the sale (calculated automatically if not provided)
- `customerInfo`: Object containing customer information
  - `name`: Customer's name
  - `phone`: Customer's phone number
  - `email`: Customer's email address

#### Example Request
```bash
curl -X POST /api/dcc-sales \
  -H "Content-Type: application/json" \
  -d '{
    "dccId": "dcc-123",
    "products": [
      {
        "productId": "prod-456",
        "quantity": 3,
        "price": 1000
      }
    ],
    "totalAmount": 3000,
    "customerInfo": {
      "name": "Jane Doe",
      "phone": "+250123456789",
      "email": "jane@example.com"
    }
  }'
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "id": "new-sale-id",
    "dccId": "dcc-123",
    "totalAmount": 3000,
    "status": "completed",
    "customerInfo": {
      "name": "Jane Doe",
      "phone": "+250123456789",
      "email": "jane@example.com"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "dcc": {
      "id": "dcc-123",
      "name": "DCC Name",
      "email": "dcc@example.com"
    },
    "products": [
      {
        "id": "sale-product-id",
        "productId": "prod-456",
        "quantity": 3,
        "price": 1000,
        "product": {
          "id": "prod-456",
          "name": "Product Name",
          "price": 1000
        }
      }
    ]
  },
  "message": "DCC sale created successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields",
  "message": "dccId and products array are required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch DCC sales",
  "message": "An error occurred while retrieving DCC sales data"
}
```

## Usage Examples

### JavaScript/Node.js
```javascript
// Fetch all DCC sales
const response = await fetch('/api/dcc-sales');
const data = await response.json();

// Fetch sales with pagination
const response = await fetch('/api/dcc-sales?page=1&limit=20');
const data = await response.json();

// Create a new sale
const saleData = {
  dccId: 'dcc-123',
  products: [
    {
      productId: 'prod-456',
      quantity: 2,
      price: 1500
    }
  ],
  totalAmount: 3000,
  customerInfo: {
    name: 'John Doe',
    phone: '+250123456789'
  }
};

const response = await fetch('/api/dcc-sales', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(saleData),
});
const result = await response.json();
```

### Python
```python
import requests

# Fetch all DCC sales
response = requests.get('http://localhost:3000/api/dcc-sales')
data = response.json()

# Create a new sale
sale_data = {
    'dccId': 'dcc-123',
    'products': [
        {
            'productId': 'prod-456',
            'quantity': 2,
            'price': 1500
        }
    ],
    'totalAmount': 3000,
    'customerInfo': {
        'name': 'John Doe',
        'phone': '+250123456789'
    }
}

response = requests.post(
    'http://localhost:3000/api/dcc-sales',
    json=sale_data
)
result = response.json()
```

## Testing

Run the test script to verify the API functionality:

```bash
node test-dcc-sales-api.js
```

## Notes

1. **Authentication**: This is a public API endpoint. If you need authentication, consider adding middleware.
2. **Rate Limiting**: Consider implementing rate limiting for production use.
3. **Validation**: The API includes basic validation for required fields.
4. **Database**: Ensure your Prisma schema includes the necessary models for DCC sales.
5. **Error Handling**: The API includes comprehensive error handling and logging.

## Database Schema Requirements

Make sure your Prisma schema includes these models:

```prisma
model DccSale {
  id           String   @id @default(cuid())
  dccId        String
  totalAmount  Float    @default(0)
  status       String   @default("completed")
  customerInfo Json     @default("{}")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  dcc      Dcc           @relation(fields: [dccId], references: [id])
  products DccSaleProduct[]
}

model DccSaleProduct {
  id        String @id @default(cuid())
  saleId    String
  productId String
  quantity  Int
  price     Float
  
  sale    DccSale @relation(fields: [saleId], references: [id])
  product Product @relation(fields: [productId], references: [id])
}
```



