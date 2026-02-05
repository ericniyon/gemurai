# MCC Warehouses vs Inventory & Rentals – Content Check

## Inventory & Rentals (`/dashboard/mcc/inventory-rentals`)

| Tab | Content |
|-----|--------|
| **Warehouse Hub** | • Summary: Total Products, Warehouses (global), Locations, Stock Entries<br>• Filters: Search products, Filter by Warehouse, Filter by Location<br>• **Products Inventory** table (product, SKU, category, price, warehouse, location, stock qty, available)<br>• **Stock Quantities by Warehouse & Location** table (product, warehouse, location, total/reserved/available, last updated)<br>• **Add Product** dialog (create product, assign to warehouse/location)<br>• Data: `/api/v1/inventory/products`, `/api/v1/inventory/warehouses`, `/api/v1/inventory/locations`, `/api/v1/inventory/stock` |
| **Assets** | • MCC assets (GPS tracker, milk meter, chiller, generator, etc.)<br>• Summary: Total, Available, Rented, Maintenance<br>• Registered assets table, Add asset, filters |
| **Rentals** | • Equipment rentals to farmers<br>• Summary: Total, Active, Returned, Overdue<br>• Active rentals table, Create rental, Return equipment |
| **Requests** | • Pending equipment requests<br>• Low stock alerts, Expiring soon, Quick actions |

**Warehouse Hub** uses **global** `Warehouse` (inventory system), not MCC warehouses.

---

## MCC Warehouses (`/dashboard/mcc/warehouses`)

| Tab | Content |
|-----|--------|
| **All warehouses** | • MCC warehouses (`mcc_warehouses`): name, type, location, capacity, link to global warehouse, status (active/inactive)<br>• Add / Edit / Link to global / Delete<br>• Search and filters (type, link status) |
| **Stock at linked warehouses** | • For each **linked** MCC warehouse: expand to see **locations** and **stock** of the linked global warehouse<br>• Data: `/api/v1/inventory/locations?warehouseId=`, `/api/v1/inventory/stock?warehouseId=` |

**Warehouses** page is about **MCC warehouse definitions** and **linking** them to global inventory warehouses; stock tab shows stock only for those linked global warehouses.

---

## What to include on the Warehouses page (from Inventory-Rentals)

1. **Link to Inventory & Rentals**  
   Add a clear primary/secondary action: **“Manage inventory & products”** or **“Open Inventory & Rentals”** that goes to `/dashboard/mcc/inventory-rentals`.  
   Rationale: Full product list, add product, and stock-by-warehouse/location live in Warehouse Hub; warehouses page should not duplicate that, but should link to it.

2. **Optional: Summary for “linked” context**  
   On the Warehouses page we could show, for linked warehouses only:
   - **Total locations** (sum of locations across linked global warehouses)
   - **Stock entries** (count of stock lines across linked warehouses)  
   These can be derived from the same data already loaded in the “Stock at linked warehouses” tab (or a small summary API).  
   Rationale: Mirrors the Warehouse Hub summary (Warehouses, Locations, Stock Entries) but scoped to “your linked warehouses”.

3. **Do not move to Warehouses**  
   - Products inventory table and Add Product (stay in Warehouse Hub).
   - Assets, Rentals, Requests (stay in Inventory & Rentals).

---

## Summary

- **Warehouses page**: Define MCC warehouses, link them to global warehouses, view locations and stock at those linked warehouses.
- **Inventory & Rentals (Warehouse Hub)**: Manage global warehouses, products, locations, and stock (full inventory).
- **Inclusion**: Add a link/button on the Warehouses page to **Inventory & Rentals**; optionally add “Total locations” and “Stock entries” for linked warehouses only.
