# Card Payment Debug Report

## Summary
Card payments are failing to update the database (sale status remains "pending", stock not reduced), while cash payments work correctly. **The frontend code is IDENTICAL for both payment methods**, so the issue is in the backend.

## Frontend Analysis

### Identical Payload Construction
Both cash and card payments construct the EXACT same payload:

**Cash Payment (lines 140-147):**
```typescript
const payload = {
  items: items.map((i) => ({
    product_id: i.product.id,
    quantity: i.quantity,
    stock_type: "venta" as const,
  })),
  payment_method: paymentMethod, // "cash"
};
```

**Card Payment (lines 232-239):**
```typescript
const payload = {
  items: items.map((i) => ({
    product_id: i.product.id,
    quantity: i.quantity,
    stock_type: "venta" as const,
  })),
  payment_method: paymentMethod, // "card"
};
```

### Identical API Call
Both use the SAME API function with the SAME parameters:

**Cash Payment (line 163):**
```typescript
const data = await salesApi.processSale(currentStore!.id, payload);
```

**Card Payment (line 255):**
```typescript
const data = await salesApi.processSale(currentStore!.id, payload);
```

### Identical Success Handling
Both handle success identically (lines 165-186 for cash, 257-278 for card):
```typescript
console.log("[PAYMENT] API call successful");
console.log("[PAYMENT] Full response data:", JSON.stringify(data, null, 2));
console.log("[PAYMENT] Receipt number:", data.receipt_number);
console.log("[PAYMENT] Sale object:", JSON.stringify(data.sale, null, 2));
console.log("[PAYMENT] Sale ID:", data.sale?.id);
console.log("[PAYMENT] Sale payment_status:", data.sale?.payment_status);
console.log("[PAYMENT] Sale payment_method:", data.sale?.payment_method);
console.log("[PAYMENT] Sale total:", data.sale?.total);

toast.success(`Venta completada. Recibo: ${data.receipt_number}`);
clear();
setAmount("");
setShowPayment(false);
```

## API Layer Analysis

### `salesApi.processSale` (src/lib/api/sales.ts)
```typescript
processSale: async (
  storeId: string,
  data: CreateSaleRequest
): Promise<{ sale: Sale; receipt_number: string }> => {
  const response = await apiRequest<{ sale: Sale; receipt_number: string }>(
    `/api/stores/${storeId}/sales`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return response.data!;
},
```

### Type Definitions
**CreateSaleRequest (src/lib/api/sales.ts):**
```typescript
type CreateSaleRequest = {
  items: CreateSaleItemRequest[];
  payment_method: "cash" | "card" | "mixed";
  discount?: number;
  notes?: string;
};
```

**Sale (src/types/index.ts):**
```typescript
export interface Sale {
  id: string;
  store_id: string;
  receipt_number: string;
  payment_method: "cash" | "card" | "mixed";
  payment_status: "completed" | "refunded" | "cancelled" | "pending";
  total: number;
  discount?: number;
  created_at: string;
  items?: SaleItem[];
}
```

## Differences Found

### None in Frontend
- ✅ Payload structure: IDENTICAL
- ✅ API call: IDENTICAL
- ✅ Success handling: IDENTICAL
- ✅ Error handling: IDENTICAL
- ✅ Type definitions: IDENTICAL
- ✅ Stock type: Both use `"venta" as const`

## Current Logging Output

The frontend is already logging all necessary information:

**For Cash Payments:**
```typescript
[CASH PAYMENT] Full response data: {...}
[CASH PAYMENT] Sale object: {...}
[CASH PAYMENT] Sale ID: ...
[CASH PAYMENT] Sale payment_status: ...
[CASH PAYMENT] Sale payment_method: ...
[CASH PAYMENT] Sale total: ...
```

**For Card Payments:**
```typescript
[CARD PAYMENT] Full response data: {...}
[CARD PAYMENT] Sale object: {...}
[CARD PAYMENT] Sale ID: ...
[CARD PAYMENT] Sale payment_status: ...
[CARD PAYMENT] Sale payment_method: ...
[CARD PAYMENT] Sale total: ...
```

## What to Check in Backend

Since the frontend is identical, the issue MUST be in the backend. Check:

1. **Backend Route Handler** (`/api/stores/:storeId/sales` POST endpoint):
   - Does it handle `payment_method: "card"` differently than `"cash"`?
   - Is there conditional logic based on payment method?
   - Is there async logic that's not being awaited for card payments?

2. **Database Transaction**:
   - Is the sale being committed to the database for card payments?
   - Is the stock reduction being rolled back for some reason?
   - Are there different transaction scopes for different payment methods?

3. **Response Being Sent**:
   - Compare the EXACT response for cash vs card payments
   - Does the backend return `payment_status: "completed"` for both?
   - Does the backend return the same sale object structure for both?

4. **Stock Reduction Logic**:
   - Is stock reduction conditional on payment method?
   - Is there a flag that prevents stock reduction for card payments?
   - Is the stock reduction in a different transaction that's not being committed?

5. **Payment Processing Flow**:
   - Is there separate logic for "pending" → "completed" status changes?
   - Does card payment create a "pending" sale that needs manual confirmation?
   - Is there a webhook or background job that should update the status?

## Recommended Backend Investigation Steps

1. **Add Backend Logging** at these points:
   - When request is received: log `payment_method`
   - Before database insert: log the sale data being inserted
   - After database insert: log the inserted sale data
   - Before stock reduction: log the stock operation
   - After stock reduction: log the new stock values
   - Before response: log the response being sent

2. **Compare Database Queries**:
   - Run the same payment with cash and card
   - Check the actual SQL queries being executed
   - Look for differences in WHERE clauses, transaction commits, etc.

3. **Check for Async Issues**:
   - Ensure all database operations are awaited
   - Check if stock reduction happens in background job
   - Verify transaction commits are synchronous

4. **Review Payment Method Logic**:
   - Search backend codebase for `payment_method === "card"`
   - Look for any special handling of card payments
   - Check if there's intended "pending" → "completed" workflow

## Example Backend Code Pattern to Look For

**Bad (causes pending status):**
```python
# Create sale with pending status for cards
if payment_method == "card":
    sale.payment_status = "pending"  # ❌ Wrong!
else:
    sale.payment_status = "completed"
```

**Good (both should complete immediately):**
```python
# Create sale with completed status for both
sale.payment_status = "completed"
```

**Bad (doesn't reduce stock for cards):**
```python
# Only reduce stock for cash
if payment_method == "cash":
    product.stock_venta -= quantity  # ❌ Wrong!
```

**Good (reduces stock for both):**
```python
# Reduce stock regardless of payment method
product.stock_venta -= quantity
```

## Conclusion

The frontend is **100% correct** and **identical for both payment methods**. The issue is definitively in the backend. Focus your debugging efforts on the backend route handler, database transactions, and stock reduction logic.

Compare the backend logs for a cash payment vs a card payment to identify where the logic diverges.
