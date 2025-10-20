# Stock Quantities Management System

## Overview

The Stock Quantities system provides real-time inventory tracking with three key metrics: **Total Quantity**, **Available Quantity**, and **Reserved Quantity**. This system integrates seamlessly with the Odoo-style inventory management to ensure accurate stock levels across all warehouses and locations.

## Key Features

### 🔄 Real-time Stock Tracking
- **Total Quantity**: Physical stock on hand
- **Available Quantity**: Stock available for new orders
- **Reserved Quantity**: Stock reserved for confirmed orders
- **Location-based**: Track stock at warehouse and location level

### ⚙️ Stock Adjustments
- **Increase Stock**: Add stock due to receipts, found items, etc.
- **Decrease Stock**: Remove stock due to damage, theft, etc.
- **Set Exact Quantity**: Correct stock to exact count (cycle counts)
- **Audit Trail**: Complete history of all adjustments

### 📊 Analytics & Reporting
- **Low Stock Alerts**: Items below reorder point
- **Out of Stock Items**: Items with zero available quantity
- **Stock Statistics**: Comprehensive inventory metrics
- **Movement History**: Complete audit trail

## Stock Quantity Formula

```
Available Quantity = Total Quantity - Reserved Quantity
```

This ensures that:
- Stock can't be oversold
- Reserved stock is protected
- Available stock reflects what can actually be sold

## API Endpoints

### Get Stock Quantities
```http
GET /api/v1/superadmin/stock-quantities
```

**Query Parameters:**
- `productId` (optional): Filter by specific product
- `warehouseId` (optional): Filter by warehouse
- `locationId` (optional): Filter by location

**Response:**
```json
{
  "success": true,
  "stockQuantities": [
    {
      "id": "sq_123",
      "productId": "prod_456",
      "warehouseId": "wh_789",
      "locationId": "loc_012",
      "quantity": 100,
      "reservedQuantity": 20,
      "availableQuantity": 80,
      "lastUpdated": "2024-01-15T10:30:00Z",
      "product": {
        "id": "prod_456",
        "name": "Sample Product",
        "code": "SP001"
      },
      "warehouse": {
        "id": "wh_789",
        "name": "Main Warehouse",
        "code": "MW01"
      },
      "location": {
        "id": "loc_012",
        "name": "A1-B2",
        "code": "A1B2"
      }
    }
  ]
}
```

### Adjust Stock Quantities
```http
POST /api/v1/superadmin/stock-quantities/adjust
```

**Request Body:**
```json
{
  "productId": "prod_456",
  "warehouseId": "wh_789",
  "locationId": "loc_012",
  "quantity": 10,
  "adjustmentType": "INCREASE",
  "reason": "cycle_count",
  "notes": "Cycle count correction"
}
```

**Adjustment Types:**
- `INCREASE`: Add to current quantity
- `DECREASE`: Subtract from current quantity
- `SET`: Set to exact quantity

**Predefined Reasons:**
- `cycle_count`: Cycle Count Correction
- `damaged`: Damaged Goods
- `expired`: Expired Products
- `theft`: Theft/Loss
- `found`: Found Stock
- `system_error`: System Error Correction
- `other`: Other (requires notes)

### Get Stock Movement History
```http
GET /api/v1/superadmin/stock-quantities/history?productId=prod_456
```

**Query Parameters:**
- `productId` (required): Product to get history for
- `warehouseId` (optional): Filter by warehouse
- `locationId` (optional): Filter by location
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "movements": [
    {
      "id": "move_123",
      "type": "STOCK_MOVE",
      "moveType": "INCOMING",
      "quantity": 50,
      "date": "2024-01-15T10:30:00Z",
      "user": {
        "id": "user_456",
        "name": "John Doe"
      },
      "product": {...},
      "warehouse": {...},
      "sourceLocation": null,
      "destinationLocation": {...}
    },
    {
      "id": "adj_789",
      "type": "ADJUSTMENT",
      "adjustmentType": "INCREASE",
      "quantity": 10,
      "date": "2024-01-15T09:15:00Z",
      "user": {...},
      "reason": "cycle_count",
      "notes": "Cycle count correction"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 2
  }
}
```

## Frontend Components

### StockManagement Component
The main component for viewing and managing stock quantities with:

- **Statistics Dashboard**: Overview of inventory metrics
- **Search & Filtering**: Find specific products/locations
- **Stock Adjustment**: Manual quantity adjustments
- **History Viewing**: Track all stock movements

### StockAdjustmentDialog Component
Modal dialog for making stock adjustments with:

- **Current Stock Display**: Shows current quantities
- **Adjustment Preview**: Shows what the new quantity will be
- **Reason Selection**: Predefined reasons for adjustments
- **Notes Field**: Additional context for adjustments

## Integration with Stock Moves

The stock quantities system automatically updates when stock moves are confirmed:

### INCOMING Moves
```
✅ Destination Location: +quantity
📊 Available Quantity: +quantity
```

### OUTGOING Moves
```
1️⃣ Reservation: Reserved +quantity, Available -quantity
2️⃣ Confirmation: Total -quantity, Reserved -quantity
```

### INTERNAL Moves
```
1️⃣ Source Reservation: Reserved +quantity, Available -quantity
2️⃣ Source Confirmation: Total -quantity, Reserved -quantity
3️⃣ Destination: Total +quantity, Available +quantity
```

## Database Schema

### StockQuantity Table
```sql
CREATE TABLE stock_quantities (
  id VARCHAR PRIMARY KEY,
  product_id VARCHAR NOT NULL,
  warehouse_id VARCHAR,
  location_id VARCHAR,
  quantity DECIMAL(10,2) DEFAULT 0,
  reserved_quantity DECIMAL(10,2) DEFAULT 0,
  available_quantity DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_id, warehouse_id, location_id),
  INDEX(product_id),
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(warehouse_id) REFERENCES warehouses(id),
  FOREIGN KEY(location_id) REFERENCES locations(id)
);
```

## Best Practices

### 1. Stock Accuracy
- Perform regular cycle counts
- Use adjustment reasons consistently
- Document all manual adjustments
- Monitor stock discrepancies

### 2. Reservation Management
- Reserve stock immediately when orders are confirmed
- Release reservations when orders are cancelled
- Monitor reserved vs available ratios

### 3. Location Management
- Use specific locations for better tracking
- Implement picking strategies (FIFO, LIFO)
- Balance stock across locations

### 4. Reporting & Analytics
- Monitor low stock items daily
- Track stock movement patterns
- Analyze adjustment frequencies
- Review stock accuracy metrics

## Stock Status Indicators

### Visual Indicators
- 🟢 **In Stock**: Available quantity > 10
- 🟡 **Low Stock**: Available quantity 1-10
- 🔴 **Out of Stock**: Available quantity = 0
- 🟠 **Reserved**: Shows reserved quantity

### Alerts & Notifications
- Low stock alerts when available quantity ≤ reorder point
- Out of stock notifications for zero available quantities
- Stock adjustment confirmations
- Reservation status updates

## Performance Considerations

### Database Optimization
- Indexed on productId for fast lookups
- Unique constraint prevents duplicate records
- Efficient querying with proper joins

### Real-time Updates
- Immediate updates when stock moves are confirmed
- Transaction-based updates for consistency
- Optimistic locking for concurrent updates

### Caching Strategy
- Cache frequently accessed stock quantities
- Invalidate cache on stock updates
- Use Redis for high-traffic scenarios

## Troubleshooting

### Common Issues

1. **Negative Available Quantities**
   - Check for unreleased reservations
   - Verify stock move confirmations
   - Run stock reconciliation

2. **Math Inconsistencies**
   - Verify: Total = Available + Reserved
   - Check for concurrent updates
   - Review transaction logs

3. **Missing Stock Records**
   - Stock records are created on first movement
   - Check product and location IDs
   - Verify foreign key constraints

### Debugging Tools
- Stock movement history API
- Database query logs
- Adjustment audit trails
- System error logs

This comprehensive stock quantities system ensures accurate inventory tracking and provides the foundation for reliable e-commerce and warehouse operations. 