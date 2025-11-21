# Fix: Google Analytics Not Collecting Data

If you see "Data collection isn't active for your website" in Google Analytics, follow these steps:

## Your Measurement ID
**G-VR8NMPGBV5**

## Step 1: Verify Environment Variable in Production

### If Using Vercel:

1. Go to [vercel.com](https://vercel.com) and log in
2. Select your project (`puravida-new-website`)
3. Go to **Settings → Environment Variables**
4. Look for `NEXT_PUBLIC_GA_MEASUREMENT_ID`
5. **It should be set to:** `G-VR8NMPGBV5`

**If it's missing or wrong:**
1. Click **Add New**
2. Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
3. Value: `G-VR8NMPGBV5`
4. Environment: Select **Production** (and Preview/Development if needed)
5. Click **Save**

### If Using Other Hosting:

Check your hosting platform's environment variable settings and ensure:
- Variable name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Variable value: `G-VR8NMPGBV5`

## Step 2: Rebuild and Redeploy

**IMPORTANT:** After setting/changing environment variables, you MUST rebuild and redeploy!

### Vercel:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a rebuild

### Other Platforms:
- Rebuild your site after setting environment variables
- Environment variables are only available at build time for Next.js

## Step 3: Verify It's Working

### Quick Test (Browser Console):

1. Visit https://invite.puravida.events
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Run this test:

```javascript
// Check if GA is loaded
console.log('Measurement ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'NOT FOUND IN BROWSER');
console.log('gtag function:', typeof window.gtag);
console.log('dataLayer:', window.dataLayer?.length || 0, 'events');

// Check if script loaded
if (window.gtag) {
  console.log('✅ Google Analytics is loaded!');
  // Send a test event
  window.gtag('event', 'test_event', {
    event_category: 'diagnostic',
    event_label: 'manual_test'
  });
  console.log('✅ Test event sent! Check GA4 Real-Time → Events');
} else {
  console.error('❌ Google Analytics NOT loaded!');
  console.error('Check:');
  console.error('1. Environment variable is set in production');
  console.error('2. Site was rebuilt after setting variable');
  console.error('3. No ad blockers are interfering');
}
```

### Network Tab Check:

1. Visit https://invite.puravida.events
2. Open DevTools → **Network** tab
3. Filter by "gtag" or "analytics"
4. You should see:
   - ✅ `https://www.googletagmanager.com/gtag/js?id=G-VR8NMPGBV5`
   - ✅ `https://www.google-analytics.com/g/collect?...`

If you DON'T see these:
- ❌ Environment variable not set
- ❌ Site not rebuilt after setting variable
- ❌ Ad blocker blocking the script

### Google Analytics Real-Time Test:

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property
3. Go to **Reports → Realtime**
4. Visit https://invite.puravida.events in a new tab
5. Navigate to different pages
6. You should see yourself appear in Real-Time within 30 seconds

## Common Issues & Solutions

### Issue 1: Environment Variable Not Set

**Symptom:** Console shows "Measurement ID not found"

**Solution:**
1. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-VR8NMPGBV5` in production environment
2. **Rebuild and redeploy** your site

### Issue 2: Site Not Rebuilt After Setting Variable

**Symptom:** Variable is set but GA still not working

**Solution:**
- **Vercel:** Click "Redeploy" on latest deployment
- **Other:** Rebuild your site completely

### Issue 3: Ad Blocker Blocking Script

**Symptom:** Script loads in Network tab but events don't fire

**Solution:**
- Test in incognito mode with ad blocker disabled
- Or use a different browser

### Issue 4: Wrong Measurement ID

**Symptom:** Events go to wrong GA property

**Solution:**
- Verify Measurement ID matches: `G-VR8NMPGBV5`
- Check it's set correctly in environment variables

## Verification Checklist

Use this checklist to verify everything:

- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in production environment
- [ ] Value is exactly: `G-VR8NMPGBV5`
- [ ] Site was rebuilt/redeployed after setting variable
- [ ] Browser console shows "✅ Google Analytics initialized"
- [ ] Network tab shows requests to googletagmanager.com
- [ ] `window.gtag` exists in browser console
- [ ] `window.dataLayer` has events
- [ ] Real-Time report in GA4 shows activity

## Still Not Working?

### Debug Steps:

1. **Check the build logs:**
   - Look for any errors during build
   - Verify environment variables are available at build time

2. **Check browser console:**
   - Look for any JavaScript errors
   - Check if the GA script is being blocked

3. **Check Network tab:**
   - See if requests to googletagmanager.com are being made
   - Check if they're being blocked (CORS, ad blocker, etc.)

4. **Test in different browser:**
   - Try Chrome, Firefox, Safari
   - Try incognito/private mode

5. **Check Google Analytics:**
   - Verify the Measurement ID is correct
   - Check if there are any filters blocking your IP
   - Verify the property is active

### Get Help:

If still not working after all steps:
1. Check browser console for specific error messages
2. Check Network tab for failed requests
3. Share the error messages for further debugging

## Quick Fix Command (Vercel CLI)

If you have Vercel CLI installed:

```bash
# Set the environment variable
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production

# When prompted, enter: G-VR8NMPGBV5

# Redeploy
vercel --prod
```

## Expected Console Output

When working correctly, you should see in the browser console:

```
✅ Google Analytics initialized: G-VR8NMPGBV5
✅ Google Analytics script loaded successfully
✅ Google Analytics script loaded from googletagmanager.com
✅ Google Analytics configured with Measurement ID: G-VR8NMPGBV5
📊 Page view tracked: /
```

If you see errors or warnings, follow the solutions above.

