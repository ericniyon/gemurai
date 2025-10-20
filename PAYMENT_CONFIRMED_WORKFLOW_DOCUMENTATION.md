# Payment Confirmed Workflow Documentation

## 📋 Overview

When an EMPLOYER confirms payment for a DCC's stock request, the system automatically processes a complete stock transfer workflow that includes:

1. **Deducting stock from EMPLOYER's inventory**
2. **Adding stock to DCC's inventory**
3. **Processing payment to EMPLOYER's wallet**
4. **Updating order status and payment records**

## 🔄 Complete Workflow

### **Step 1: DCC Requests Stock**
```bash
# DCC creates a stock order
curl -X POST "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer DCC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "quantity": 10,
    "comment": "Need stock for business"
  }'
```

**Response:**
```json
{
  "success": true,
  "stockOrder": {
    "id": "order_456",
    "status": "pending",
    "totalAmount": 8500,
    "dccId": "dcc_123"
  },
  "pricing": {
    "originalPrice": 1000,
    "commissionPercentage": 15,
    "commissionAmount": 150,
    "priceAfterCommission": 850,
    "quantity": 10,
    "totalAmount": 8500
  }
}
```

### **Step 2: EMPLOYER Confirms Payment**
```bash
# EMPLOYER confirms payment (triggers stock transfer)
curl -X PATCH "http://localhost:3000/api/v1/stock-orders" \
  -H "Authorization: Bearer EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_456",
    "status": "payment_confirmed"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Stock order payment_confirmed successfully"
}
```

### **Step 3: Automatic Stock Transfer**
When payment is confirmed, the system automatically:

1. **Updates order status** to `"payment_confirmed"`
2. **Updates payment status** to `"CONFIRMED"`
3. **Deducts stock from EMPLOYER's products**
4. **Adds stock to DCC's inventory**
5. **Processes payment to EMPLOYER's wallet**

## 🏗️ Technical Implementation

### **Database Transaction**
The entire process is wrapped in a database transaction to ensure data consistency:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Update order status
  await tx.stockOrder.update({
    where: { id: orderId },
    data: {
      status: 'payment_confirmed',
      paymentConfirmedBy: employerId,
      paymentConfirmedAt: new Date()
    }
  })

  // 2. Update payment status
  await tx.payment.update({
    where: { stockOrderId: orderId },
    data: {
      status: 'CONFIRMED',
      paidAt: new Date()
    }
  })

  // 3. Process stock transfer for each product
  for (const orderProduct of stockOrder.products) {
    // Check stock availability
    const product = await tx.product.findUnique({
      where: { id: orderProduct.productId }
    })

    if (!product || product.stock < orderProduct.quantity) {
      throw new Error(`Insufficient stock for product ${orderProduct.product.name}`)
    }

    // Deduct from EMPLOYER stock
    await tx.product.update({
      where: { id: orderProduct.productId },
      data: {
        stock: { decrement: orderProduct.quantity }
      }
    })

    // Add to DCC stock
    await tx.dCCStock.upsert({
      where: {
        dccId_productId: {
          dccId: stockOrder.dccId,
          productId: orderProduct.productId
        }
      },
      create: {
        dccId: stockOrder.dccId,
        productId: orderProduct.productId,
        quantity: orderProduct.quantity
      },
      update: {
        quantity: { increment: orderProduct.quantity }
      }
    })
  }

  // 4. Process payment to EMPLOYER wallet
  let employerWallet = await tx.wallet.findUnique({
    where: { userId: employerId }
  })

  if (!employerWallet) {
    employerWallet = await tx.wallet.create({
      data: {
        userId: employerId,
        balance: 0,
        minimumBalance: 1000,
        status: 'ACTIVE'
      }
    })
  }

  // Create transaction record
  await tx.transaction.create({
    data: {
      walletId: employerWallet.id,
      type: 'DEPOSIT',
      amount: stockOrder.totalAmount,
      status: 'COMPLETED',
      description: `Payment confirmed for stock order #${stockOrder.id}`
    }
  })

  // Update wallet balance
  await tx.wallet.update({
    where: { id: employerWallet.id },
    data: {
      balance: { increment: stockOrder.totalAmount }
    }
  })
})
```

## 📊 Stock Transfer Details

### **Before Transfer:**
- **EMPLOYER Product Stock**: 50 units
- **DCC Stock**: 0 units
- **Order Quantity**: 10 units

### **After Transfer:**
- **EMPLOYER Product Stock**: 40 units (50 - 10)
- **DCC Stock**: 10 units (0 + 10)
- **Order Status**: `payment_confirmed`

## 💰 Payment Processing

### **Payment Flow:**
1. **DCC pays**: 8,500 RWF (10 units × 850 RWF after commission)
2. **EMPLOYER receives**: 8,500 RWF in their wallet
3. **Transaction recorded**: DEPOSIT transaction in EMPLOYER's wallet

### **Commission Calculation:**
- **Original Price**: 1,000 RWF
- **Commission**: 15%
- **Commission Amount**: 150 RWF
- **Price After Commission**: 850 RWF
- **Total for 10 units**: 8,500 RWF

## 🔍 Verification APIs

### **Check DCC Stock After Transfer:**
```bash
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
        "productId": "prod_123",
        "productName": "Health Kit",
        "currentStock": 10,
        "priceAfterCommission": 850,
        "totalValue": 8500
      }
    ],
    "summary": {
      "totalProducts": 1,
      "totalQuantity": 10,
      "totalValue": 8500
    }
  }
}
```

### **Check EMPLOYER Products After Transfer:**
```bash
curl -X GET "http://localhost:3000/api/v1/dcc-users" \
  -H "Authorization: Bearer EMPLOYER_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "employer_123",
        "products": [
          {
            "id": "prod_123",
            "name": "Health Kit",
            "stock": 40, // Reduced from 50
            "price": 1000
          }
        ]
      }
    ]
  }
}
```

### **Check Approved Stock Requests:**
```bash
curl -X GET "http://localhost:3000/api/v1/dcc/approved-stock-requests" \
  -H "Authorization: Bearer DCC_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "order_456",
      "orderStatus": "payment_confirmed",
      "totalAmount": 8500,
      "products": [
        {
          "productId": "prod_123",
          "productName": "Health Kit",
          "quantity": 10,
          "orderPrice": 850,
          "totalValue": 8500
        }
      ],
      "payment": {
        "status": "CONFIRMED",
        "amount": 8500,
        "method": "BANK_TRANSFER"
      }
    }
  ]
}
```

## 🛡️ Error Handling

### **Insufficient Stock:**
```json
{
  "success": false,
  "message": "Insufficient stock for product Health Kit. Available: 5, Requested: 10"
}
```

### **Invalid Order:**
```json
{
  "success": false,
  "message": "Stock order not found"
}
```

### **Unauthorized Access:**
```json
{
  "success": false,
  "message": "Only employers can approve or reject orders"
}
```

## 🧪 Testing

### **Run Complete Workflow Test:**
```bash
node test-payment-confirmed-workflow.js
```

### **Test Coverage:**
- ✅ **DCC Stock API**: View DCC's inventory
- ✅ **Stock Orders API**: Create and manage orders
- ✅ **Payment Confirmation**: EMPLOYER confirms payment
- ✅ **Stock Transfer**: Automatic transfer between EMPLOYER and DCC
- ✅ **Payment Processing**: EMPLOYER receives payment
- ✅ **Status Updates**: Order and payment status updates

## 📈 Business Logic

### **Stock Management Rules:**
1. **Stock Validation**: Check sufficient stock before transfer
2. **Atomic Operations**: All operations succeed or fail together
3. **Audit Trail**: Track all stock movements and payments
4. **Commission Handling**: Apply commission to pricing
5. **Wallet Management**: Automatic wallet creation and balance updates

### **Security Features:**
1. **Role-Based Access**: Only EMPLOYER can confirm payment
2. **Ownership Validation**: EMPLOYER can only confirm their own products
3. **Transaction Safety**: Database transactions ensure consistency
4. **Input Validation**: Validate all input parameters

## 🚀 Benefits

### **For DCC:**
- ✅ **Automatic Stock Addition**: Stock added immediately upon payment confirmation
- ✅ **Inventory Tracking**: Complete visibility of their stock
- ✅ **Payment History**: Track all approved orders and payments

### **For EMPLOYER:**
- ✅ **Automatic Stock Deduction**: Inventory updated automatically
- ✅ **Payment Processing**: Immediate payment to wallet
- ✅ **Order Management**: Complete order lifecycle tracking

### **For System:**
- ✅ **Data Consistency**: Transaction-based operations
- ✅ **Audit Trail**: Complete history of all operations
- ✅ **Scalability**: Efficient database operations
- ✅ **Error Handling**: Comprehensive error management

## 📞 Support

For technical support or questions about the Payment Confirmed Workflow, please refer to the main API documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: ✅ Production Ready
