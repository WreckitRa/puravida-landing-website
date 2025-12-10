# Google Analytics Setup Guide

## Current Configuration

- **Measurement ID**: `G-VR8NMPGBV5`
- **Implementation**: Google Analytics 4 (GA4)
- **Framework**: Next.js 16 with Static Export

## How It Works

### 1. Environment Variables

The GA Measurement ID is stored in `.env`:

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-VR8NMPGBV5
```

**Important**: With Next.js static export, environment variables starting with `NEXT_PUBLIC_` are **embedded at build time** into the JavaScript bundles.

### 2. Implementation Files

#### `components/GoogleAnalytics.tsx`

- Client component that loads the GA script
- Uses Next.js `Script` component with `afterInteractive` strategy
- Automatically tracks page views on route changes
- Includes attribution data in all events

#### `lib/analytics.ts`

- Provides utility functions for tracking events
- Handles all custom event tracking
- Automatically includes attribution data

#### `lib/attribution.ts`

- Tracks UTM parameters and marketing attribution
- Stores data in localStorage for session tracking

### 3. Event Tracking

The following events are automatically tracked:

- **Page Views**: Tracked on every route change
- **Button Clicks**: Via `trackButtonClick()`
- **Form Submissions**: Via `trackFormSubmission()`
- **Custom Events**: Via `trackEvent()`

## Verification Steps

### 1. Local Development

1. Start the dev server:

   ```bash
   npm run dev
   ```

2. Open browser console (F12)

3. Look for these messages:
   ```
   ✅ Google Analytics dataLayer initialized
   ✅ Google Analytics script loaded
   ✅ Google Analytics configured: G-VR8NMPGBV5
   ✅ Initial page_view sent
   📊 Page view tracked: /
   ```

### 2. Production Verification

After deployment, verify GA is working:

#### Option A: Use the Test Page

1. Visit: `https://invite.puravida.events/ga-test.html`
2. Click "Check Status" - should see green success message
3. Click "Send Test Event" - event will be sent to GA
4. Check Google Analytics Real-Time view

#### Option B: Use the Diagnostic Tool

1. Visit: `https://invite.puravida.events/ga-diagnostic.html`
2. Review all diagnostic checks
3. Send test events
4. Copy diagnostic report if issues found

#### Option C: Check Browser Console

1. Open any page on the site
2. Open browser console (F12)
3. Look for GA initialization messages
4. Type `window.dataLayer` to see all events sent

### 3. Google Analytics Dashboard

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select the PuraVida property
3. Go to **Reports** > **Real-time**
4. You should see:
   - Active users
   - Page views
   - Events (when triggered)

## Troubleshooting

### Issue: No events showing in GA

**Possible causes:**

1. **Build-time issue**: The env var wasn't available during build

   - Solution: Rebuild with `npm run build`
   - Verify the GA ID is in the built JS files:
     ```bash
     grep -r "G-VR8NMPGBV5" out/_next/static/chunks/*.js
     ```

2. **Ad blockers**: Browser extensions blocking GA

   - Solution: Test in incognito mode or disable ad blockers

3. **Incorrect Measurement ID**: Wrong GA property

   - Solution: Verify in `.env` file matches GA property

4. **Data processing delay**: GA can take 24-48 hours for non-real-time reports
   - Solution: Check Real-Time view for immediate feedback

### Issue: Console errors about GA

Check for:

- Network errors (blocked by firewall/ad blocker)
- Script loading errors
- CORS issues

### Issue: Events sent but not tracked

1. Verify measurement ID is correct
2. Check data stream is active in GA
3. Ensure you're looking at the correct GA property
4. Wait 24-48 hours for processing (use Real-Time for immediate feedback)

## Deployment Checklist

Before deploying, ensure:

- [ ] `.env` file has correct `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] Run `npm run build` to rebuild with env vars
- [ ] Check built files contain the GA ID
- [ ] Deploy the `out/` directory
- [ ] Test on production URL
- [ ] Verify in GA Real-Time view

## File Structure

```
├── components/
│   └── GoogleAnalytics.tsx       # GA initialization component
├── lib/
│   ├── analytics.ts              # Event tracking utilities
│   └── attribution.ts            # UTM tracking utilities
├── public/
│   ├── ga-test.html              # Simple GA test page
│   └── ga-diagnostic.html        # Comprehensive diagnostic tool
└── .env                          # Environment variables
```

## Important Notes

1. **Static Export**: Since this is a static site, env vars are baked into JS at build time
2. **Real-Time Only**: Use Real-Time view in GA for immediate verification
3. **Attribution Data**: All events automatically include UTM parameters
4. **Console Logs**: Check browser console for detailed GA activity

## Support

If issues persist:

1. Run the diagnostic tool and copy the report
2. Check browser console for errors
3. Verify network requests to `googletagmanager.com` and `google-analytics.com`
4. Test with the simple test page (`/ga-test.html`)

