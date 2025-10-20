# DCC Users API

## Endpoint
`GET /api/v1/dcc-users`

## Description
Returns users with the DCC role along with their associated products and DCC profile information.

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | "" | Search term to filter users by name, email, or phone |
| `includeProducts` | boolean | false | Include user's products in the response |
| `includeDCCProfile` | boolean | false | Include DCC profile information |

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "avatar": "string | null",
        "isActive": boolean,
        "createdAt": "string",
        "updatedAt": "string",
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
        },
        "products": [
          {
            "id": "string",
            "name": "string",
            "description": "string",
            "price": number,
            "image": "string",
            "images": ["string"],
            "category": "string",
            "subcategory": "string",
            "stock": number,
            "status": "string",
            "isActive": boolean,
            "commission": number,
            "brand": {
              "id": "string",
              "name": "string"
            },
            "averageRating": number,
            "reviewCount": number,
            "createdAt": "string",
            "updatedAt": "string"
          }
        ],
        "productStats": {
          "totalProducts": number,
          "activeProducts": number,
          "totalStock": number,
          "averagePrice": number,
          "totalValue": number
        }
      }
    ]
  },
  "message": "string"
}
```

### Error Response
```json
{
  "success": false,
  "error": "string",
  "details": "string"
}
```

## Examples

### Get all DCC users (basic)
```bash
curl "http://localhost:3000/api/v1/dcc-users"
```

### Get DCC users with products
```bash
curl "http://localhost:3000/api/v1/dcc-users?includeProducts=true"
```

### Get DCC users with DCC profile
```bash
curl "http://localhost:3000/api/v1/dcc-users?includeDCCProfile=true"
```

### Search DCC users
```bash
curl "http://localhost:3000/api/v1/dcc-users?search=dcc@djyh.rw"
```

### Complete example with all options
```bash
curl "http://localhost:3000/api/v1/dcc-users?includeProducts=true&includeDCCProfile=true&search=user"
```

## Features

- ✅ **Search**: Search by name, email, or phone number
- ✅ **Product Inclusion**: Optional inclusion of user's products
- ✅ **DCC Profile**: Optional inclusion of DCC profile data
- ✅ **Product Statistics**: Calculated stats when products are included
- ✅ **Product Reviews**: Includes verified reviews for products
- ✅ **Brand Information**: Includes brand details for products
- ✅ **Role Information**: Includes role assignment details

## Notes

- Only returns active users with active DCC role assignments
- Product reviews are limited to verified reviews only
- Product statistics are calculated on-the-fly
- Search is case-insensitive
- Returns all matching DCC users (no pagination)
