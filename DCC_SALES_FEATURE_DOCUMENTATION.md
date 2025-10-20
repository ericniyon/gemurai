# DCC Sales Feature Documentation

## 📋 Overview

The DCC Sales feature allows DCC (Digital Community Center) users to record customer sales, automatically deduct from their inventory, track revenue and profit, and manage their business operations efficiently.

## 🎯 Key Features

### **✅ Sales Recording**
- Record customer sales with product details
- Automatic stock deduction from DCC inventory
- Customer information tracking (name, phone, notes)
- Real-time profit calculation

### **✅ Stock Management**
- Automatic inventory updates
- Stock validation before sales
- Real-time stock level monitoring
- Low stock alerts

### **✅ Financial Tracking**
- Revenue tracking per sale
- Profit calculation (revenue - cost)
- Wallet integration for DCC earnings
- Transaction history

### **✅ Dashboard Integration**
- Sales recording interface in DCC dashboard
- Recent sales display
- Stock overview with metrics
- Performance indicators

## 🔄 Complete Workflow

### **Step 1: DCC Views Stock**
```bash
# DCC checks available stock
curl -X GET "http://localhost:3000/api/v1/dcc/stock" \
  -H "Authorization: Bearer DCC_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dccStock": [
      {
        "stockId": "stock_123",
        "productId": "prod_456",
        "productName": "Health Kit",
        "currentStock": 15,
        "priceAfterCommission": 850,
        "totalValue": 12750
      }
    ],
    "summary": {
      "totalProducts": 1,
      "totalQuantity": 15,
      "totalValue": 12750
    }
  }
}
```

### **Step 2: DCC Records Sale**
```bash
# DCC records a customer sale
curl -X POST "http://localhost:3000/api/v1/dcc/sales" \
  -H "Authorization: Bearer DCC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_456",
    "quantity": 3,
    "salePrice": 1000,
    "customerName": "John Doe",
    "customerPhone": "+250700000123",
    "notes": "Customer requested delivery"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Sale recorded successfully",
  "data": {
    "saleId": "sale_789",
    "productName": "Health Kit",
    "quantity": 3,
    "salePrice": 1000,
    "totalRevenue": 3000,
    "profit": 450,
    "remainingStock": 12,
    "transactionId": "txn_456"
  }
}
```

### **Step 3: Automatic Processing**
When a sale is recorded, the system automatically:

1. **Validates stock availability**
2. **Deducts from DCC stock**
3. **Calculates profit and revenue**
4. **Creates sales record**
5. **Updates DCC wallet**
6. **Records transaction**

## 🏗️ Technical Implementation

### **Database Schema**

#### **Sale Model:**
```prisma
model Sale {
  id           String   @id @default(cuid())
  dccId        String
  productId    String
  quantity     Int
  salePrice    Float
  totalRevenue Float
  costPrice    Float
  totalCost    Float
  profit       Float
  customerName String?
  customerPhone String?
  notes        String?
  saleDate     DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  dcc          User     @relation(fields: [dccId], references: [id])
  product      Product  @relation(fields: [productId], references: [id])

  @@map("sales")
}
```

### **API Endpoints**

#### **POST /api/v1/dcc/sales - Record Sale**
```typescript
// Request Body
{
  productId: string      // Required: Product ID from DCC stock
  quantity: number       // Required: Quantity to sell
  salePrice: number      // Required: Price per unit
  customerName?: string  // Optional: Customer name
  customerPhone?: string // Optional: Customer phone
  notes?: string         // Optional: Additional notes
}

// Response
{
  success: boolean
  message: string
  data: {
    saleId: string
    productName: string
    quantity: number
    salePrice: number
    totalRevenue: number
    profit: number
    remainingStock: number
    transactionId: string
  }
}
```

#### **GET /api/v1/dcc/sales - View Sales**
```typescript
// Query Parameters
{
  page?: number        // Pagination page (default: 1)
  limit?: number       // Items per page (default: 10)
  startDate?: string   // Filter by start date
  endDate?: string     // Filter by end date
  productId?: string   // Filter by product
}

// Response
{
  success: boolean
  data: {
    sales: Sale[]
    summary: {
      totalSales: number
      totalRevenue: number
      totalProfit: number
      averageSalePrice: number
    }
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}
```

### **Business Logic**

#### **Stock Validation:**
```typescript
// Check if DCC has enough stock
const dccStock = await prisma.dCCStock.findUnique({
  where: {
    dccId_productId: {
      dccId: user.id,
      productId: productId
    }
  }
})

if (!dccStock || dccStock.quantity < quantity) {
  throw new Error(`Insufficient stock. Available: ${dccStock?.quantity || 0}`)
}
```

#### **Profit Calculation:**
```typescript
// Calculate profit (sale price - cost price after commission)
const costPriceAfterCommission = dccStock.product.price - 
  (dccStock.product.price * (dccStock.product.commission || 0) / 100)
const totalCost = costPriceAfterCommission * quantity
const totalRevenue = salePrice * quantity
const profit = totalRevenue - totalCost
```

#### **Stock Deduction:**
```typescript
// Deduct from DCC stock
await prisma.dCCStock.update({
  where: {
    dccId_productId: {
      dccId: user.id,
      productId: productId
    }
  },
  data: {
    quantity: {
      decrement: quantity
    }
  }
})
```

#### **Wallet Update:**
```typescript
// Add sale revenue to DCC wallet
await prisma.wallet.update({
  where: { userId: user.id },
  data: {
    balance: {
      increment: totalRevenue
    }
  }
})

// Create transaction record
await prisma.transaction.create({
  data: {
    walletId: dccWallet.id,
    type: "DEPOSIT",
    amount: totalRevenue,
    status: "COMPLETED",
    description: `Sale of ${quantity} units of ${productName}`
  }
})
```

## 🎨 User Interface

### **Dashboard Integration**

The sales recording feature is integrated into the DCC dashboard with:

#### **Sales Recording Card:**
- **Record Sale Button**: Opens sales recording dialog
- **Stock Overview**: Shows available products and quantities
- **Quick Stats**: Products in stock, total value, recent sales

#### **Sales Recording Dialog:**
- **Product Selection**: Dropdown with available stock
- **Quantity Input**: With stock validation
- **Price Input**: Sale price per unit
- **Customer Information**: Name and phone (optional)
- **Notes Field**: Additional sale information
- **Sale Summary**: Real-time calculation of revenue and profit

#### **Recent Sales Display:**
- **Sales History**: List of recent transactions
- **Sale Details**: Product, quantity, price, date
- **Revenue Tracking**: Total revenue per sale

### **Features:**

#### **✅ Real-time Validation:**
- Stock availability checking
- Quantity limits based on available stock
- Price validation (must be positive)

#### **✅ Automatic Calculations:**
- Total revenue calculation
- Profit calculation
- Cost tracking

#### **✅ User Experience:**
- Intuitive form design
- Clear error messages
- Success confirmations
- Loading states

## 📊 Data Flow

### **Sale Recording Process:**

1. **User Input** → Sales form data
2. **Validation** → Check stock availability
3. **Calculation** → Revenue and profit calculation
4. **Database Update** → Stock deduction and sale creation
5. **Wallet Update** → Add revenue to DCC wallet
6. **Transaction Record** → Create transaction history
7. **UI Update** → Refresh dashboard data

### **Stock Management:**

```
Before Sale:
├── DCC Stock: 15 units
├── Product Value: 12,750 RWF
└── Available for Sale: 15 units

After Sale (3 units):
├── DCC Stock: 12 units
├── Product Value: 10,200 RWF
├── Revenue: 3,000 RWF
├── Profit: 450 RWF
└── Available for Sale: 12 units
```

## 🛡️ Security & Validation

### **Authentication:**
- JWT token validation
- Role-based access (DCC only)
- Session management

### **Authorization:**
- Only DCC users can record sales
- Users can only access their own sales data
- Product ownership validation

### **Input Validation:**
- Required field validation
- Quantity must be positive
- Sale price must be positive
- Stock availability checking

### **Business Rules:**
- Cannot sell more than available stock
- Cannot sell products not in DCC stock
- Automatic stock deduction on successful sale

## 🧪 Testing

### **Test Coverage:**

#### **✅ API Testing:**
- Sales recording (POST)
- Sales retrieval (GET)
- Error handling
- Validation testing

#### **✅ Business Logic Testing:**
- Stock deduction verification
- Profit calculation accuracy
- Wallet update verification
- Transaction recording

#### **✅ UI Testing:**
- Form validation
- Real-time calculations
- Error message display
- Success confirmations

### **Test Script:**
```bash
# Run comprehensive sales workflow test
node test-dcc-sales-workflow.js
```

## 📈 Business Benefits

### **For DCC Users:**
- ✅ **Easy Sales Recording**: Simple interface for recording sales
- ✅ **Automatic Inventory Management**: Stock updates automatically
- ✅ **Profit Tracking**: Real-time profit calculation
- ✅ **Customer Management**: Track customer information
- ✅ **Financial Visibility**: Clear revenue and profit overview

### **For System:**
- ✅ **Data Consistency**: Transaction-based operations
- ✅ **Audit Trail**: Complete sales history
- ✅ **Performance Tracking**: Sales analytics and metrics
- ✅ **Inventory Control**: Real-time stock management

## 🚀 Usage Examples

### **Basic Sale Recording:**
```javascript
// Record a simple sale
const saleData = {
  productId: "prod_123",
  quantity: 2,
  salePrice: 1000,
  customerName: "John Doe"
}

const response = await fetch('/api/v1/dcc/sales', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(saleData)
})
```

### **Sales History Retrieval:**
```javascript
// Get sales with filtering
const response = await fetch('/api/v1/dcc/sales?page=1&limit=10&startDate=2024-01-01', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const data = await response.json()
console.log('Total Sales:', data.data.summary.totalSales)
console.log('Total Revenue:', data.data.summary.totalRevenue)
```

### **Dashboard Integration:**
```typescript
// React component for sales recording
import { SalesRecorder } from './components/sales-recorder'

function DCCDashboard() {
  return (
    <div>
      <SalesRecorder />
      {/* Other dashboard components */}
    </div>
  )
}
```

## 📞 Support

For technical support or questions about the DCC Sales feature, please refer to the main API documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: ✅ Production Ready
