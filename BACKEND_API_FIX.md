# Backend API Fix Required

## Issue

The `/api/create-manual-user` endpoint is not returning the user `id` in the response, which is required for the payment flow.

## Current Response (Missing `id`)

```json
{
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "501234567",
    "wait_list_count": 2301,
    "status": "pending"
  },
  "message": "Your account is pending approval. We will get back to you soon."
}
```

## Required Response (With `id`)

```json
{
  "success": true,
  "data": {
    "id": 12345,  // ← THIS IS REQUIRED!
    "first_name": "John",
    "last_name": "Doe",
    "phone": "501234567",
    "wait_list_count": 2301,
    "status": "pending"
  },
  "message": "Your account is pending approval. We will get back to you soon."
}
```

## Why This Is Needed

The web app (and mobile app) need the `user_id` to:
1. Call `/api/create-subscription` endpoint
2. Link the subscription to the correct user
3. Process payments correctly

## Backend Fix

Update the `/api/create-manual-user` endpoint to include the user `id` in the response:

### Example (PHP/Laravel)

```php
return response()->json([
    'success' => true,
    'data' => [
        'id' => $user->id,  // ← Add this
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'phone' => $user->phone,
        'wait_list_count' => $waitListCount,
        'status' => $user->status,
    ],
    'message' => 'Your account is pending approval. We will get back to you soon.'
]);
```

### Example (Node.js/Express)

```javascript
res.json({
  success: true,
  data: {
    id: user.id,  // ← Add this
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    wait_list_count: waitListCount,
    status: user.status,
  },
  message: "Your account is pending approval. We will get back to you soon."
});
```

## Testing

After the fix:
1. Complete step 1 in the onboarding flow
2. Check the API response - it should include `id`
3. Try selecting a payment plan - it should work now

## Alternative (If You Can't Change Backend)

If you cannot modify the backend immediately, you could:
1. Use phone number to look up user (requires additional API call)
2. Store user_id in a separate endpoint after creation
3. Use a different identifier

But the **recommended solution** is to add `id` to the response.

