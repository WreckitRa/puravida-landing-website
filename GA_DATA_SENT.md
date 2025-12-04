# Google Analytics Data Being Sent

This document details all the data your website sends to Google Analytics.

## Overview

Your website sends data to Google Analytics in two main ways:

1. **Page Views** - Automatic tracking on every page load/route change
2. **Custom Events** - User interactions, form submissions, and conversions

---

## 1. Page Views (Automatic)

### When Sent

- On initial page load
- On every route change (Next.js navigation)
- Automatically via `GoogleAnalytics` component

### Data Sent

```javascript
gtag("config", "G-XXXXXXXXXX", {
  page_path: "/", // Current page path
  page_title: undefined, // Optional page title
  send_page_view: true, // Enable automatic page view

  // Attribution data (if available):
  utm_source: "google", // UTM source
  utm_medium: "cpc", // UTM medium
  utm_campaign: "summer2024", // UTM campaign
  utm_term: "dubai+nightlife", // UTM term
  utm_content: "ad1", // UTM content

  // Click IDs (if available):
  gclid: "abc123...", // Google Ads click ID
  fbclid: "xyz789...", // Facebook click ID
  ttclid: "tiktok123...", // TikTok click ID
  li_fat_id: "linkedin123...", // LinkedIn click ID
  msclkid: "ms123...", // Microsoft Ads click ID

  // Custom parameters:
  ref: "invite_code", // Custom referral code
  landing_page: "/", // First page visited
  referrer: "https://google.com", // HTTP referrer
  first_touch_timestamp: "2024-01-01T00:00:00Z", // First visit timestamp
  last_touch_timestamp: "2024-01-01T00:00:00Z", // Last visit timestamp
});
```

### Pages Tracked

- `/` - Homepage
- `/onboarding` - Onboarding flow
- `/ihaveinvite` - Invite page
- `/congratulation` - Success page
- `/privacy-policy` - Privacy policy
- `/terms-conditions` - Terms and conditions
- `/cookie-policy` - Cookie policy

---

## 2. Custom Events

### A. Button Clicks (`onboarding_button_click`)

**When Sent:**

- User clicks any button on the site

**Data Sent:**

```javascript
gtag("event", "onboarding_button_click", {
  button_name: "Check Eligibility", // Button label
  step_number: 0, // Current step (0 = homepage)
  location: "header-cta", // Where button is located
  timestamp: "2024-01-01T00:00:00Z", // ISO timestamp

  // Plus all attribution data (UTM params, click IDs, etc.)
});
```

**Button Examples:**

- "Check Eligibility" (header)
- "I have an invite" (homepage CTA)
- "Request an invite" (homepage CTA)
- "Get Started Now" (how-it-works section)
- "Join Now" (membership cards)
- Navigation links (What is PuraVida, How it works, Benefits, etc.)
- Footer links (Privacy Policy, Terms, Contact Us)

---

### B. Onboarding Step Views (`onboarding_step_view`)

**When Sent:**

- User views a step in the onboarding flow

**Data Sent:**

```javascript
gtag("event", "onboarding_step_view", {
  step_number: 1, // Step number (1-9)
  step_name: "Personal Information", // Step name
  progress_percentage: 11, // Completion % (step/9 * 100)
  timestamp: "2024-01-01T00:00:00Z",

  // Plus all attribution data
});
```

**Steps Tracked:**

1. Personal Information
2. Music Taste
3. Favorite DJ
4. Favorite Places Dubai
5. Festivals Been To
6. Festivals Want To Go
7. Nightlife Frequency
8. Ideal Night Out
9. Review & Submit

---

### C. Step Completion (`onboarding_step_complete`)

**When Sent:**

- User completes a step in onboarding

**Data Sent:**

```javascript
gtag("event", "onboarding_step_complete", {
  step_number: 1,
  step_name: "Personal Information",
  time_spent_seconds: 45, // Time spent on step
  progress_percentage: 11,
  timestamp: "2024-01-01T00:00:00Z",

  // Plus all attribution data
});
```

---

### D. Field Interactions (`onboarding_field_interaction`)

**When Sent:**

- User focuses, blurs, or changes a form field

**Data Sent:**

```javascript
gtag("event", "onboarding_field_interaction", {
  field_name: "fullName", // Field name
  step_number: 1, // Current step
  action: "focus" | "blur" | "change", // Interaction type
  timestamp: "2024-01-01T00:00:00Z",

  // Plus all attribution data
});
```

---

### E. Form Submission (`onboarding_form_submission`)

**When Sent:**

- User submits the onboarding form

**Data Sent:**

```javascript
gtag("event", "onboarding_form_submission", {
  success: true, // Submission success
  time_to_complete_seconds: 180, // Total time to complete form
  timestamp: "2024-01-01T00:00:00Z",

  form_data: {
    has_music_taste: true, // Has music preferences
    has_favorite_dj: true, // Has favorite DJ
    has_favorite_places: true, // Has favorite places
    has_festivals: true, // Has festival info
    music_genres_count: 5, // Number of genres selected
    places_count: 3, // Number of places selected
  },

  // Plus all attribution data
});
```

---

### F. Conversion (`conversion`)

**When Sent:**

- User successfully completes onboarding and is eligible

**Data Sent:**

```javascript
gtag("event", "conversion", {
  event_category: "Onboarding",
  event_label: "Form Completed",
  value: 1, // Conversion value
  time_to_complete_seconds: 180,
  form_completeness: 100, // Form completion percentage
  timestamp: "2024-01-01T00:00:00Z",

  // Plus all attribution data
});
```

---

### G. Selection Events (`onboarding_selection`)

**When Sent:**

- User selects/deselects items in multi-select fields

**Data Sent:**

```javascript
gtag("event", "onboarding_selection", {
  field_name: "musicTaste", // Field name
  value: "House", // Selected value
  step_number: 2, // Current step
  is_selected: true, // Selected or deselected
  timestamp: "2024-01-01T00:00:00Z",

  // Plus all attribution data
});
```

---

### H. Time on Step (`onboarding_time_on_step`)

**When Sent:**

- Periodically tracks time spent on each step

**Data Sent:**

```javascript
gtag("event", "onboarding_time_on_step", {
  step_number: 1,
  step_name: "Personal Information",
  time_spent_seconds: 45,
  timestamp: "2024-01-01T00:00:00Z",

  // Plus all attribution data
});
```

---

### I. Validation Errors (`onboarding_validation_error`)

**When Sent:**

- User encounters a validation error

**Data Sent:**

```javascript
gtag("event", "onboarding_validation_error", {
  step_number: 1,
  field_name: "email",
  error_type: "invalid_format", // Error type
  timestamp: "2024-01-01T00:00:00Z",

  // Plus all attribution data
});
```

---

### J. Scroll Depth (`onboarding_scroll_depth`)

**When Sent:**

- User scrolls to 25%, 50%, 75%, or 100% of a step

**Data Sent:**

```javascript
gtag("event", "onboarding_scroll_depth", {
  step_number: 1,
  scroll_depth: 50, // 25, 50, 75, or 100
  timestamp: "2024-01-01T00:00:00Z",

  // Plus all attribution data
});
```

---

### K. Drop-off (`onboarding_drop_off`)

**When Sent:**

- User leaves onboarding without completing

**Data Sent:**

```javascript
gtag("event", "onboarding_drop_off", {
  step_number: 3, // Last step viewed
  step_name: "Favorite DJ",
  progress_percentage: 33,
  timestamp: "2024-01-01T00:00:00Z",

  // Plus all attribution data
});
```

---

### L. Contact Modal Events

**When Sent:**

- User interacts with contact modal

**Data Sent:**

```javascript
gtag("event", "contact_modal_open", {
  timestamp: "2024-01-01T00:00:00Z",
  // Plus all attribution data
});

gtag("event", "contact_form_submit", {
  success: true,
  timestamp: "2024-01-01T00:00:00Z",
  // Plus all attribution data
});
```

---

## 3. Attribution Data (Included in ALL Events)

Every single event automatically includes attribution data if available:

### UTM Parameters

- `utm_source` - Traffic source (e.g., "google", "facebook")
- `utm_medium` - Marketing medium (e.g., "cpc", "email", "social")
- `utm_campaign` - Campaign name
- `utm_term` - Search term (for paid search)
- `utm_content` - Ad content variant

### Click IDs

- `gclid` - Google Ads click identifier
- `fbclid` - Facebook click identifier
- `ttclid` - TikTok click identifier
- `li_fat_id` - LinkedIn click identifier
- `msclkid` - Microsoft Ads click identifier

### Custom Parameters

- `ref` - Custom referral code
- `landing_page` - First page visited in session
- `referrer` - HTTP referrer URL
- `first_touch_timestamp` - First visit timestamp (ISO format)
- `last_touch_timestamp` - Last visit timestamp (ISO format)

**Note:** Attribution data is stored in localStorage and persists across sessions.

---

## How to Verify Data is Being Sent

### 1. Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab. You should see:

```
✅ Google Analytics initialized: G-XXXXXXXXXX
✅ Google Analytics script loaded successfully
✅ Google Analytics script loaded from googletagmanager.com
✅ Google Analytics configured with Measurement ID: G-XXXXXXXXXX
📊 Page view tracked: /
```

### 2. Check Network Tab

1. Open Developer Tools → Network tab
2. Filter by "gtag" or "analytics"
3. Look for requests to:
   - `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`
   - `https://www.google-analytics.com/g/collect?...`

### 3. Check dataLayer

In the browser console, type:

```javascript
window.dataLayer;
```

You should see an array with all the events that have been sent.

### 4. Use Google Analytics DebugView

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension
2. Enable it
3. Visit your website
4. Go to Google Analytics → Admin → DebugView
5. You should see real-time events appearing

### 5. Test with Manual Event

In the browser console, type:

```javascript
window.gtag("event", "test_event", {
  test_param: "test_value",
});
```

Then check Google Analytics Real-Time → Events to see if it appears.

---

## Common Issues & Solutions

### Issue: Tag installation test passes but no data received

**Possible Causes:**

1. **Wrong Measurement ID**

   - Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` matches your GA4 property
   - Check environment variables in production

2. **Data Processing Delay**

   - GA4 can take 24-48 hours to show data in standard reports
   - Use Real-Time reports to see immediate data

3. **Ad Blockers**

   - Ad blockers can block Google Analytics
   - Test in incognito mode or disable ad blockers

4. **Filters Applied**

   - Check if you have internal traffic filters enabled
   - Your IP might be filtered out

5. **Property Not Active**

   - Ensure your GA4 property is active
   - Check property settings in Google Analytics

6. **Events Not Being Triggered**
   - Check browser console for errors
   - Verify `window.gtag` exists
   - Check if events are being sent to `dataLayer`

### Quick Diagnostic Commands

Run these in your browser console:

```javascript
// Check if GA is loaded
console.log("GA Loaded:", !!window.gtag);
console.log(
  "Measurement ID:",
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "Not accessible in browser"
);

// Check dataLayer
console.log("DataLayer:", window.dataLayer);

// Send test event
if (window.gtag) {
  window.gtag("event", "diagnostic_test", {
    test: true,
    timestamp: new Date().toISOString(),
  });
  console.log("✅ Test event sent!");
} else {
  console.error("❌ GA not loaded!");
}
```

---

## Expected Data Volume

Based on your implementation, you should see:

- **Page Views**: 1 per page load/route change
- **Button Clicks**: Multiple per session (navigation, CTAs, etc.)
- **Onboarding Events**: Only if users go through onboarding
  - Step views: 1 per step viewed
  - Step completions: 1 per step completed
  - Field interactions: Multiple per form
  - Form submission: 1 per form submit
  - Conversion: 1 per successful completion

---

## Next Steps

1. **Verify Measurement ID**: Ensure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly in production
2. **Check Real-Time Reports**: Use GA4 Real-Time to see immediate data
3. **Review DebugView**: Use DebugView to see detailed event data
4. **Test Manually**: Send test events from browser console
5. **Check Filters**: Ensure no filters are blocking your data

If data still isn't appearing after 24-48 hours, check:

- Property settings in Google Analytics
- Data retention settings
- Any custom filters or segments
- Browser console for JavaScript errors







