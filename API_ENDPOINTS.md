# API Endpoints Reference

## Payment Endpoints

### Create Subscription (Public - For Web Onboarding)

**Endpoint:** `POST /api/create-subscription-for-user`

**Description:** Creates a Stripe subscription for a user. This is a **public endpoint** (no authentication required) designed for the web onboarding flow.

**Request:**
```typescript
{
  user_id: string | number;  // User UUID or ID
  price_id: string;          // Stripe Price ID (e.g., "price_1SScVzKpAtpcKgcVKzA027t8")
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    payment_intent: {
      client_secret: string;
    };
    ephemeral_key: string;
    stripe_subscription_id: string;
    customer_id: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

**Example:**
```javascript
const response = await fetch('https://api.puravida.events/api/create-subscription-for-user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_id: 'a068b4b0-0f32-4a7a-b892-8e0d21308bfc',
    price_id: 'price_1SScVzKpAtpcKgcVKzA027t8'
  })
});

const result = await response.json();
```

**Notes:**
- This endpoint is **public** (no authentication middleware)
- Accepts `user_id` from request body instead of Auth::id()
- Automatically creates Stripe Customer if `customer_id` is null
- Returns all data needed for Stripe Payment Sheet/Element

---

### Create Subscription (Authenticated - For Mobile App)

**Endpoint:** `POST /api/create-subscription`

**Description:** Creates a Stripe subscription for authenticated users. This endpoint requires authentication and uses `Auth::id()` for the user.

**Request:**
```typescript
{
  price_id: string;  // Stripe Price ID
  // user_id is taken from authenticated user (Auth::id())
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    payment_intent: {
      client_secret: string;
    };
    ephemeral_key: string;
    stripe_subscription_id: string;
    customer_id: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

**Notes:**
- Requires authentication
- Uses authenticated user's ID automatically
- Original endpoint for mobile app and authenticated flows

---

## User Endpoints

### Create Manual User

**Endpoint:** `POST /api/create-manual-user`

**Description:** Creates a new user account during onboarding.

**Request:**
```typescript
{
  first_name: string;
  last_name: string;
  phone: string;
  country_id: number;
  email?: string;
  instagram_handle: string;
  gender: string;  // "1" for Male, "2" for Female
  invity_number?: string;
  source?: string;  // e.g., "shortform-landing-page"
}
```

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  data?: {
    id: string | number;  // User UUID or ID (REQUIRED for payment flow)
    customer_id: string | null;  // Stripe customer ID (null initially)
    first_name: string;
    last_name: string;
    phone: string;
    wait_list_count: number;
    status: string;  // "pending" or other statuses
  };
  error?: {
    code: string;
    message: string;
  };
}
```

**Important:** The `id` field is **required** in the response for the payment flow to work.

---

## Usage Flow

### Web Onboarding Flow

1. **Create User:**
   ```javascript
   POST /api/create-manual-user
   // Returns: { id: "uuid", customer_id: null }
   ```

2. **Create Subscription:**
   ```javascript
   POST /api/create-subscription-for-user
   // Body: { user_id: "uuid", price_id: "price_xxx" }
   // Returns: { payment_intent, ephemeral_key, stripe_subscription_id, customer_id }
   ```

3. **Process Payment:**
   - Use `payment_intent.client_secret` with Stripe Payment Element/Sheet
   - Backend automatically creates Stripe Customer if needed

### Mobile App Flow

1. **User is authenticated** (via app login)

2. **Create Subscription:**
   ```javascript
   POST /api/create-subscription
   // Body: { price_id: "price_xxx" }
   // Uses Auth::id() for user_id
   // Returns: { payment_intent, ephemeral_key, stripe_subscription_id, customer_id }
   ```

3. **Process Payment:**
   - Use `payment_intent.client_secret` with Stripe Payment Sheet

---

## Frontend Implementation

The frontend automatically uses the correct endpoint:

- **Web onboarding:** Uses `/api/create-subscription-for-user` (public)
- **Mobile app:** Uses `/api/create-subscription` (authenticated)

Both endpoints return the same response structure, so the frontend code works the same way.

