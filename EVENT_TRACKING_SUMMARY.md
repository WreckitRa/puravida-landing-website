# Event Page Tracking Implementation - Summary

## What Was Added

Comprehensive analytics tracking has been added to the event page (`/event/[id]`) to provide complete visibility into user behavior, conversion funnel, and error patterns.

## Key Features

### 1. **Performance Monitoring**
- Page load time tracking
- API response time tracking
- Asset loading (video/image) success rates
- Network error detection

### 2. **User Journey Tracking**
- Page load → Form view → Form start → Submit → Success
- Time at each stage
- Drop-off points identification
- Scroll depth tracking (25%, 50%, 75%, 100%)
- Time on page measurement

### 3. **Form Interaction Tracking**
- Field focus/blur events
- First field touched
- Time to start form
- Time to complete form
- Incomplete field tracking
- Country code selection changes

### 4. **Validation & Error Tracking**
- Validation errors by field type
- API errors with response times
- Network errors
- Guestlist closed/full attempts
- Missing activation codes

### 5. **Conversion Tracking**
- New registrations
- Already registered users
- Activation code generation
- App download intent
- Post-registration actions

### 6. **Engagement Metrics**
- Video banner plays
- Sticky CTA clicks
- Scroll-to-form actions
- Error page interactions

## Events Tracked (27 Total)

### Core Events (9)
1. `event_page_loaded` - Event details loaded successfully
2. `event_page_error` - Failed to load event
3. `event_form_viewed` - Form entered viewport
4. `event_form_started` - User interacted with first field
5. `event_guestlist_submit_attempt` - User clicked submit
6. `event_guestlist_success` - Registration successful
7. `event_validation_error` - Form validation failed
8. `event_guestlist_api_error` - API error occurred
9. `event_guestlist_network_error` - Network error occurred

### Engagement Events (6)
10. `event_scroll_depth` - User scrolled to milestone
11. `event_time_on_page` - User left page (exit tracking)
12. `event_scroll_to_form` - Sticky button clicked
13. `event_download_app_click` - Download app clicked
14. `event_activation_code_copied` - Code copied to clipboard
15. `event_submit_button_click` - Submit clicked (pre-validation)

### Field Interaction Events (4)
16. `event_field_focus` - Field focused
17. `event_field_blur` - Field blurred
18. `event_country_code_changed` - Country code changed

### Error & Edge Cases (8)
19. `event_guestlist_closed_attempt` - Attempted closed guestlist
20. `event_guestlist_full_attempt` - Attempted full guestlist
21. `event_activation_code_missing` - API didn't provide code
22. `event_video_error` - Video failed to load
23. `event_image_error` - Image failed to load
24. `event_error_page_displayed` - Error state shown
25. `event_error_go_home_click` - User clicked "go home"
26. `event_video_played` - Video started playing

## Data Captured

Every event automatically includes:
- Event ID & Event Name
- Venue information
- Artist information
- UTM parameters (via attribution system)
- Referrer information
- Landing page
- Timestamps
- User's country code (where applicable)

## Key Metrics You Can Now Track

### Conversion Funnel
```
Page Views
    ↓ (% viewed form)
Form Views
    ↓ (% started form)
Form Starts
    ↓ (% submitted)
Submit Attempts
    ↓ (% successful)
Successful Registrations
    ↓ (% downloaded app)
App Downloads
```

### Performance KPIs
- **Page Load Time**: Average, P50, P90, P99
- **API Response Time**: Average, P50, P90, P99
- **Error Rate**: % of submissions that fail
- **Success Rate**: % of submissions that succeed

### Behavioral Insights
- **Time to Form**: How long before users start the form
- **Time to Complete**: How long users take to fill form
- **Field Completion**: Which fields are abandoned
- **Scroll Engagement**: How far users scroll
- **Country Distribution**: Where users are from

### Event Performance
- **Capacity Tracking**: Current vs. max capacity over time
- **Registration Velocity**: Registrations per hour/day
- **Peak Times**: When most registrations happen
- **Popular Events**: Which events get most registrations

## How to Use This Data

### In Google Analytics Real-Time

1. **Go to Real-Time → Events**
2. **Look for these event names** (they start with `event_`):
   - `event_page_loaded` - Page views
   - `event_guestlist_success` - Conversions
   - `event_validation_error` - Form errors

3. **Check event parameters** (click on event name):
   - See all the metadata we're capturing
   - Filter by specific events, venues, artists

### Creating Custom Reports

#### Conversion Funnel Report
```
1. Count of event_page_loaded
2. Count of event_form_viewed
3. Count of event_form_started
4. Count of event_guestlist_submit_attempt
5. Count of event_guestlist_success

Calculate drop-off at each stage
```

#### Performance Report
```
event_page_loaded:
  - Average load_time_ms
  - P90 load_time_ms

event_guestlist_success:
  - Average api_response_time_ms
  - Average time_to_complete_seconds
```

#### Error Report
```
Count by event type:
  - event_validation_error (by error_type)
  - event_guestlist_api_error
  - event_guestlist_network_error
  - event_video_error
  - event_image_error
```

#### Engagement Report
```
event_scroll_depth:
  - % reaching 25%, 50%, 75%, 100%

event_time_on_page:
  - Average time_seconds
  - Segment by form_submitted

event_field_focus:
  - Most focused fields
  - Field interaction order
```

## Quick Debugging

### Issue: Low Conversion Rate

**Check these events:**
1. `event_validation_error` - Are users hitting validation errors?
2. `event_field_blur` with `has_value: false` - Are they abandoning fields?
3. `event_form_started` vs `event_guestlist_submit_attempt` - Drop-off in form?
4. `event_guestlist_api_error` - API issues?

### Issue: High Error Rate

**Check these events:**
1. `event_guestlist_api_error` - What's the `error_message`?
2. `event_guestlist_network_error` - Network problems?
3. `event_validation_error` - What `error_type` is most common?
4. Check `api_response_time_ms` - Is API slow?

### Issue: Users Not Finding Form

**Check these events:**
1. `event_form_viewed` - What % of page loads result in form views?
2. `event_scroll_depth` - Are users scrolling?
3. `event_scroll_to_form` - Is sticky button working?
4. `event_time_on_page` - Are they leaving quickly?

### Issue: Event Not Loading

**Check these events:**
1. `event_page_error` - What's the `error_type`?
2. `event_error_page_displayed` - How often is this shown?
3. Check `load_time_ms` in successful loads - Is it slow?

## Alert Recommendations

Set up alerts for:

1. **High Error Rate** (>10%):
   ```
   Count of event_guestlist_api_error + event_guestlist_network_error
   / Count of event_guestlist_submit_attempt
   > 0.10
   ```

2. **Slow Page Load** (>3s):
   ```
   Average load_time_ms in event_page_loaded > 3000
   ```

3. **Capacity Nearly Full** (>90%):
   ```
   event_page_loaded.capacity_percentage > 90
   ```

4. **Validation Issues** (>20%):
   ```
   Count of event_validation_error
   / Count of event_guestlist_submit_attempt
   > 0.20
   ```

5. **Asset Loading Failures** (>10%):
   ```
   Count of event_video_error + event_image_error
   / Count of event_page_loaded
   > 0.10
   ```

## Testing

To test tracking locally:

1. Start dev server: `npm run dev`
2. Open browser console (F12)
3. Visit an event page
4. You should see console logs:
   ```
   ✅ Google Analytics dataLayer initialized
   ✅ Google Analytics script loaded
   ✅ Google Analytics configured: G-VR8NMPGBV5
   📊 Page view tracked: /event/[id]
   ```

5. Interact with the page:
   - Scroll down → `event_scroll_depth`
   - Focus a field → `event_form_started`, `event_field_focus`
   - Fill form → Multiple `event_field_blur` events
   - Submit form → `event_guestlist_submit_attempt`, then success/error

6. Check dataLayer:
   ```javascript
   console.log(window.dataLayer)
   ```

## Production Verification

After deployment:

1. Visit production event page
2. Open GA Real-Time view
3. You should see yourself as active user
4. Events should appear in Real-Time → Events
5. Click on events to see all parameters

## Files Modified

- `app/event/[id]/EventPageClient.tsx` - Added all tracking logic
- `lib/analytics.ts` - Already had utility functions (no changes needed)
- `EVENT_PAGE_TRACKING.md` - Comprehensive documentation
- `EVENT_TRACKING_SUMMARY.md` - This file

## Next Steps

1. **Deploy** the changes
2. **Monitor** Real-Time events for first 24 hours
3. **Create** custom reports in GA4
4. **Set up** alerts for critical metrics
5. **Review** data weekly to identify optimization opportunities

## Key Insights You'll Gain

### Week 1
- Conversion rate baseline
- Most common errors
- Average time to convert
- Popular events

### Week 2-4
- Conversion trends
- A/B test opportunities
- Capacity optimization needs
- API performance patterns

### Month 2+
- Seasonal patterns
- User segment behaviors
- Optimal pricing strategies
- Marketing channel effectiveness

---

**Implementation Date**: December 5, 2025  
**Status**: ✅ Complete & Tested  
**Build Status**: ✅ Passing
