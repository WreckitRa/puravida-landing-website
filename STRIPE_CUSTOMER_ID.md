# Stripe Customer ID Explanation

## What is `stripe_customer_id`?

`stripe_customer_id` (or `customer_id` in your API) is the **Stripe Customer ID** that identifies a user in Stripe's system. It's created automatically when a user first interacts with Stripe payments.

## How It Works

### Initial State (New User)
```json
{
  "data": {
    "id": "uuid-here",
    "customer_id": null,  // ← Not created yet
    "first_name": "John",
    "status": "pending"
  }
}
```

### After First Stripe Interaction
When the user creates a subscription, Stripe automatically creates a Customer record:
```json
{
  "data": {
    "id": "uuid-here",
    "customer_id": "cus_xxxxxxxxxxxxx",  // ← Created by Stripe
    "first_name": "John",
    "status": "pending"
  }
}
```

## When It Gets Created

According to your backend:

1. **When user calls `GET /api/get-profile`** (if missing)
   - Backend checks if `stripe_customer_id` exists
   - If not, creates a Stripe Customer
   - Returns/updates the customer_id

2. **When user creates subscription via `POST /api/create-subscription`** (if missing)
   - Backend checks if `stripe_customer_id` exists
   - If not, creates a Stripe Customer
   - Links the subscription to the customer
   - Returns customer_id in response

## Why It's Null Initially

- **Performance**: Don't create Stripe customers for users who never pay
- **Cost**: Stripe doesn't charge for customers, but it's cleaner to create on-demand
- **Lazy Creation**: Only create when needed (first payment attempt)

## In Your Payment Flow

### Current Flow (Web App)

1. User completes step 1 → `POST /api/create-manual-user`
   - Returns: `{ id: "uuid", customer_id: null }` ✅

2. User selects payment plan → `POST /api/create-subscription`
   - Backend checks: Does user have `stripe_customer_id`?
   - If `null`: Creates Stripe Customer automatically
   - Creates subscription linked to customer
   - Returns: `{ customer_id: "cus_xxx", payment_intent: {...}, ... }` ✅

3. Payment processed → Stripe webhook confirms
   - Subscription is active
   - User can now make payments

## Frontend Code

The frontend doesn't need to worry about `customer_id` being null:

```typescript
// Step 1: Create user (customer_id is null - that's fine!)
const userResponse = await createManualUser({...});
// Response: { id: "uuid", customer_id: null }

// Step 2: Create subscription (backend handles customer_id creation)
const subscriptionResponse = await createSubscription({
  user_id: userResponse.data.id,  // Just need the user ID
  price_id: priceId
});
// Backend automatically:
// 1. Checks if customer_id is null
// 2. Creates Stripe Customer if needed
// 3. Creates subscription
// 4. Returns customer_id in response
```

## Summary

- ✅ `customer_id: null` initially is **correct and expected**
- ✅ Backend handles creation automatically
- ✅ Frontend just needs `user_id` to create subscription
- ✅ No frontend changes needed - it's all handled by backend

The payment flow will work perfectly with `customer_id: null` initially!

