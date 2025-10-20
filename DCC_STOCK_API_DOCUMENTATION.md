# DCC Stock API Documentation

## Overview
The DCC Stock API provides a comprehensive view of DCC (Distribution Center Coordinator) users and their available product stock. This API allows you to list DCC users along with detailed information about the products they have in stock, including pricing (regular price and business price), quantities, and commission calculations.

## Endpoint
`GET /api/v1/dcc/stock`

## Authentication
This API requires authentication. You can authenticate using:
- **Bearer Token**: Include in Authorization header
- **Session Cookie**: NextAuth session
- **Cookie Token**: Gemurai_token or token cookie

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 10 | Number of items per page |
| `search` | string | "" | Search DCC users by name, email, or phone |
| `category` | string | "" | Filter products by category |
| `minStock` | integer | 0 | Minimum stock quantity filter |
| `sortBy` | string | "name" | Sort by: "name", "stock", "price" |
| `sortOrder` | string | "asc" | Sort order: "asc", "desc" |

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "dccUsers": [
      {
        "dccId": "string",
        "dccName": "string",
        "dccEmail": "string",
        "dccPhone": "string",
        "dccAvatar": "string | null",
        "dccIsActive": boolean,
        "dccCreatedAt": "string",
        "dccUpdatedAt": "string",
        "role": "DCC",
        "roleAssignedAt": "string",
        "roleExpiresAt": "string | null",
        "dccProfile": {
          "id": "string",
          "level": "LEVEL_A | LEVEL_B | LEVEL_C",
          "rating": number,
          "totalSales": "string",
          "monthlySales": "string",
          "productsAvailable": number
        } | null,
        "productsInStock": [
          {
            "productId": "string",
            "productName": "string",
            "productDescription": "string",
            "productPrice": number,
            "productBusinessPrice": "number | null",
            "productImage": "string | null",
            "productImages": ["string"],
            "productCategory": "string",
            "productSubcategory": "string | null",
            "productStatus": "string",
            "productIsActive": boolean,
            "productCommission": number,
            "stockQuantity": number,
            "stockCreatedAt": "string",
            "stockUpdatedAt": "string",
            "brand": {
              "id": "string",
              "name": "string"
            } | null,
            "seller": {
              "id": "string",
              "name": "string",
              "email": "string"
            } | null,
            "priceAfterCommission": number,
            "totalValue": number
          }
        ],
        "stockSummary": {
          "totalProducts": number,
          "totalQuantity": number,
          "totalValue": number,
          "averagePrice": number
        }
      }
    ],
    "summary": {
      "totalDCCUsers": number,
      "totalProductsInStock": number,
      "totalQuantityInStock": number,
      "totalValueInStock": number
    }
  },
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  },
  "filters": {
    "search": "string",
    "category": "string",
    "minStock": number,
    "sortBy": "string",
    "sortOrder": "string"
  },
  "message": "string"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Features

### 🔍 **Search & Filtering**
- **Search DCC Users**: Search by name, email, or phone number
- **Category Filter**: Filter products by category
- **Minimum Stock Filter**: Show only DCC users with specified minimum stock quantity
- **Active Users Only**: Only returns active DCC users

### 📊 **Stock Information**
- **Product Details**: Complete product information including images, categories, and status
- **Stock Quantities**: Current stock levels for each product
- **Dual Pricing**: Both regular price and business/wholesale price support
- **Commission Calculation**: Automatic calculation of prices after commission
- **Total Values**: Calculated total value of stock holdings

### 📈 **Summary Statistics**
- **DCC Level**: Shows DCC profile information and performance metrics
- **Stock Summary**: Per-DCC summary of products, quantities, and values
- **Global Summary**: Overall statistics across all DCC users

### 🎯 **Sorting Options**
- **By Name**: Sort DCC users alphabetically
- **By Stock**: Sort by total stock quantity
- **By Price**: Sort by product prices
- **Ascending/Descending**: Both sort orders supported

## Examples

### Basic Request
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/stock" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search DCC Users
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/stock?search=Test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Minimum Stock
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/stock?minStock=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Category
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/stock?category=Health" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Pagination
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/stock?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Sorting
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/stock?sortBy=stock&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Combined Filters
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/stock?search=Test&minStock=1&category=Health&sortBy=price&sortOrder=desc&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Sample Response

```json
{
  "success": true,
  "data": {
    "dccUsers": [
      {
        "dccId": "cmdyd2g8v0000i9fz2keh45un",
        "dccName": "DCC User",
        "dccEmail": "dcc@djyh.rw",
        "dccPhone": "+250700000100",
        "dccAvatar": null,
        "dccIsActive": true,
        "dccCreatedAt": "2025-08-05T09:52:59.840Z",
        "dccUpdatedAt": "2025-08-05T09:52:59.840Z",
        "role": "DCC",
        "roleAssignedAt": "2025-08-05T09:53:00.216Z",
        "roleExpiresAt": null,
        "dccProfile": null,
        "productsInStock": [
          {
            "productId": "cmdzkxwu80001ddq9vd59cbre",
            "productName": "Condom - Premium",
            "productDescription": "Premium quality condoms",
            "productPrice": 2500,
            "productBusinessPrice": 2000,
            "productImage": null,
            "productImages": [],
            "productCategory": "Health & Wellness",
            "productSubcategory": null,
            "productStatus": "active",
            "productIsActive": true,
            "productCommission": 15,
            "stockQuantity": 1,
            "stockCreatedAt": "2025-08-06T11:24:32.191Z",
            "stockUpdatedAt": "2025-08-06T11:24:32.191Z",
            "brand": null,
            "seller": {
              "id": "cmcsgj0a4000cddsx5mzlxgfg",
              "name": "Employer Gemurai",
              "email": "employer@Gemurai.rw"
            },
            "priceAfterCommission": 2125,
            "totalValue": 2125
          }
        ],
        "stockSummary": {
          "totalProducts": 1,
          "totalQuantity": 1,
          "totalValue": 2125,
          "averagePrice": 2125
        }
      }
    ],
    "summary": {
      "totalDCCUsers": 1,
      "totalProductsInStock": 1,
      "totalQuantityInStock": 1,
      "totalValueInStock": 2125
    }
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  },
  "filters": {
    "search": "",
    "category": "",
    "minStock": 1,
    "sortBy": "name",
    "sortOrder": "asc"
  },
  "message": "Successfully retrieved 1 DCC users with their stock"
}
```

## Pricing Information

The API provides comprehensive pricing information for products in DCC stock:

### Price Types
- **`productPrice`**: Regular retail price of the product
- **`productBusinessPrice`**: Special business/wholesale price (if available)
- **`priceAfterCommission`**: Final price after commission deduction
- **`totalValue`**: Total value based on stock quantity and commission-adjusted price

### Commission Calculation

The API automatically calculates prices after commission for DCC users:

#### Formula
```
Commission Amount = (Original Price × Commission Percentage) ÷ 100
Price After Commission = Original Price - Commission Amount
Total Value = Price After Commission × Stock Quantity
```

#### Example
- **Regular Price**: 2,500 RWF
- **Business Price**: 2,000 RWF (if available)
- **Commission Percentage**: 15%
- **Commission Amount**: (2,500 × 15) ÷ 100 = 375 RWF
- **Price After Commission**: 2,500 - 375 = 2,125 RWF
- **Stock Quantity**: 1
- **Total Value**: 2,125 × 1 = 2,125 RWF

### Business Price Benefits
- **Wholesale Pricing**: Business price offers discounted rates for bulk purchases
- **Flexible Pricing**: DCCs can choose between regular and business pricing
- **Cost Optimization**: Better margins when using business pricing
- **Volume Discounts**: Encourages larger quantity purchases

## Use Cases

### 🏪 **Inventory Management**
- Track stock levels across all DCC users
- Monitor product distribution
- Identify stock shortages or surpluses

### 📊 **Business Intelligence**
- Analyze DCC performance
- Track product popularity
- Monitor commission calculations

### 🛒 **Customer Service**
- Help customers find DCC users with specific products
- Provide accurate pricing information
- Support product availability queries

### 💰 **Financial Planning**
- Calculate total inventory value
- Track commission earnings
- Monitor stock investments

## Error Handling

### Common Error Codes

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | "Unauthorized. Please log in." | Authentication required |
| 500 | "Failed to fetch DCC users with stock" | Server error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

## Rate Limiting
- Standard API rate limits apply
- Recommended: Maximum 100 requests per minute per user

## Data Freshness
- Stock data is real-time
- Updates reflect immediate changes to DCC stock levels
- Commission calculations are performed on each request

## Security
- Authentication required for all requests
- Data is filtered based on user permissions
- Sensitive information is properly sanitized

## Performance
- Optimized database queries with proper indexing
- Pagination support for large datasets
- Efficient filtering and sorting algorithms

## Integration Examples

### JavaScript/Fetch
```javascript
const response = await fetch('/api/v1/dcc/stock?minStock=1', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

### React Hook
```javascript
const useDCCStock = (filters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/v1/dcc/stock?${params}`);
      const result = await response.json();
      setData(result);
      setLoading(false);
    };
    
    fetchData();
  }, [filters]);
  
  return { data, loading };
};
```

### Python/Requests
```python
import requests

response = requests.get(
    'http://localhost:3000/api/v1/dcc/stock',
    headers={'Authorization': f'Bearer {token}'},
    params={'minStock': 1, 'category': 'Health'}
)
data = response.json()
```

## Testing

### Test Script
```javascript
// test-dcc-stock-api.js
const fetch = require('node-fetch');

async function testDCCStockAPI() {
  const baseUrl = 'http://localhost:3000/api/v1/dcc/stock';
  
  // Login to get token
  const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test.dcc@djyh.rw',
      password: 'dcc123!'
    })
  });
  
  const loginData = await loginResponse.json();
  const token = loginData.token;
  
  console.log('🧪 Testing DCC Stock API...\n');
  
  // Test 1: Basic request
  console.log('1. Basic request:');
  const basicResponse = await fetch(baseUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const basicData = await basicResponse.json();
  console.log(`   Status: ${basicResponse.status}`);
  console.log(`   DCC Users: ${basicData.data?.dccUsers?.length || 0}`);
  console.log(`   Total Products: ${basicData.data?.summary?.totalProductsInStock || 0}\n`);
  
  // Test 2: Filter by minimum stock
  console.log('2. Filter by minimum stock (minStock=1):');
  const stockResponse = await fetch(`${baseUrl}?minStock=1`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const stockData = await stockResponse.json();
  console.log(`   Status: ${stockResponse.status}`);
  console.log(`   DCC Users with stock: ${stockData.data?.dccUsers?.length || 0}\n`);
  
  // Test 3: Search functionality
  console.log('3. Search functionality (search=Test):');
  const searchResponse = await fetch(`${baseUrl}?search=Test`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const searchData = await searchResponse.json();
  console.log(`   Status: ${searchResponse.status}`);
  console.log(`   Search results: ${searchData.data?.dccUsers?.length || 0}\n`);
  
  console.log('✅ DCC Stock API tests completed!');
}

testDCCStockAPI().catch(console.error);
```

## Changelog

### Version 1.1.0 (2025-10-14)
- **NEW**: Added business price support (`productBusinessPrice` field)
- **ENHANCED**: Improved pricing information with dual pricing support
- **UPDATED**: Enhanced documentation with business price examples
- **IMPROVED**: Better commission calculation examples with business pricing

### Version 1.0.0 (2025-08-11)
- Initial release
- Basic DCC stock listing functionality
- Search and filtering capabilities
- Commission calculation integration
- Pagination support
- Comprehensive documentation

## Support

For technical support or questions about this API:
- Check the error messages for troubleshooting
- Verify authentication credentials
- Ensure proper query parameter formatting
- Review the response structure for data validation

---

**Last Updated**: October 14, 2025
**API Version**: 1.1.0
**Status**: Production Ready ✅
