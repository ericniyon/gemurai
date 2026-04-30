# How Warehouse Can Work With the Current HarvestPlus Implementation

**Context:** HarvestPlus is a multi-commodity aggregation platform (Commodity Studio, commodity/crop collections, quality, payments). This doc explains the **current** warehouse/inventory setup and how warehouse functionality can work with it.

---

## 1. Current State: Two Warehouse Concepts

### A. Global inventory (`Warehouse` + `Location` + `StockMove`)

- **Tables:** `warehouses`, `locations`, `stock_moves`, `stock_quantities`, `products`.
- **Used by:** Inventory module (locations, stock moves, adjustments, cycle counts). Collections can optionally link here.
- **Flow:** When a **commodity collection** or **crop collection** is recorded with `warehouseId` + `productId` (and for crop also `createdByUserId`), the service creates an **incoming StockMove** and links it to the collection (`stockMoveId`). So “receive into warehouse” is already implemented in the backend; the **UI does not expose** warehouse/location/product on the collection forms yet.

### B. MCC-level warehouses (`mcc_warehouses` + `products`)

- **Tables:** `mcc_warehouses` (per MCC, type: COLLECTION_CENTER | PROCESSING_PLANT | COLD_STORAGE | DISTRIBUTION_CENTER), `products` (with `mccWarehouseId`, `stock`, `unitOfMeasure`, etc.).
- **Used by:** `/api/v1/mcc/stock` and legacy Digital “MCC stock” view. Products belong to an MCC warehouse; stock is a simple numeric field on `products`, not driven by StockMove.
- **No direct link** to global `Warehouse`: they are separate. So “MCC warehouse” today is “MCC + list of products with stock,” not the same as “Warehouse + Location + StockMove.”

---

## 2. How Collections Already Use Warehouse (Backend)

| Collection type           | warehouseId | locationId | productId | Stock move created? |
|---------------------------|------------|------------|-----------|----------------------|
| Commodity (`commodity_collections`) | Optional   | Optional   | Optional  | Yes, if warehouseId + productId are set |
| Crop (`crop_collections`)  | Optional   | Optional   | Optional  | Yes, if warehouseId + productId + createdByUserId |

- **CommodityCollectionService:** creates `StockMove` (INCOMING, CONFIRMED) and could link to collection (today it does not set `commodity_collections.stockMoveId` in the snippet you have; only creates the move).
- **CropCollectionService:** creates `StockMove` and updates `crop_collections.stockMoveId` when warehouse + product + createdByUserId are provided.

So “warehouse” in the sense of “receive this collection into a warehouse and create a stock move” is already supported in the **API and services**; what’s missing is **UI and data setup** (see below).

---

## 3. Gaps for a Full Warehouse Story

1. **Commodity/Crop vs Product**  
   Stock moves use `products`. Commodities (Commodity Studio) and crop types are **not** products. So either:
   - **Map to product:** For each commodity (or MCC+commodity) or crop type, maintain a corresponding `products` record used only for inventory, and pass that `productId` when recording a collection into a warehouse, or
   - **Use inventory_batches only** for “commodity at MCC” (no StockMove) and keep StockMove for product-based inventory only.

2. **MCC ↔ Warehouse link**  
   There is no schema relation “this MCC uses this global Warehouse.” So either:
   - Add something like `mccs.defaultWarehouseId` or a join table `mcc_warehouses.warehouseId` → `Warehouse.id`, and in the UI only show warehouses the MCC is allowed to use, or
   - Keep using only `mcc_warehouses` for “MCC stock” and, for formal inventory, create/link one global `Warehouse` per MCC (or per mcc_warehouse) and use that in collection flows.

3. **Collection forms**  
   Record Commodity Collection and Record Crop Collection do **not** show warehouse/location/product. So users cannot currently choose “receive into warehouse” even though the API supports it. Adding optional fields (warehouse, location, product) to these forms would complete the flow.

4. **Stock API and reporting**  
   `/api/v1/mcc/stock` is built on `mcc_warehouses` + `products.stock`. For multi-commodity, you could:
   - Extend it to include commodity/crop “stock” derived from collections that have a `stockMoveId` (and thus a StockMove into a warehouse), or
   - Introduce a separate “warehouse stock” view based on `Warehouse` + `StockQuantity` / `StockMove` and optionally `inventory_batches`.

---

## 4. Recommended Direction (Fits Current Implementation)

### Option A: “Receive into warehouse” on existing collection flows (minimal change)

- **Commodity Studio / Admin:** For each commodity (or per-MCC), optionally configure a “default inventory product” (a `products.id`) used when receiving that commodity into a warehouse.
- **MCC setup:** Allow linking an MCC to one or more global `Warehouse`s (e.g. `mcc_warehouses.warehouseId` → `Warehouse.id`, or `mccs.defaultWarehouseId`). List locations under that warehouse.
- **Record Commodity Collection / Record Crop Collection (UI):**
  - Add optional section “Receive into warehouse” with:
    - Warehouse (dropdown: warehouses linked to the MCC),
    - Location (dropdown: locations of selected warehouse),
    - Product (dropdown: product that represents this commodity/crop for inventory; or pre-filled from commodity/crop config).
  - On submit, send `warehouseId`, `locationId`, `productId` (and for crop, the current user id as creator). Existing service logic will create the StockMove and link it to the collection where already implemented.
- **Stock view:** Keep current MCC stock API for legacy; add a “Warehouse stock” or “Inventory by warehouse” view that reads from `StockQuantity` / `StockMove` (and optionally shows which collections contributed).

This reuses the current HarvestPlus implementation (one platform, configurable commodities) and only adds configuration (commodity→product, MCC→warehouse) and UI (optional warehouse/location/product on collection forms).

### Option B: Use `inventory_batches` as the main “commodity warehouse” and keep StockMove for products

- **Collections:** On approve, create or update an `inventory_batches` row (commodityId, mccId, quantity, grade, storageLocation, ownerType = 'mcc'). No need for a `products` record per commodity.
- **Warehouse/Location:** Store as text in `storageLocation` or add optional `warehouseId`/`locationId` to `inventory_batches` if you want to join to `Warehouse`/`Location`.
- **Stock view:** “MCC commodity stock” = aggregate of `inventory_batches` by mccId (and commodity, grade). No change to StockMove/product-based inventory.

This fits the spec’s “storage types: tanks, bags, silos, warehouses” and “storageLocation” in batches, and avoids creating a product per commodity. Formal product-based inventory (StockMove, StockQuantity) remains for things that are actually products (e.g. processed milk, packed goods).

---

## 5. Summary

- **Warehouse already works** at the **backend** for collections: if you send `warehouseId` (+ `locationId`, `productId`, and for crop `createdByUserId`), the current HarvestPlus implementation creates a StockMove and can link it to the collection.
- To make warehouse **visible and usable** in the current implementation you need:
  1. **Data/model:** Link MCC (or mcc_warehouses) to global `Warehouse`; optionally map commodity/crop to a `product` for inventory.
  2. **UI:** Optional “Receive into warehouse” (warehouse, location, product) on Record Commodity Collection and Record Crop Collection.
  3. **Stock/reporting:** Either extend MCC stock to include movement-based stock from collections, or add a warehouse/inventory view based on `Warehouse` + StockMove/StockQuantity (and optionally inventory_batches).

Choosing Option A aligns with the existing StockMove path; choosing Option B leans on `inventory_batches` for commodity-level “warehouse” stock and keeps StockMove for product-level inventory. Both fit the current HarvestPlus design (one platform, configurable commodity logic).
