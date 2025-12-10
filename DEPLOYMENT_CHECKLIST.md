# Deployment Checklist - Google Analytics Fixes

## Pre-Deployment Verification

### 1. Build Verification ✅

- [x] Build completes successfully
- [x] No TypeScript errors
- [x] No linter errors
- [x] GA Measurement ID embedded in built files
- [x] Static export working correctly

### 2. Files Changed

- [x] `components/GoogleAnalytics.tsx` - Rewritten with Next.js Script
- [x] `lib/analytics.ts` - Simplified and type-safe
- [x] `app/page.tsx` - Removed manual tracking
- [x] `app/event/[id]/EventPageClient.tsx` - Removed manual tracking
- [x] `app/abla-bakh/page.tsx` - Removed manual tracking
- [x] `public/ga-test.html` - New test page added
- [x] `ANALYTICS_SETUP.md` - Documentation added
- [x] `GA_FIXES_SUMMARY.md` - Summary document added

## Deployment Steps

1. **Commit Changes**

   ```bash
   git add .
   git commit -m "fix: Google Analytics implementation and tracking

   - Refactored GoogleAnalytics component to use Next.js Script component
   - Removed duplicate initialization logic
   - Automatic page view tracking on route changes
   - Fixed TypeScript types (any → unknown)
   - Added diagnostic tools and documentation
   - Removed manual trackPageView calls from pages"
   ```

2. **Push to Remote**

   ```bash
   git push
   ```

3. **Deploy Using Deploy Script**
   ```bash
   ./deploy.sh
   ```
   - Choose version bump (patch recommended)
   - Provide commit message if not already pushed
   - Script will build and deploy to server

## Post-Deployment Verification

### Immediate Checks (Within 5 minutes)

1. **Visit Production Site**

   - URL: `https://invite.puravida.events`
   - Open browser DevTools (F12)
   - Go to Console tab

2. **Check Console Logs**
   Expected output:

   ```
   ✅ Google Analytics dataLayer initialized
   ✅ Google Analytics script loaded
   ✅ Google Analytics configured: G-VR8NMPGBV5
   ✅ Initial page_view sent
   📊 Page view tracked: /
   ```

3. **Check Network Tab**
   Look for successful requests to:

   - `https://www.googletagmanager.com/gtag/js?id=G-VR8NMPGBV5`
   - `https://www.google-analytics.com/g/collect`

4. **Test Simple Page**

   - Visit: `https://invite.puravida.events/ga-test.html`
   - Click "Check Status" button
   - Should see green success message
   - Click "Send Test Event"
   - Should see confirmation message

5. **Test Navigation**

   - Navigate to different pages (/, /onboarding, /privacy-policy)
   - Check console for page view tracking messages
   - Each navigation should log: `📊 Page view tracked: /path`

6. **Test Event Tracking**
   - Click various buttons (e.g., "Request an invite")
   - Check console for event tracking (may not show in all cases, but GA should receive them)

### Google Analytics Dashboard (Within 5-10 minutes)

1. **Open GA Real-Time View**

   - Go to: https://analytics.google.com/
   - Select PuraVida property (G-VR8NMPGBV5)
   - Navigate to: Reports > Real-time

2. **Verify Active Users**

   - Should see at least 1 active user (you)
   - Map should show your location

3. **Verify Page Views**

   - Real-time view should show page views
   - Navigate site and watch count increase
   - Page paths should appear in the list

4. **Verify Events**

   - Click buttons on the site
   - Go to Real-time > Events
   - Should see events appearing:
     - `page_view`
     - `onboarding_button_click`
     - Custom events as they're triggered

5. **Test Event Flow**
   ```
   Action                     → Expected Event
   ────────────────────────────────────────────
   Load homepage              → page_view (/)
   Click "Request invite"     → onboarding_button_click
   Navigate to /onboarding    → page_view (/onboarding)
   Fill form field           → onboarding_field_interaction
   Submit form               → onboarding_form_submission
   ```

### Diagnostic Page Tests (Optional but Recommended)

1. **Visit Diagnostic Page**

   - URL: `https://invite.puravida.events/ga-diagnostic.html`

2. **Run Full Diagnostic**

   - Click "Run Full Diagnostic" button
   - All checks should show green ✅
   - If any red ❌, click "Copy Diagnostic Report" and investigate

3. **Send Test Events**
   - Click "Send Test Event"
   - Click "Send Page View"
   - Click "Send Conversion Event"
   - All should show success messages
   - Check GA Real-Time to confirm events received

## Troubleshooting

### If Console Shows Errors

1. **"Measurement ID not found"**

   - Check if env var was available during build
   - Rebuild: `npm run build`
   - Verify in built files: `grep -r "G-VR8NMPGBV5" out/_next/static/chunks/*.js`

2. **"Failed to load GA script"**

   - Check network tab for blocked requests
   - Try different browser/network
   - Disable ad blockers
   - Test in incognito mode

3. **"gtag function not available"**
   - Script may not have loaded yet
   - Wait a few seconds and refresh
   - Check for JavaScript errors

### If No Events in GA Dashboard

1. **Check Real-Time View** (not standard reports)

   - Standard reports have 24-48 hour delay
   - Real-Time should show events immediately

2. **Verify Correct GA Property**

   - Ensure you're viewing the correct property
   - Measurement ID should be G-VR8NMPGBV5

3. **Test with Simple Page**

   - Use `/ga-test.html` which has minimal code
   - If this works, issue is in main app
   - If this doesn't work, issue is with GA setup

4. **Ad Blockers**

   - Disable all ad blockers
   - Test in incognito mode
   - Try different browser

5. **Wait and Monitor**
   - Give it 5-10 minutes for data to flow
   - Real-time can have slight delays
   - Continue navigating site to generate more events

## Success Criteria

✅ **Deployment is successful if:**

1. Console shows GA initialization messages
2. Network requests to GA domains succeed
3. Real-Time view in GA shows active users
4. Page views appear in Real-Time as you navigate
5. Events appear in Real-Time when triggered
6. No JavaScript errors in console
7. `/ga-test.html` page works correctly

## Timeline Expectations

| Timeframe           | What to Expect                    |
| ------------------- | --------------------------------- |
| Immediate (0-5 min) | Console logs, network requests    |
| 5-10 minutes        | Real-Time view showing data       |
| 1-2 hours           | More comprehensive Real-Time data |
| 24-48 hours         | Standard reports populated        |

## Monitoring Plan

### First 24 Hours

- Check Real-Time view every few hours
- Monitor for any error reports from users
- Verify different pages and events work

### First Week

- Check standard reports daily
- Verify event tracking is comprehensive
- Review any anomalies or missing data

### Ongoing

- Weekly check of GA data
- Monthly review of tracking implementation
- Update documentation as needed

## Support Resources

- **Analytics Setup Guide**: `ANALYTICS_SETUP.md`
- **Fixes Summary**: `GA_FIXES_SUMMARY.md`
- **Simple Test Page**: `https://invite.puravida.events/ga-test.html`
- **Diagnostic Tool**: `https://invite.puravida.events/ga-diagnostic.html`
- **GA Dashboard**: https://analytics.google.com/

## Rollback Plan

If major issues occur:

1. **Revert changes**

   ```bash
   git revert HEAD
   ./deploy.sh
   ```

2. **Or restore previous build**

   - Keep a backup of previous `out/` directory
   - Upload previous build to server

3. **Debug offline**
   - Use local test page
   - Fix issues
   - Redeploy when ready

---

**Last Updated**: December 5, 2025
**Deployment By**: [Your Name]
**Status**: Ready for deployment ✅

