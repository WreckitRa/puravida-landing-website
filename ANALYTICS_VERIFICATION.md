# Analytics Verification Guide

This guide helps you verify that Google Analytics is working correctly on your live site (https://invite.puravida.events).

## Quick Checklist

- [ ] Google Analytics Measurement ID is set in environment variables
- [ ] Analytics script is loading on the page
- [ ] Page views are being tracked
- [ ] Events are being sent to Google Analytics
- [ ] Real-time data appears in GA4 dashboard

## Step 1: Verify Environment Variable

### Check Production Environment

1. **If using Vercel:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to **Settings → Environment Variables**
   - Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
   - Format should be: `G-XXXXXXXXXX`

2. **If using other hosting:**
   - Check your hosting platform's environment variable settings
   - Ensure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set

### Verify It's Loaded in Production

1. Visit your live site: https://invite.puravida.events
2. Open browser DevTools (F12 or Right-click → Inspect)
3. Go to **Console** tab
4. Type: `window.gtag`
5. If it returns a function, GA is initialized ✅
6. If it returns `undefined`, GA is not loaded ❌

## Step 2: Check Analytics Script Loading

### Method 1: Browser DevTools

1. Visit https://invite.puravida.events
2. Open DevTools (F12)
3. Go to **Network** tab
4. Filter by "gtag" or "analytics"
5. Look for requests to:
   - `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`
   - `https://www.google-analytics.com/g/collect?...`
6. If you see these requests, the script is loading ✅

### Method 2: View Page Source

1. Visit https://invite.puravida.events
2. Right-click → **View Page Source**
3. Search for "gtag" or "googletagmanager"
4. You should see the GA script tag ✅

### Method 3: Check dataLayer

1. Visit https://invite.puravida.events
2. Open DevTools Console
3. Type: `window.dataLayer`
4. You should see an array with analytics events ✅

## Step 3: Test Page View Tracking

### Real-Time Test

1. **Open Google Analytics:**
   - Go to [analytics.google.com](https://analytics.google.com)
   - Select your property
   - Go to **Reports → Realtime**

2. **Visit your site:**
   - Open https://invite.puravida.events in a new tab
   - Navigate to different pages (/, /onboarding, /ihaveinvite)

3. **Check Real-Time Report:**
   - You should see yourself appear in the real-time report within 30 seconds
   - Look for:
     - Active users: Should show 1+ users
     - Pages: Should show the pages you visited
     - Events: Should show page_view events

### Console Test

1. Visit https://invite.puravida.events
2. Open DevTools Console
3. Type:
   ```javascript
   window.gtag('event', 'test_event', {
     event_category: 'test',
     event_label: 'manual_test'
   });
   ```
4. Check Google Analytics Real-Time → Events
5. You should see "test_event" appear within 30 seconds ✅

## Step 4: Verify Event Tracking

### Check dataLayer

1. Visit https://invite.puravida.events
2. Open DevTools Console
3. Type: `window.dataLayer`
4. You should see events like:
   ```javascript
   [
     ['js', Date],
     ['config', 'G-XXXXXXXXXX', {...}],
     ['event', 'page_view', {...}],
     // ... more events
   ]
   ```

### Test Button Click Tracking

1. Visit https://invite.puravida.events
2. Open DevTools Console
3. Click any button on the page
4. Check dataLayer: `window.dataLayer`
5. You should see `onboarding_button_click` events ✅

### Test Onboarding Flow

1. Visit https://invite.puravida.events/onboarding
2. Complete a few steps
3. Open DevTools Console
4. Check dataLayer: `window.dataLayer`
5. You should see events like:
   - `onboarding_step_view`
   - `onboarding_step_complete`
   - `onboarding_button_click`
   - `onboarding_field_interaction`

## Step 5: Check Google Analytics Dashboard

### Real-Time Report

1. Go to **Reports → Realtime** in GA4
2. You should see:
   - Active users (if someone is on the site)
   - Top pages being viewed
   - Events being triggered
   - Traffic sources

### Standard Reports (24-48 hour delay)

1. Go to **Reports → Engagement → Events**
2. After 24-48 hours, you should see:
   - `page_view` events
   - `onboarding_step_view` events
   - `onboarding_button_click` events
   - Other custom events

### Acquisition Report

1. Go to **Reports → Acquisition → Traffic acquisition**
2. You should see traffic sources and mediums
3. If you've used UTM parameters, they'll appear here

## Common Issues & Solutions

### Issue 1: Analytics Not Loading

**Symptoms:**
- `window.gtag` is undefined
- No requests to googletagmanager.com in Network tab

**Solutions:**
1. Check environment variable is set correctly
2. Verify the variable name: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (must start with `NEXT_PUBLIC_`)
3. Rebuild and redeploy your site after setting environment variables
4. Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue 2: Events Not Appearing

**Symptoms:**
- Script loads but events don't appear in GA4

**Solutions:**
1. Check browser console for errors
2. Verify Measurement ID format: `G-XXXXXXXXXX` (not `UA-...`)
3. Check if ad blockers are interfering (try incognito mode)
4. Wait 24-48 hours for standard reports (real-time should work immediately)

### Issue 3: Wrong Measurement ID

**Symptoms:**
- Events appear in wrong GA4 property

**Solutions:**
1. Double-check the Measurement ID in environment variables
2. Verify it matches your GA4 property
3. Rebuild and redeploy

### Issue 4: UTM Parameters Not Tracking

**Symptoms:**
- Traffic shows as "direct" instead of source/medium

**Solutions:**
1. Verify UTM parameters are in the URL: `?utm_source=...&utm_medium=...`
2. Check attribution is initialized: `initAttribution()` is called
3. Check localStorage: `localStorage.getItem('puravida_attribution')`
4. Verify attribution is included in events (check dataLayer)

## Debugging Tools

### Google Analytics DebugView

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension
2. Enable it
3. Visit your site
4. Go to GA4 → **Admin → DebugView**
5. See real-time events with full details

### Google Tag Assistant

1. Install [Google Tag Assistant](https://tagassistant.google.com/)
2. Visit your site
3. Click the extension icon
4. See which tags are firing and any errors

### Browser Console Commands

```javascript
// Check if GA is loaded
window.gtag ? '✅ GA loaded' : '❌ GA not loaded'

// Check dataLayer
window.dataLayer

// Check Measurement ID
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID // Only works in dev

// Manually send test event
window.gtag('event', 'test', { test: true })

// Check attribution
localStorage.getItem('puravida_attribution')
```

## Testing Checklist

Use this checklist to verify everything is working:

- [ ] Environment variable `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
- [ ] GA script loads (check Network tab)
- [ ] `window.gtag` exists (check Console)
- [ ] `window.dataLayer` exists and has events
- [ ] Real-time report shows active users
- [ ] Page views appear in real-time
- [ ] Button clicks trigger events
- [ ] Onboarding steps trigger events
- [ ] UTM parameters are captured (if used)
- [ ] Events appear in GA4 DebugView (if using extension)

## Expected Behavior

### On Page Load

1. GA script loads from googletagmanager.com
2. `window.gtag` function is created
3. `window.dataLayer` array is initialized
4. `page_view` event is sent automatically

### On User Interaction

1. Button clicks → `onboarding_button_click` event
2. Form field focus → `onboarding_field_interaction` event
3. Step navigation → `onboarding_step_view` event
4. Step completion → `onboarding_step_complete` event

### With UTM Parameters

1. URL: `?utm_source=instagram&utm_medium=story`
2. Attribution stored in localStorage
3. All events include attribution data
4. Form submission includes attribution

## Still Not Working?

1. **Check the code:**
   - Verify `GoogleAnalytics` component is in `app/layout.tsx`
   - Check `lib/analytics.ts` for errors
   - Verify `initGA()` is being called

2. **Check deployment:**
   - Environment variables are set in production
   - Site was rebuilt after setting variables
   - No build errors

3. **Check browser:**
   - Try incognito mode (ad blockers disabled)
   - Try different browser
   - Clear cache and cookies

4. **Check Google Analytics:**
   - Property is active
   - Measurement ID is correct
   - No filters blocking your IP

## Quick Test Script

Run this in your browser console on https://invite.puravida.events:

```javascript
// Quick analytics test
console.log('=== Analytics Test ===');
console.log('GA Loaded:', !!window.gtag);
console.log('DataLayer:', window.dataLayer?.length || 0, 'events');
console.log('Measurement ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'Not accessible in browser');

// Send test event
if (window.gtag) {
  window.gtag('event', 'analytics_test', {
    test_category: 'verification',
    test_label: 'manual_test'
  });
  console.log('✅ Test event sent! Check GA4 Real-Time → Events');
} else {
  console.log('❌ GA not loaded!');
}
```

## Next Steps

Once verified:
1. Set up custom reports in GA4 for your key metrics
2. Create conversion goals for onboarding completion
3. Set up alerts for unusual traffic patterns
4. Document your tracking setup for your team

See `ANALYTICS.md` for full analytics documentation.

