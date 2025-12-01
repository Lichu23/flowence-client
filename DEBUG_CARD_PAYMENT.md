# Card Payment Debug Guide

## Problem Statement

Card payments are showing success in the frontend but failing in the database:
- Frontend logs show successful API response with receipt number
- Database shows sale status remains "pending" (should be "completed")
- Database shows stock is NOT reduced
- Cash payments work perfectly with the same code structure

## Changes Made

Added comprehensive logging to trace the entire payment flow from frontend to API client.

### 1. Frontend Logging (src/app/pos/page.tsx)

**Cash Payment Flow (lines 121-210)**:
- Logs cart state before processing
- Logs payload construction (with JSON stringification)
- Logs complete API response including:
  - Full response data (JSON)
  - Receipt number
  - Complete sale object (JSON)
  - Sale ID
  - Sale payment_status
  - Sale payment_method
  - Sale total
- Logs success/error states

**Card Payment Flow (lines 212-298)**:
- Identical logging structure as cash payments
- Same detailed response logging for comparison

### 2. API Client Logging (src/lib/api/client.ts)

Added detailed logging for all requests to `/sales` endpoints (lines 118-147):

**Request Logging**:
- Endpoint path
- Full URL
- HTTP method
- Headers (including Authorization)
- Request body
- Retry flag

**Response Logging**:
- HTTP status code
- Status text
- Response headers
- Parsed JSON response data

## How to Debug

### Step 1: Test Cash Payment

1. Start the dev server: `npm run dev`
2. Navigate to POS page
3. Add a product to cart
4. Click "Cobrar" (Checkout)
5. Select "Efectivo" (Cash)
6. Enter amount and click "Confirmar"
7. **Check browser console** for logs starting with `[CASH PAYMENT]`

### Step 2: Test Card Payment

1. Add the same product to cart again
2. Click "Cobrar" (Checkout)
3. Select "Tarjeta" (Card)
4. Click "Confirmar"
5. **Check browser console** for logs starting with `[CARD PAYMENT]`

### Step 3: Compare the Logs

Open the browser console and compare the following between cash and card payments:

#### A. Payload Comparison

Look for these logs:
```
[CASH PAYMENT] Full payload (JSON): {...}
[CARD PAYMENT] Full payload (JSON): {...}
```

**Check**:
- Are the `items` arrays identical?
- Is `payment_method` correctly set ("cash" vs "card")?
- Are there any extra/missing fields?

#### B. API Request Comparison

Look for these logs:
```
[API CLIENT] Making request to sales endpoint
[API CLIENT] Body: {...}
```

**Check**:
- Is the request body identical (except for payment_method)?
- Are the headers identical?
- Is the URL identical?

#### C. API Response Comparison

Look for these logs:
```
[API CLIENT] Status: 200/201
[API CLIENT] Parsed response data: {...}
```

**Check**:
- Is the HTTP status code the same (should be 200 or 201)?
- Compare the `data.sale` object structure
- **Critical fields to compare**:
  - `sale.payment_status` - Should be "completed" for both
  - `sale.payment_method` - Should match what was sent
  - `sale.id` - Both should have valid UUIDs
  - `sale.total` - Should match cart total

#### D. Frontend Response Handling

Look for these logs:
```
[CASH PAYMENT] Sale object: {...}
[CASH PAYMENT] Sale payment_status: "completed"
[CARD PAYMENT] Sale object: {...}
[CARD PAYMENT] Sale payment_status: "pending" or "completed"?
```

**Check**:
- Does the backend return different `payment_status` values?
- Is the `sale` object structure different?
- Are there any missing fields in the card payment response?

## Expected Findings

Based on the symptoms, we expect to find ONE of these issues:

### Possibility 1: Different Backend Response
The backend returns a different `payment_status` for card payments:
- Cash: `payment_status: "completed"`
- Card: `payment_status: "pending"`

**Why**: Backend might have different processing logic for card payments.

### Possibility 2: Missing Field in Payload
The payload might be missing a field that tells the backend to complete the transaction:
- Check if there's a `confirm: true` or similar field needed for card payments

### Possibility 3: Backend Async Processing
The backend might process card payments asynchronously:
- Initial response shows "pending"
- Actual processing happens later
- Stock reduction happens after response is sent

### Possibility 4: Payment Status Mismatch
The backend might expect an additional confirmation step for card payments:
- Sale is created but not marked as completed
- Requires a separate API call to confirm the payment

## What to Look For

1. **Different payment_status in response**:
   - If card payment returns `"pending"` instead of `"completed"`, the issue is in the backend
   - Backend needs to mark card payments as completed immediately

2. **Missing fields in request**:
   - If cash payment sends extra fields that card doesn't, add them to card payload

3. **Different error responses**:
   - Check if card payment returns any warnings/errors in the response

4. **Database transaction timing**:
   - If response shows "completed" but DB shows "pending", there might be a race condition

## Next Steps

After collecting the logs:

1. **Copy the complete console output** for both cash and card payments
2. **Compare the JSON objects** side-by-side
3. **Identify the discrepancy** in the response
4. **Check backend code** for payment processing differences
5. **Fix the root cause** (likely in the backend)

## Files Modified

- `src/app/pos/page.tsx` - Added detailed logging for both payment flows
- `src/lib/api/client.ts` - Added request/response logging for sales endpoints
- `DEBUG_CARD_PAYMENT.md` - This file (documentation)

## Reverting Changes

If you need to remove the debug logging later:

```bash
git diff src/app/pos/page.tsx
git diff src/lib/api/client.ts
# Review the changes, then revert if needed
git checkout src/app/pos/page.tsx
git checkout src/lib/api/client.ts
```

Or keep the logging - it's helpful for debugging future issues!
