# Stock Orders Commission Feature Documentation

## 📋 Overview

The Stock Orders API now includes automatic commission calculation for DCC users. When a DCC user creates a stock order, the system automatically deducts the product commission from the original price, providing DCC users with a discounted rate.

## 🔧 Commission Calculation Logic

### Formula
```
Commission Amount = (Original Price × Commission Percentage) ÷ 100
Price After Commission = Original Price - Commission Amount
Total Amount = Price After Commission × Quantity
```

### Example Calculations

#### Example 1: Toilet Paper
- **Original Price**: 500 RWF
- **Commission Percentage**: 12%
- **Commission Amount**: (500 × 12) ÷ 100 = 60 RWF
- **Price After Commission**: 500 - 60 = 440 RWF
- **Quantity**: 2
- **Total Amount**: 440 × 2 = 880 RWF

#### Example 2: OMO Detergent
- **Original Price**: 3,500 RWF
- **Commission Percentage**: 20%
- **Commission Amount**: (3,500 × 20) ÷ 100 = 700 RWF
- **Price After Commission**: 3,500 - 700 = 2,800 RWF
- **Quantity**: 1
- **Total Amount**: 2,800 × 1 = 2,800 RWF

#### Example 3: Soap Bar
- **Original Price**: 1,200 RWF
- **Commission Percentage**: 18%
- **Commission Amount**: (1,200 × 18) ÷ 100 = 216 RWF
- **Price After Commission**: 1,200 - 216 = 984 RWF
- **Quantity**: 1
- **Total Amount**: 984 × 1 = 984 RWF

## 🚀 API Endpoints

### Create Stock Order with Commission

**POST** `/api/v1/stock-orders` or `/api/stock-orders`

Creates a new stock order with automatic commission calculation.

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
    "id": "cme7138u80011jfszbw7ksehw",
    "dccId": "cme6z3q5g0003jfdxywg2zv1b",
    "totalAmount": 1464,
    "status": "pending",
    "priority": "medium",
    "requestDate": "2025-08-11T11:27:37.088Z",
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
    "createdAt": "2025-08-11T11:27:37.088Z",
    "updatedAt": "2025-08-11T11:27:37.088Z"
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
    "productId": "cmdzkxx5p0003ddq9s74trrcr",
    "quantity": 3,
    "comment": "Test order with commission calculation"
  }'
```

## 📊 Response Structure

### Stock Order Information
- `id`: Unique identifier for the stock order
- `dccId`: DCC user ID who created the order
- `totalAmount`: Final amount after commission calculation
- `status`: Order status (pending, payment_confirmed, etc.)
- `notes`: Additional notes for the order

### Pricing Information
- `originalPrice`: Original product price before commission
- `commissionPercentage`: Commission percentage (e.g., 12 for 12%)
- `commissionAmount`: Calculated commission amount in RWF
- `priceAfterCommission`: Price after commission deduction
- `quantity`: Quantity ordered
- `totalAmount`: Total amount for the order (price after commission × quantity)

## 🛡️ Security Features

1. **Role-Based Access**: Only DCC users can create stock orders
2. **Commission Transparency**: All pricing details are clearly shown in the response
3. **Automatic Calculation**: Commission is automatically calculated and applied
4. **Data Integrity**: Commission calculations are performed within database transactions

## 🔄 Database Changes

### StockOrderProduct Model
The `price` field in `StockOrderProduct` now stores the price after commission:

```prisma
model StockOrderProduct {
  id             String     @id @default(cuid())
  stockOrderId   String
  productId      String
  quantity       Int
  currentStock   Int
  requestedStock Int
  price          Float      // Now stores price after commission
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  product        Product    @relation(fields: [productId], references: [id])
  stockOrder     StockOrder @relation(fields: [stockOrderId], references: [id])
}
```

### Product Model
Products have a `commission` field that defines the commission amount:

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  price       Float
  commission  Float    @default(0)  // Commission amount
  // ... other fields
}
```

## 🧪 Testing

### Test Products with Commission
```json
{
  "Toilet Paper": {
    "id": "cmdzkxx5p0003ddq9s74trrcr",
    "originalPrice": 500,
    "commissionPercentage": 12,
    "commissionAmount": 60,
    "priceAfterCommission": 440
  },
  "Soap Bar": {
    "id": "cmdzkxxuz0005ddq9pujkqeaa",
    "originalPrice": 1200,
    "commissionPercentage": 18,
    "commissionAmount": 216,
    "priceAfterCommission": 984
  },
  "OMO Detergent": {
    "id": "cmdzkxxv80007ddq9n2imnl9i",
    "originalPrice": 3500,
    "commissionPercentage": 20,
    "commissionAmount": 700,
    "priceAfterCommission": 2800
  },
  "Rice": {
    "id": "cmdzkxxva0009ddq9dfzrg4fh",
    "originalPrice": 2800,
    "commissionPercentage": 10,
    "commissionAmount": 280,
    "priceAfterCommission": 2520
  },
  "Salt": {
    "id": "cmdzkxxvj000bddq9367ip9xb",
    "originalPrice": 800,
    "commissionPercentage": 8,
    "commissionAmount": 64,
    "priceAfterCommission": 736
  }
}
```

### Complete Test Flow
```bash
# 1. Login as DCC user
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test.dcc@djyh.rw", "password": "dcc123!"}'

# 2. Create stock order with commission calculation
curl -X POST "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "cmdzkxx5p0003ddq9s74trrcr",
    "quantity": 3,
    "comment": "Test commission calculation"
  }'

# Expected Response:
# {
#   "success": true,
#   "stockOrder": { "totalAmount": 880 },
#   "pricing": {
#     "originalPrice": 500,
#     "commissionPercentage": 12,
#     "commissionAmount": 60,
#     "priceAfterCommission": 440,
#     "quantity": 2,
#     "totalAmount": 880
#   }
# }
```

## 🎯 Business Logic

### Commission Application Rules
1. **Automatic Calculation**: Commission percentage is automatically calculated for all DCC stock orders
2. **Transparency**: All pricing details are clearly shown in the API response
3. **Consistency**: Both `/api/v1/stock-orders` and `/api/stock-orders` endpoints apply the same logic
4. **Zero Commission**: If a product has no commission (commission = 0%), the price remains unchanged
5. **Percentage-Based**: Commission is calculated as a percentage of the original price

### Benefits for DCC Users
1. **Reduced Costs**: DCC users get products at discounted prices
2. **Transparent Pricing**: Clear breakdown of original price, commission, and final price
3. **Automatic Application**: No manual calculation required
4. **Consistent Pricing**: Same logic applied across all stock order endpoints

### Benefits for Employers
1. **Commission Revenue**: Employers earn commission on each sale
2. **Flexible Pricing**: Can set different commission rates for different products
3. **Clear Tracking**: Commission amounts are clearly tracked in the system

## 🔧 Implementation Details

### Features Implemented ✅
- [x] Automatic commission calculation
- [x] Transparent pricing in API responses
- [x] Database storage of price after commission
- [x] Consistent logic across all endpoints
- [x] Error handling for missing products
- [x] Commission validation (handles zero commission)

### Code Changes
1. **Price Calculation**: Updated to subtract commission from original price
2. **Database Storage**: StockOrderProduct now stores price after commission
3. **API Response**: Added detailed pricing information
4. **Consistency**: Both stock order endpoints updated

### Error Handling
- **Product Not Found**: Returns 404 error
- **Invalid Quantity**: Returns 400 error
- **Missing Fields**: Returns 400 error with specific field names
- **Database Errors**: Returns 500 error with generic message

## 📝 Notes

1. **Commission Transparency**: All commission calculations are clearly shown in API responses
2. **Backward Compatibility**: Existing orders remain unchanged
3. **Database Integrity**: Commission calculations are performed within transactions
4. **Performance**: No additional database queries required for commission calculation

## 🔗 Related APIs

- **Stock Orders API**: `/api/v1/stock-orders` - Create and manage stock orders
- **Products API**: `/api/products` - Get product information including commission
- **DCC Approved Stock Requests**: `/api/v1/dcc/approved-stock-requests` - View orders with payment confirmed

## 🎯 Use Cases

1. **DCC Cost Reduction**: DCC users get products at reduced prices
2. **Commission Tracking**: Clear tracking of commission amounts
3. **Pricing Transparency**: Full visibility into pricing calculations
4. **Business Intelligence**: Detailed pricing data for reporting
5. **Financial Planning**: Accurate cost calculations for DCC users
