# Stripe Dashboard Configuration Guide

This guide walks you through configuring Stripe Dashboard to enable payment processing in your onboarding flow.

## Overview

Your app uses **Stripe Checkout** in **subscription mode** to process payments. Here's what needs to be configured:

1. ✅ Business information (required for Checkout)
2. ✅ Products and Prices (required)
3. ✅ Publishable Key (environment variable)
4. ✅ Webhook endpoints (for payment completion - backend)

## Step 1: Enable Client-Only Checkout Integration ⚠️ IMPORTANT

**This is required for your payment flow to work!**

1. Go to [Stripe Checkout Settings](https://dashboard.stripe.com/account/checkout/settings)
2. Scroll down to the **"Client-only integration"** section
3. Toggle **"Enable client-only integration"** to **ON** ✅
4. Click **Save**

**Why this is needed:** Your app uses `stripe.redirectToCheckout()` which requires this setting to be enabled. Without it, you'll get the error: "The Checkout client-only integration is not enabled."

## Step 2: Complete Business Information

**This is usually what Stripe asks for first!**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click on **Settings** → **Business settings**
3. Complete all required fields:
   - **Business name**
   - **Business type**
   - **Business address**
   - **Tax information** (if applicable)
   - **Bank account details** (for payouts)

4. Click **Save**

**Why this is needed:** Stripe requires complete business information before Checkout can process real payments. This is a compliance requirement.

## Step 3: Create Products and Prices

Your app fetches products from your backend API (`/api/get-products`), but you need to create them in Stripe first.

### Create a Product:

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**
3. Fill in:
   - **Name**: e.g., "PuraVida Membership"
   - **Description**: e.g., "Dubai's Exclusive Nightlife Membership"
   - **Images**: (optional) Upload your logo/image
4. Click **Save product**

### Create a Price for the Product:

1. On the product page, click **+ Add another price**
2. Configure:
   - **Pricing model**: Recurring (for subscriptions)
   - **Price**: Enter your monthly/annual amount
   - **Billing period**: Monthly or Annual
   - **Currency**: Select (e.g., USD, AED)
3. Click **Save price**

4. **Copy the Price ID** (starts with `price_...`) - you'll need this!

### Repeat for All Products:

Create products and prices for all your membership tiers:
- Basic Membership
- Premium Membership
- Annual Membership
- etc.

**Important:** The Price IDs from Stripe must match what your backend API returns in `/api/get-products`.

## Step 4: Get Your Publishable Key

1. Go to **Developers** → **API keys** in Stripe Dashboard
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret key** (starts with `sk_test_...` or `sk_live_...`)

3. **Copy the Publishable key**

### Set Environment Variable:

Add this to your environment variables (Vercel, or wherever you're hosting):

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

**Important:**
- Use `pk_test_...` for testing/development
- Use `pk_live_...` for production
- Never expose your **Secret key** in frontend code!

## Step 5: Configure Webhook Endpoints (Backend)

Your backend needs to handle Stripe webhooks to know when payments are completed.

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. Enter your webhook URL:
   ```
   https://api.puravida.events/api/stripe-webhook
   ```
   (Adjust this to match your actual backend webhook endpoint)

4. Select events to listen for:
   - `checkout.session.completed` - When payment succeeds
   - `customer.subscription.created` - When subscription is created
   - `customer.subscription.updated` - When subscription changes
   - `customer.subscription.deleted` - When subscription is cancelled
   - `invoice.payment_succeeded` - When recurring payment succeeds
   - `invoice.payment_failed` - When payment fails

5. Click **Add endpoint**

6. **Copy the Webhook Signing Secret** (starts with `whsec_...`)
   - This should be stored in your backend environment variables
   - Used to verify webhook requests are from Stripe

## Step 6: Test Mode vs Live Mode

### Test Mode (Development):

1. Toggle **Test mode** in Stripe Dashboard (top right)
2. Use test publishable key: `pk_test_...`
3. Use test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
   - Any future expiry date
   - Any 3-digit CVC

### Live Mode (Production):

1. Toggle **Live mode** in Stripe Dashboard
2. Use live publishable key: `pk_live_...`
3. Real payments will be processed
4. Make sure business information is complete!

## Step 7: Verify Your Setup

### Check Environment Variable:

1. Make sure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in production
2. Rebuild/redeploy your site after setting it

### Test Payment Flow:

1. Visit your onboarding page
2. Complete the form
3. Click on a payment plan
4. You should be redirected to Stripe Checkout
5. Complete a test payment
6. You should be redirected back to `/onboarding?payment=success`

### Check Stripe Dashboard:

1. Go to **Payments** in Stripe Dashboard
2. You should see the test payment
3. Check **Customers** to see if customer was created
4. Check **Subscriptions** to see if subscription was created

## Common Issues & Solutions

### Issue 1: "Business information incomplete"

**Error:** Stripe shows a message about incomplete business information

**Solution:**
- Go to **Settings** → **Business settings**
- Complete all required fields
- Save and wait a few minutes for Stripe to process

### Issue 2: "Invalid publishable key"

**Error:** Payment fails with "Invalid publishable key"

**Solution:**
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly
- Make sure you're using the right key (test vs live)
- Rebuild/redeploy after setting the variable

### Issue 3: "Price not found"

**Error:** Payment fails with "No such price"

**Solution:**
- Verify the Price ID exists in Stripe
- Check that your backend API returns correct Price IDs
- Make sure Price ID matches between Stripe and your database

### Issue 4: "Webhook signature verification failed"

**Error:** Backend can't verify webhook requests

**Solution:**
- Check webhook signing secret is set correctly in backend
- Verify webhook endpoint URL is correct
- Make sure backend is using the right secret (test vs live)

### Issue 5: Payment succeeds but subscription not created

**Error:** Payment works but subscription doesn't appear

**Solution:**
- Check webhook endpoint is configured
- Verify webhook events are being received
- Check backend logs for webhook processing errors

## Security Checklist

- [ ] Never commit Stripe keys to Git
- [ ] Use environment variables for all keys
- [ ] Use test keys for development
- [ ] Use live keys only in production
- [ ] Verify webhook signatures in backend
- [ ] Use HTTPS for all webhook endpoints
- [ ] Keep secret keys secure (never expose in frontend)

## Environment Variables Summary

Add these to your hosting platform (Vercel, etc.):

```bash
# Stripe (required for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# Other required variables
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://invite.puravida.events
NEXT_PUBLIC_API_URL=https://api.puravida.events
```

## Next Steps

1. ✅ **Enable client-only Checkout integration** (Step 1 - REQUIRED!)
2. ✅ Complete business information in Stripe Dashboard
3. ✅ Create products and prices
4. ✅ Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` environment variable
5. ✅ Configure webhook endpoint (backend)
6. ✅ Test payment flow
7. ✅ Switch to live mode when ready

## Need Help?

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Support](https://support.stripe.com/)

