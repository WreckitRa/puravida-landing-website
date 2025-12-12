# Google Analytics Setup Verification

## ✅ Fixed Issues

### 1. **Simplified GoogleAnalytics Component**

- **Before**: Complex async loading with custom init functions
- **After**: Uses Next.js `Script` component (recommended approach)
- **Matches**: The working `ga-test.html` implementation

### 2. **Proper Script Loading**

- Uses `strategy="afterInteractive"` for optimal performance
- Initializes `dataLayer` and `gtag` function correctly
- Matches the exact pattern from working HTML file

### 3. **Page View Tracking**

- Manual page view tracking (since `send_page_view: false`)
- Tracks on route changes via `usePathname`
- Includes attribution data automatically

## 🔧 Setup Requirements

### Environment Variables

Make sure you have one of these set in your `.env.local` or production environment:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# OR
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

### Verification Steps

1. **Check Console Logs**

   - Open browser DevTools
   - Look for: `✅ GA initialized with ID: G-XXXXXXXXXX`
   - Should appear after page load

2. **Check Network Tab**

   - Look for request to: `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`
   - Should return 200 status

3. **Check DataLayer**

   - In console, type: `window.dataLayer`
   - Should show an array with GA events

4. **Test Event Tracking**
   - Navigate between pages
   - Check Google Analytics Real-Time reports
   - Events should appear within 30 seconds

## 🐛 Troubleshooting

### Events Not Appearing

1. **Check Environment Variable**

   ```bash
   # In your terminal (on server)
   echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
   ```

   Should show your GA ID

2. **Rebuild After Env Change**

   ```bash
   npm run build
   npm start
   ```

   `NEXT_PUBLIC_` vars are embedded at build time

3. **Check Browser Console**

   - Look for errors
   - Check if `window.gtag` exists
   - Verify `window.dataLayer` is populated

4. **Verify Script Loading**
   - Check Network tab for GA script
   - Should load from `googletagmanager.com`
   - No CORS errors

### Common Issues

**Issue**: "Measurement ID not found"

- **Solution**: Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.local` and rebuild

**Issue**: Script loads but no events

- **Solution**: Check browser console for errors, verify gtag function exists

**Issue**: Events appear in test HTML but not in Next.js

- **Solution**: Ensure you rebuilt after adding env variable (`npm run build`)

## 📊 Testing

### Quick Test

1. Open your site in browser
2. Open DevTools Console
3. Type: `window.gtag('event', 'test_event', { test: true })`
4. Check GA Real-Time reports - should appear

### Full Test

1. Navigate to different pages
2. Click buttons (should trigger `trackButtonClick`)
3. Fill forms (should trigger form events)
4. Check GA Real-Time → Events section

## 🔍 Current Setup

- **Component**: `components/GoogleAnalytics.tsx`
- **Strategy**: `afterInteractive` (loads after page becomes interactive)
- **Page Views**: Manual tracking via `trackPageView()`
- **Custom Events**: Via `trackEvent()` in `lib/analytics.ts`

## ✅ What's Working

- ✅ Script loads correctly
- ✅ dataLayer initialized
- ✅ gtag function available
- ✅ Page views tracked on route change
- ✅ Custom events tracked via utility functions
- ✅ Matches working HTML implementation
