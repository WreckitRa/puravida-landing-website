# Stripe Payment Error Troubleshooting

If you're getting an error when clicking "Choose this plan" that says you need to configure something in the Stripe Dashboard, follow these steps:

## ⚠️ Most Common Error: "Checkout client-only integration is not enabled"

**If you see this error:** "The Checkout client-only integration is not enabled. Enable it in the Dashboard at https://dashboard.stripe.com/account/checkout/settings."

### Quick Fix:

1. Go to [Stripe Checkout Settings](https://dashboard.stripe.com/account/checkout/settings)
2. Scroll down to **"Client-only integration"** section
3. Toggle **"Enable client-only integration"** to **ON** ✅
4. Click **Save**
5. Try the payment again - it should work now!

**Why this happens:** Stripe requires you to explicitly enable client-only Checkout for security reasons. This is a one-time setting.

## Quick Fix Checklist

### 1. Complete Business Information (Most Common Issue)

**This is usually the problem!**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Look for any **red warning banners** at the top of the dashboard
3. Click on **Settings** → **Business settings**
4. Complete ALL required fields:
   - ✅ Business name
   - ✅ Business type (Individual, Company, etc.)
   - ✅ Business address
   - ✅ Tax ID/EIN (if required for your country)
   - ✅ Phone number
   - ✅ Website URL
5. Click **Save**
6. Wait 2-3 minutes for Stripe to process

**Why this matters:** Stripe requires complete business information before Checkout can process payments. This is a compliance requirement.

### 2. Complete Identity Verification

1. Go to **Settings** → **Account** in Stripe Dashboard
2. Check if there's a section called **"Identity verification"** or **"Verification"**
3. If prompted, upload required documents:
   - Government-issued ID (passport, driver's license)
   - Proof of address (utility bill, bank statement)
   - Business registration documents (if applicable)
4. Wait for Stripe to review (usually 1-2 business days)

### 3. Activate Your Account

1. Check the top of your Stripe Dashboard
2. Look for messages like:
   - "Complete your account setup"
   - "Activate your account"
   - "Verify your identity"
3. Click on any prompts and complete the required steps

### 4. Enable Payment Methods

1. Go to **Settings** → **Payment methods** in Stripe Dashboard
2. Make sure these are enabled:
   - ✅ Credit and debit cards
   - ✅ Apple Pay (if you want it)
   - ✅ Google Pay (if you want it)
3. Some payment methods may require additional agreements - accept them if prompted

### 5. Check Account Status

1. Go to **Settings** → **Account** in Stripe Dashboard
2. Look at your account status:
   - Should show "Active" or "Enabled"
   - If it shows "Restricted" or "Pending", you need to complete verification

## Common Error Messages & Solutions

### Error: "Your account cannot currently make live charges"

**Solution:**
- Complete business information (Step 1 above)
- Complete identity verification (Step 2 above)
- Wait for account activation

### Error: "Invalid publishable key"

**Solution:**
1. Go to **Developers** → **API keys** in Stripe Dashboard
2. Make sure you're using the correct key:
   - **Test mode**: Use `pk_test_...`
   - **Live mode**: Use `pk_live_...`
3. Copy the key and set it in your environment variables:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   ```
4. **Rebuild and redeploy** your site after setting the variable

### Error: "No such price" or "Product not found"

**Solution:**
1. Go to **Products** in Stripe Dashboard
2. Verify your products and prices exist
3. Check that the Price IDs match what your backend API returns
4. Make sure you're in the correct mode (Test vs Live)

### Error: "Business information incomplete"

**Solution:**
- Follow Step 1 above (Complete Business Information)
- Make sure ALL required fields are filled
- Save and wait a few minutes

## Step-by-Step: Complete Account Setup

### Step 1: Business Information

1. **Settings** → **Business settings**
2. Fill in:
   ```
   Business name: PuraVida (or your business name)
   Business type: Company (or Individual)
   Business address: [Your address]
   Tax ID: [If required]
   Phone: [Your phone]
   Website: https://invite.puravida.events
   ```
3. Click **Save**

### Step 2: Identity Verification

1. **Settings** → **Account** → **Identity verification**
2. Upload required documents
3. Wait for approval (1-2 business days)

### Step 3: Payment Methods

1. **Settings** → **Payment methods**
2. Enable:
   - Credit and debit cards ✅
   - (Optional) Apple Pay, Google Pay
3. Accept any required agreements

### Step 4: Test Payment

1. Make sure you're in **Test mode** (toggle in top right)
2. Use test card: `4242 4242 4242 4242`
3. Try the payment flow again
4. If it works in test mode, switch to **Live mode** and try again

## Verify Your Setup

### Check 1: Business Information

1. Go to **Settings** → **Business settings**
2. All fields should be filled (no red warnings)
3. Status should show "Complete" or "Verified"

### Check 2: Account Status

1. Go to **Settings** → **Account**
2. Account status should be:
   - ✅ "Active" or "Enabled"
   - ❌ NOT "Restricted" or "Pending"

### Check 3: API Keys

1. Go to **Developers** → **API keys**
2. Verify you have:
   - Publishable key (starts with `pk_...`)
   - Secret key (starts with `sk_...`)
3. Make sure you're using the right mode (Test vs Live)

### Check 4: Products

1. Go to **Products** in Stripe Dashboard
2. Verify products exist
3. Check that prices are created
4. Copy a Price ID and verify it matches your backend

## Still Not Working?

### Debug Steps:

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Click "Choose this plan" again
   - Look for the exact error message
   - Share the error message for further help

2. **Check Network Tab:**
   - Open DevTools → **Network** tab
   - Click "Choose this plan"
   - Look for failed requests to Stripe
   - Check the error response

3. **Verify Environment Variable:**
   ```bash
   # Check if variable is set (in your hosting platform)
   echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   ```
   - Should show: `pk_live_...` or `pk_test_...`
   - If empty, set it and rebuild

4. **Test in Stripe Dashboard:**
   - Go to **Payments** → **Create payment**
   - Try creating a test payment manually
   - If this fails, your account needs more setup

## Quick Test

Run this in your browser console on the onboarding page:

```javascript
// Check if Stripe key is loaded
console.log('Stripe Key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'NOT SET');

// Check if Stripe library is loaded
if (typeof window !== 'undefined') {
  import('@stripe/stripe-js').then(({ loadStripe }) => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').then(stripe => {
      if (stripe) {
        console.log('✅ Stripe loaded successfully');
      } else {
        console.error('❌ Stripe failed to load - check publishable key');
      }
    });
  });
}
```

## Most Likely Solution

**90% of the time, the issue is incomplete business information.**

1. Go to Stripe Dashboard
2. Look for red warning banners
3. Click **Settings** → **Business settings**
4. Complete ALL fields
5. Save and wait 2-3 minutes
6. Try payment again

## Need More Help?

- Check the exact error message in browser console
- Take a screenshot of the error
- Check Stripe Dashboard for any warning messages
- Verify your account status in **Settings** → **Account**

## Related Guides

- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Complete Stripe setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Environment variables setup

