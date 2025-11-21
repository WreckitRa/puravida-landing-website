# Complete Payment Flow Documentation

## Overview

This document describes the complete payment flow from plan selection to success page, including both paid and unpaid paths.

## Flow Diagram

```
User completes onboarding form
         ↓
    Step 9: Emotional lead-in
         ↓
    Step 10: Confirmation (if approved immediately)
    OR
    Step 11: Payment Plans (if status is "pending")
         ↓
    ┌─────────────────┬─────────────────┐
    │                 │                 │
User Pays      User Skips      User Cancels
    │                 │                 │
    ↓                 ↓                 ↓
Payment Modal    Step 10         Stay on Step 11
    │            (Standard)      (Can retry)
    ↓
Payment Success
    │
    ↓
Step 10 with Fast Track Message
```

## Step-by-Step Flow

### 1. Plan Selection (Step 11)

**When:** User completes onboarding and status is "pending"

**What happens:**
- User sees payment plans (monthly/yearly)
- User can:
  - **Select a plan** → Payment flow starts
  - **Skip payment** → Goes to Step 10 (standard review)

**Code location:** `app/onboarding/page.tsx` line ~2245

### 2. Payment Flow (When User Selects Plan)

**Step 2a: API Call**
```javascript
POST /api/create-subscription-for-user
Body: { user_id: "uuid", price_id: "price_xxx" }
```

**Response:**
```json
{
  "data": {
    "client_secret": "pi_xxx_secret_xxx",
    "payment_intent": { ... },
    "stripe_subscription_id": "sub_xxx",
    "stripe_customer_id": "cus_xxx"
  }
}
```

**Step 2b: Payment Modal Opens**
- Modal appears with Stripe Card Element
- User enters card details
- User clicks "Pay Now"

**Step 2c: Payment Confirmation**
```javascript
stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: "Customer Name" }
  }
})
```

**Step 2d: Success Handling**
- `hasPaid` state set to `true`
- Modal closes
- Redirects to: `/onboarding?payment=success`
- URL parameter triggers navigation to Step 10

### 3. Success Page (Step 10)

**Two Variations:**

#### A. With Payment (Fast Track)
- **Title:** "Payment Successful! 🎉"
- **Fast Track Message:** Shows prominent banner:
  ```
  ⚡ Your Application is Now on Fast Track! 🚀
  Thank you for your payment! Your membership subscription 
  is now active, and our team will prioritize your application 
  for faster review. You'll hear from us within 24 hours.
  ```
- **Subtitle:** "Your membership is being activated!"
- **Message:** Explains payment processed, activation code coming via WhatsApp

#### B. Without Payment (Standard Review)
- **Title:** "Welcome to PuraVida! ❤️"
- **Subtitle:** "You're in! Add yourself to the guestlist 🎉"
- **Message:** Standard approval message, activation code via WhatsApp

**Code location:** `app/onboarding/page.tsx` line ~2085

### 4. Skip Payment Flow

**When:** User clicks "Continue with standard review (no payment)"

**What happens:**
- `hasPaid` remains `false`
- Navigates directly to Step 10
- Shows standard success message (no fast track)

**Code location:** `app/onboarding/page.tsx` line ~2562

## State Management

### Key State Variables

```typescript
const [hasPaid, setHasPaid] = useState(false); // Tracks if user paid
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string | null>(null);
const [isProcessingPayment, setIsProcessingPayment] = useState(false);
```

### State Flow

1. **Initial:** `hasPaid = false`
2. **After payment success:** `hasPaid = true`
3. **Step 10 checks:** `if (hasPaid)` → Show fast track message

## URL Parameters

### Payment Success
```
/onboarding?payment=success
```
- Triggers: `setHasPaid(true)` and `setCurrentStep(10)`
- URL is cleaned up after handling

### Payment Cancel
```
/onboarding?payment=cancel
```
- User stays on payment page (Step 11)
- Can retry payment

## Component Files

### Payment Modal
- **File:** `components/PaymentModal.tsx`
- **Features:**
  - Stripe Card Element for card input
  - Payment confirmation using `confirmCardPayment`
  - Error handling and loading states
  - Success/error callbacks

### Onboarding Page
- **File:** `app/onboarding/page.tsx`
- **Key Functions:**
  - `handleStripeCheckout()` - Initiates payment flow
  - Payment success handler - Sets `hasPaid` and navigates
  - Step 10 render - Shows fast track or standard message

## Testing Checklist

### Payment Flow
- [ ] User selects payment plan
- [ ] API call succeeds and returns `client_secret`
- [ ] Payment modal opens
- [ ] User can enter card details
- [ ] Payment confirmation works
- [ ] Success redirects to Step 10
- [ ] Fast track message appears

### Skip Payment Flow
- [ ] User clicks "Continue with standard review"
- [ ] Navigates to Step 10
- [ ] Standard message appears (no fast track)

### Error Handling
- [ ] Payment failure shows error in modal
- [ ] User can retry payment
- [ ] User can cancel and skip payment

## API Endpoints

### Create Subscription
```
POST /api/create-subscription-for-user
Body: { user_id: string, price_id: string }
Response: { data: { client_secret: string, ... } }
```

## Environment Variables

Required:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_live_... or pk_test_...)

## Common Issues

### Modal Not Opening
- Check browser console for errors
- Verify `client_secret` is extracted from API response
- Check `showPaymentModal` and `paymentIntentClientSecret` state

### Fast Track Message Not Showing
- Verify `hasPaid` is set to `true` after payment
- Check URL parameter `?payment=success` is handled
- Verify Step 10 checks `hasPaid` state

### Payment Fails
- Check Stripe publishable key is correct (live vs test)
- Verify price ID matches Stripe mode
- Check browser console for Stripe errors

