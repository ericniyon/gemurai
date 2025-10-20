# Manual Test Guide: Submit Exchange Request

## Prerequisites
1. Make sure the development server is running: `npm run dev`
2. Navigate to: `http://localhost:3000/en/dashboard/products`
3. Login as a DCC user (required for exchange functionality)

## Test Steps

### Step 1: Open Exchange Modal
1. **Find a product card** on the products page
2. **Hover over the product image** to reveal action buttons
3. **Click the exchange button** (↔️ icon) - this should open the exchange modal

### Step 2: Verify Modal Elements
Check that the following elements are present in the modal:
- ✅ **Modal Title**: "Request Product Exchange"
- ✅ **Current Product Information**: Shows selected product details
- ✅ **Current Quantity Input**: Number input for current product quantity
- ✅ **Requested Product Dropdown**: Select dropdown for products from my stock
- ✅ **Requested Quantity Input**: Number input for requested product quantity
- ✅ **Reason Textarea**: Text area for exchange reason
- ✅ **Product Comparison Section**: Side-by-side comparison (appears after selecting requested product)
- ✅ **Submit Button**: "Submit Exchange Request" button (orange color)

### Step 3: Fill Out the Form
1. **Set Current Quantity**: Enter a number (e.g., "2")
2. **Select Requested Product from My Stock**: 
   - Click the dropdown
   - Select any available product from my stock
   - Verify quantity auto-calculates
3. **Adjust Requested Quantity**: Modify if needed (e.g., "1")
4. **Enter Reason**: Type a reason (e.g., "Testing exchange functionality")

### Step 4: Verify Product Comparison
After selecting a requested product, verify:
- ✅ **Current Product Card**: Shows selected product with image, pricing, etc.
- ✅ **Requested Product Card**: Shows selected product from my stock
- ✅ **Value Comparison**: Shows current value, requested value, and difference
- ✅ **Color Coding**: Green for gains, red for losses, gray for equal values

### Step 5: Test Form Validation
1. **Test Missing Fields**:
   - Clear the reason field and try to submit
   - Should show validation error
2. **Test Valid Form**:
   - Fill all required fields
   - Submit button should be enabled

### Step 6: Submit Exchange Request
1. **Click "Submit Exchange Request"** button
2. **Check Console Logs** for:
   ```
   Submit Exchange Request - Starting...
   Exchange Form Data: {...}
   Validation passed - proceeding with submission
   Making API call to /api/v1/product-exchange
   Request body: {...}
   API Response status: 200
   API Success response: {...}
   Exchange request submitted successfully
   ```

### Step 7: Verify Success
1. **Check Toast Notification**: Should show "Exchange Request Submitted!"
2. **Modal Should Close**: Exchange modal should close automatically
3. **Form Should Reset**: All fields should be cleared
4. **Check API Response**: Verify the response contains exchange request details

## Expected Console Output

### When Opening Modal:
```
Fetching products from current DCC's stock orders...
Current DCC user: {id, name, email}
Making API call to fetch current DCC's stock orders...
Stock Orders API Response: {success: true, data: Array(4)}
Found 4 stock orders for current DCC
Processing order 0 for DCC {dccId}: {...}
Available Products from My Stock: [{id, name, price, commission, ...}]
Extracted 3 unique products from 4 stock orders
Sample Available Product: {id, name, price, commission, ...}
```

### When Selecting Product:
```
Selected Product: {id, name, price, commission, ...}
Requested Product: {id, name, price, commission, ...}
Current Value: 50000
Requested Value: 48000
Value Difference: -2000
```

### When Submitting:
```
Submit Exchange Request - Starting...
Exchange Form Data: {
  currentProductId: "...",
  requestedProductId: "...",
  currentQuantity: 2,
  requestedQuantity: 1,
  reason: "Testing exchange functionality"
}
Validation passed - proceeding with submission
Making API call to /api/v1/product-exchange
Request body: {...}
API Response status: 200
API Success response: {
  success: true,
  message: "Exchange request submitted successfully",
  data: {...}
}
Exchange request submitted successfully
Submit Exchange Request - Completed
```

## Troubleshooting

### If Modal Doesn't Open:
- Check if user is logged in as DCC
- Check browser console for errors
- Verify exchange button is visible on hover

### If My Stock is Empty:
- Check if current DCC user has any stock orders
- Verify stock orders API is working
- Check console for API errors
- Ensure you're logged in as the correct DCC user

### If Submit Fails:
- Check authentication token
- Verify all required fields are filled
- Check API response for specific error messages
- Verify product exchange API endpoint is working

### If Comparison Doesn't Show:
- Ensure a requested product is selected
- Check if DCC stock data is properly transformed
- Verify commission calculations are correct

## Success Criteria
- ✅ Exchange modal opens correctly
- ✅ My stock loads in dropdown
- ✅ Product comparison displays correctly
- ✅ Form validation works
- ✅ Submit button is enabled when form is valid
- ✅ API call is made successfully
- ✅ Success toast notification appears
- ✅ Modal closes after successful submission
- ✅ Form resets after submission

## Notes
- The exchange functionality is only available for DCC users
- My stock must be available for the dropdown to populate
- The API endpoint `/api/v1/product-exchange` must be working
- All console logs should be visible in browser developer tools
- Products are fetched from the current DCC's own stock orders only
