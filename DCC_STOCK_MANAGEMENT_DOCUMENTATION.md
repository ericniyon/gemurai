# DCC Stock Management System Documentation

## 📋 Overview

The DCC Stock Management System allows DCC (Distributor Community Center) users to manage their inventory of products they've requested and received. This system provides a complete inventory management solution for DCC users to track their stock levels, view product details, and manage their business operations.

## 🚀 Features

### ✅ **Core Features**
- **Stock Inventory**: View all products in DCC's stock
- **Stock Updates**: Add/remove stock quantities
- **Product Details**: Complete product information with pricing
- **Commission Calculation**: Automatic commission-based pricing
- **Search & Filtering**: Find products by name, category, stock level
- **Pagination**: Handle large inventory datasets
- **Sorting**: Sort by name, quantity, price, date
- **Summary Statistics**: Total products, quantity, value

### ✅ **Advanced Features**
- **Low Stock Alerts**: Identify products below threshold
- **Stock History**: Track stock changes over time
- **Value Calculation**: Total inventory value with commission
- **Category Management**: Organize products by category
- **Real-time Updates**: Immediate stock level updates

## 🔗 API Endpoints

### **GET /api/v1/dcc/stock**
**View DCC's complete stock inventory**

#### **Authentication**
- **Required**: Bearer Token (DCC role only)
- **Header**: `Authorization: Bearer <token>`

#### **Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page (max 100) |
| `search` | string | "" | Search products by name/description |
| `category` | string | "" | Filter by product category |
| `minStock` | number | 0 | Minimum stock quantity filter |
| `sortBy` | string | "name" | Sort field (name, quantity, price) |
| `sortOrder` | string | "asc" | Sort direction (asc, desc) |

#### **Response Format**
```json
{
  "success": true,
  "data": {
    "dccStock": [
      {
        "stockId": "stock_123",
        "productId": "prod_456",
        "productName": "Health Kit",
        "productDescription": "Complete health kit",
        "productPrice": 1000,
        "productImage": "image_url",
        "productCategory": "Health",
        "productCommission": 15,
        "currentStock": 25,
        "priceAfterCommission": 850,
        "totalValue": 21250,
        "seller": {
          "id": "seller_123",
          "name": "Seller Name",
          "email": "seller@example.com"
        },
        "lastUpdated": "2024-01-01T00:00:00Z",
        "stockInfo": {
          "originalPrice": 1000,
          "commissionPercentage": 15,
          "commissionAmount": 150,
          "priceAfterCommission": 850,
          "quantity": 25,
          "totalValue": 21250
        }
      }
    ],
    "summary": {
      "totalProducts": 10,
      "totalQuantity": 150,
      "totalValue": 127500,
      "averagePrice": 850
    },
    "categories": ["Health", "Electronics", "Food"],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 10,
      "pages": 1
    }
  }
}
```

### **POST /api/v1/dcc/stock**
**Add or remove stock from DCC inventory**

#### **Authentication**
- **Required**: Bearer Token (DCC role only)
- **Header**: `Authorization: Bearer <token>`

#### **Request Body**
```json
{
  "productId": "prod_123",
  "quantity": 10,
  "action": "add" // "add" or "remove"
}
```

#### **Response Format**
```json
{
  "success": true,
  "message": "Stock added successfully",
  "data": {
    "stockId": "stock_123",
    "productId": "prod_123",
    "productName": "Product Name",
    "quantity": 15,
    "priceAfterCommission": 850,
    "totalValue": 12750,
    "action": "add",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## 🔄 **Complete Workflow**

### **1. DCC Requests Stock**
```bash
# DCC creates a stock order
curl -X POST "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "quantity": 10,
    "comment": "Need stock for business"
  }'
```

### **2. Payment Confirmation**
- Order status changes to `"payment_confirmed"`
- Stock is automatically added to DCC inventory

### **3. View DCC Stock**
```bash
# DCC can view their complete inventory
curl -X GET "http://localhost:3000/api/v1/dcc/stock" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **4. Manage Stock Levels**
```bash
# Add more stock
curl -X POST "http://localhost:3000/api/v1/dcc/stock" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "quantity": 5,
    "action": "add"
  }'

# Remove stock (when sold)
curl -X POST "http://localhost:3000/api/v1/dcc/stock" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "quantity": 2,
    "action": "remove"
  }'
```

## 💰 **Commission Calculation**

### **Formula**
```
Commission Amount = (Original Price × Commission Percentage) ÷ 100
Price After Commission = Original Price - Commission Amount
Total Value = Price After Commission × Quantity
```

### **Example**
- **Original Price**: 1000 RWF
- **Commission**: 15%
- **Commission Amount**: (1000 × 15) ÷ 100 = 150 RWF
- **Price After Commission**: 1000 - 150 = 850 RWF
- **Quantity**: 10 units
- **Total Value**: 850 × 10 = 8,500 RWF

## 📊 **Database Schema**

### **DCCStock Model**
```prisma
model DCCStock {
  id        String   @id @default(cuid())
  dccId     String
  productId String
  quantity  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  dcc       User     @relation(fields: [dccId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])

  @@unique([dccId, productId])
  @@map("dcc_stocks")
}
```

## 🛠️ **Service Layer**

### **DCCStockService**
The service provides methods for:
- `updateStockFromOrder()`: Update stock when orders are completed
- `addStockToDCC()`: Add stock to DCC inventory
- `removeStockFromDCC()`: Remove stock from DCC inventory
- `getDCCStockSummary()`: Get summary statistics
- `getLowStockItems()`: Get items below threshold

## 🧪 **Testing**

### **Run Test Script**
```bash
node test-dcc-stock-management.js
```

### **Test Coverage**
- ✅ Stock retrieval and pagination
- ✅ Stock addition and removal
- ✅ Search and filtering
- ✅ Commission calculation
- ✅ Error handling
- ✅ Authentication and authorization

## 📈 **Business Logic**

### **Stock Management Rules**
1. **Automatic Updates**: Stock is added when orders are payment confirmed
2. **Manual Updates**: DCC can manually add/remove stock
3. **Validation**: Cannot remove more stock than available
4. **Commission**: All calculations include commission percentages
5. **History**: All stock changes are tracked with timestamps

### **Inventory Best Practices**
1. **Regular Monitoring**: Check stock levels regularly
2. **Low Stock Alerts**: Set up alerts for items below threshold
3. **Value Tracking**: Monitor total inventory value
4. **Category Organization**: Group products by category
5. **Performance Analysis**: Track stock turnover rates

## 🔐 **Security**

### **Authentication**
- JWT token required for all operations
- Only DCC users can access their stock
- Role-based access control

### **Validation**
- Product existence verification
- Quantity validation (non-negative)
- Stock availability checks
- Input sanitization

## 📱 **Usage Examples**

### **Frontend Integration**
```javascript
// Get DCC stock
const getDCCStock = async (token) => {
  const response = await fetch('/api/v1/dcc/stock', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Add stock
const addStock = async (token, productId, quantity) => {
  const response = await fetch('/api/v1/dcc/stock', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productId,
      quantity,
      action: 'add'
    })
  });
  return response.json();
};
```

## 🚀 **Deployment**

### **Prerequisites**
- PostgreSQL database
- Next.js application
- Prisma ORM
- JWT authentication

### **Environment Variables**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
```

### **Database Migration**
```bash
npx prisma migrate dev
npx prisma generate
```

## 📞 **Support**

For technical support or questions about the DCC Stock Management System, please refer to the main API documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: ✅ Production Ready
