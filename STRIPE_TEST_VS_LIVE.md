# Stripe Test Mode vs Live Mode

## The Error

```
Invalid price ID: No such price: 'price_1SScVzKpAtpcKgcVKzA027t8'; 
a similar object exists in live mode, but a test mode key was used to make this request.
```

## What This Means

You're using a **test mode** Stripe publishable key (`pk_test_...`) but trying to use a **live mode** price ID (`price_1SScVzKpAtpcKgcVKzA027t8`).

Stripe has two separate modes:
- **Test Mode**: For testing with fake cards
- **Live Mode**: For real payments

You **cannot** mix them - test keys can only use test prices, live keys can only use live prices.

## Solutions

### Option 1: Use Live Mode (Production)

If you want to process real payments:

1. **Get your Live Publishable Key:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Make sure you're in **Live mode** (toggle in top right)
   - Go to **Developers** → **API keys**
   - Copy the **Publishable key** (starts with `pk_live_...`)

2. **Update Environment Variable:**
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   ```

3. **Rebuild and Redeploy:**
   - After setting the environment variable, rebuild your site
   - The live key will work with live price IDs

### Option 2: Use Test Mode (Testing)

If you want to test with fake cards:

1. **Get Test Price IDs:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Make sure you're in **Test mode** (toggle in top right)
   - Go to **Products**
   - Find your products and copy the **Test mode** price IDs
   - Test price IDs look the same but only work in test mode

2. **Update Your Backend:**
   - Make sure your backend API `/api/get-products` returns **test mode** price IDs
   - Or pass `stripe_type=0` (or whatever your backend uses for test mode) when fetching products

3. **Keep Test Publishable Key:**
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   ```

## How to Check Your Current Mode

### Check Frontend Key:

1. Visit your site: https://invite.puravida.events
2. Open browser console (F12)
3. Type:
   ```javascript
   console.log('Stripe Key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
   ```
4. Look at the key:
   - `pk_test_...` = Test mode
   - `pk_live_...` = Live mode

### Check Backend Price IDs:

1. Check what your backend API `/api/get-products` returns
2. The price IDs should match the mode of your publishable key

## Quick Fix Checklist

### For Production (Live Mode):

- [ ] Go to Stripe Dashboard → **Live mode**
- [ ] Copy **Live** publishable key (`pk_live_...`)
- [ ] Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...` in environment variables
- [ ] Make sure backend returns **live** price IDs
- [ ] Rebuild and redeploy site

### For Testing (Test Mode):

- [ ] Go to Stripe Dashboard → **Test mode**
- [ ] Copy **Test** publishable key (`pk_test_...`)
- [ ] Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` in environment variables
- [ ] Make sure backend returns **test** price IDs
- [ ] Use test cards: `4242 4242 4242 4242`

## Backend Configuration

Your backend API `/api/get-products` should return price IDs that match your frontend's Stripe mode:

### Test Mode:
```javascript
// Backend should return test price IDs when stripe_type=0 (or test mode)
GET /api/get-products?stripe_type=0
// Returns test price IDs
```

### Live Mode:
```javascript
// Backend should return live price IDs when stripe_type=1 (or live mode)
GET /api/get-products?stripe_type=1
// Returns live price IDs
```

## Current Code

Your frontend fetches products with:
```typescript
getProducts(1)  // 1 = production/live mode
```

Make sure:
1. Your backend returns **live** price IDs when `stripe_type=1`
2. Your frontend uses **live** publishable key (`pk_live_...`)

OR

1. Your backend returns **test** price IDs when `stripe_type=0`
2. Your frontend uses **test** publishable key (`pk_test_...`)

## Summary

**The error means:** Test key + Live price = ❌ Mismatch

**Fix:** Use matching modes:
- Test key + Test price = ✅
- Live key + Live price = ✅

Choose one:
- **Production**: Use live key + live prices
- **Testing**: Use test key + test prices

