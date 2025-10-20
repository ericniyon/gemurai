# Inventory Management System - Odoo Style

## Overview

This application implements an Odoo-style inventory management system with proper stock move workflows, state transitions, and stock quantity tracking. The system ensures data consistency and provides real-time inventory visibility.

## Stock Move States

The system follows Odoo's stock move state machine:

1. **DRAFT** - Initial state when stock move is created
2. **CONFIRMED** - Stock move is confirmed and ready for processing
3. **ASSIGNED** - Stock is reserved and move is ready for execution
4. **DONE** - Stock move is completed and quantities are updated
5. **CANCELLED** - Stock move is cancelled

## Stock Move Types

### INCOMING
- **Purpose**: Receive products into inventory
- **Process**: Add stock to destination location
- **Validation**: No stock availability check needed
- **Example**: Purchase order receipt, production output

### OUTGOING
- **Purpose**: Remove products from inventory
- **Process**: Remove stock from source location
- **Validation**: Check stock availability before confirmation
- **Example**: Sales order delivery, consumption

### INTERNAL
- **Purpose**: Move products between locations
- **Process**: Remove from source, add to destination
- **Validation**: Check stock availability at source location
- **Example**: Warehouse transfers, picking operations

### ADJUSTMENT
- **Purpose**: Correct inventory discrepancies
- **Process**: Increase or decrease stock quantities
- **Validation**: Based on adjustment type
- **Example**: Cycle count corrections, damage write-offs

## Stock Move Confirmation Process

When a stock move is confirmed, the system goes through these steps:

### Step 1: Confirmation (DRAFT → CONFIRMED)
- Validates the stock move exists and is in DRAFT state
- Updates state to CONFIRMED
- Records who processed the move and when

### Step 2: Availability Check & Assignment (CONFIRMED → ASSIGNED)
- **For INCOMING moves**: No availability check needed
- **For OUTGOING/INTERNAL moves**: 
  - Checks if sufficient stock is available at source location
  - Validates required locations are specified
  - Reserves the required quantity
  - Updates `reservedQuantity` and `availableQuantity`
- Updates state to ASSIGNED

### Step 3: Physical Execution (ASSIGNED → DONE)
- Executes the actual stock movement based on move type:
  - **INCOMING**: Adds stock to destination location
  - **OUTGOING**: Removes stock from source location and unreserves
  - **INTERNAL**: Moves stock from source to destination
  - **ADJUSTMENT**: Adjusts stock quantities as specified
- Updates state to DONE
- Updates final stock quantities in the database

## Stock Quantity Tracking

The system maintains three key quantity fields:

- **`quantity`**: Total physical stock quantity
- **`reservedQuantity`**: Stock reserved for confirmed moves
- **`availableQuantity`**: Stock available for new reservations
  - Formula: `availableQuantity = quantity - reservedQuantity`

## Database Schema

### StockMove Table
```sql
- id: Unique identifier
- productId: Reference to product
- warehouseId: Source/destination warehouse
- locationId: Source location
- destinationLocationId: Destination location
- quantity: Quantity to move
- moveType: Type of move (INCOMING, OUTGOING, etc.)
- state: Current state (DRAFT, CONFIRMED, etc.)
- processedBy: User who processed the move
- processedAt: When the move was processed
```

### StockQuantity Table
```sql
- id: Unique identifier
- productId: Reference to product
- warehouseId: Warehouse location
- locationId: Specific location
- quantity: Total physical quantity
- reservedQuantity: Reserved quantity
- availableQuantity: Available quantity
- lastUpdated: Last update timestamp
```

## API Endpoints

### Confirm Stock Move
```http
POST /api/v1/superadmin/stock-moves/confirm
Content-Type: application/json

{
  "id": "stock-move-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock move confirmed successfully",
  "stockMove": {
    "id": "...",
    "state": "DONE",
    "product": {...},
    "warehouse": {...},
    "location": {...},
    "destinationLocation": {...}
  }
}
```

### Cancel Stock Move
```http
POST /api/v1/superadmin/stock-moves/cancel
Content-Type: application/json

{
  "id": "stock-move-id"
}
```

## Error Handling

The system provides comprehensive error handling:

- **Insufficient Stock**: When trying to move more stock than available
- **Invalid State**: When trying to confirm a move not in DRAFT state
- **Missing Locations**: When required source/destination locations are not specified
- **Concurrent Modifications**: Database transaction conflicts
- **Permission Errors**: Unauthorized access attempts

## Best Practices

1. **Always check stock availability** before confirming outgoing moves
2. **Use transactions** for all stock operations to ensure data consistency
3. **Implement proper error handling** for all edge cases
4. **Log all stock movements** for audit trails
5. **Validate user permissions** before allowing stock operations

## Integration with Frontend

The frontend components automatically refresh after stock moves are confirmed to show updated quantities and move states. The system provides real-time feedback on stock availability and move progress.

## Monitoring and Reporting

The system tracks:
- Stock movement history
- Current stock levels by location
- Reserved quantities
- Move processing times
- Error rates and types

This enables comprehensive inventory reporting and analysis similar to Odoo's inventory management capabilities. 