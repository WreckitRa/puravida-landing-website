# Event Page Tracking - Comprehensive Analytics

## Overview

The event page (`/event/[id]`) now has comprehensive tracking that captures every user interaction, error, and conversion milestone. This gives product and growth teams complete visibility into user behavior and conversion funnel performance.

## Tracked Events

### 1. **Page Load & Performance**

#### `event_page_loaded`

Triggered when event details successfully load.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title
- `venue_name` - Venue name
- `venue_id` - Venue UUID
- `artist_name` - Main artist name
- `event_date` - Event date/time
- `is_guestlist_open` - Boolean
- `is_guestlist_full` - Boolean
- `guestlist_capacity` - Max capacity
- `guestlist_current_count` - Current registrations
- `capacity_percentage` - Percentage full (0-100)
- `has_video_banner` - Boolean if video banner exists
- `load_time_ms` - Time to load event data

**Use Cases:**

- Monitor page load performance
- Track capacity trends over time
- Identify popular events

#### `event_page_error`

Triggered when event fails to load.

**Parameters:**

- `event_id` - Event UUID
- `error_type` - "event_not_found" or "network_error"
- `error_message` - Error description
- `load_time_ms` - Time until error

**Use Cases:**

- Identify broken event links
- Monitor API health
- Track 404 rates

---

### 2. **User Engagement**

#### `event_scroll_depth`

Triggered at 25%, 50%, 75%, and 100% scroll milestones.

**Parameters:**

- `event_id` - Event UUID
- `depth` - Scroll percentage (25, 50, 75, or 100)

**Use Cases:**

- Measure content engagement
- Identify drop-off points
- A/B test page layouts

#### `event_time_on_page`

Triggered when user leaves the page.

**Parameters:**

- `event_id` - Event UUID
- `time_seconds` - Total time on page
- `form_submitted` - Boolean
- `form_started` - Boolean

**Use Cases:**

- Measure engagement quality
- Correlate time with conversion
- Identify quick exits

#### `event_form_viewed`

Triggered when form enters viewport for first time.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title
- `time_to_view_seconds` - Time from page load to form view

**Use Cases:**

- Measure time to engagement
- Track CTA effectiveness
- Optimize page layout

---

### 3. **Form Interactions**

#### `event_form_started`

Triggered on first field interaction.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title
- `first_field` - Which field was touched first
- `time_to_start_seconds` - Time from page load to form start

**Use Cases:**

- Measure intent to register
- Track form start rate
- Identify friction points

#### `event_field_focus`

Triggered when user focuses a field.

**Parameters:**

- `event_id` - Event UUID
- `field_name` - "first_name", "last_name", or "phone"

**Use Cases:**

- Track field interaction patterns
- Identify confusing fields
- Measure form engagement

#### `event_field_blur`

Triggered when user leaves a field.

**Parameters:**

- `event_id` - Event UUID
- `field_name` - Field name
- `has_value` - Boolean if field has data

**Use Cases:**

- Track incomplete fields
- Measure form abandonment
- Identify problem fields

#### `event_country_code_changed`

Triggered when user changes country code.

**Parameters:**

- `event_id` - Event UUID
- `from_code` - Original code
- `to_code` - New code

**Use Cases:**

- Track international users
- Optimize default country
- Identify user demographics

---

### 4. **Form Validation & Errors**

#### `event_validation_error`

Triggered on form validation failure.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title
- `field` - Field with error
- `error_type` - Error type (e.g., "missing_first_name", "invalid_phone")
- `time_to_error_seconds` - Time from form start to error
- `phone_length` (for phone errors) - Length of invalid phone number

**Use Cases:**

- Identify common validation issues
- Improve error messages
- Reduce form abandonment

#### `event_guestlist_closed_attempt`

Triggered when user tries to register for closed guestlist.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title

**Use Cases:**

- Measure late interest
- Identify events needing capacity increase
- Track registration window effectiveness

#### `event_guestlist_full_attempt`

Triggered when user tries to register for full guestlist.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title
- `capacity` - Max capacity
- `current_count` - Current registrations

**Use Cases:**

- Identify high-demand events
- Optimize capacity planning
- Track waitlist candidates

---

### 5. **Form Submission**

#### `event_guestlist_submit_attempt`

Triggered when user clicks submit button.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title
- `venue_name` - Venue name
- `time_to_submit_seconds` - Time from form start to submit
- `country_code` - Selected country code

**Use Cases:**

- Measure form completion rate
- Track time to conversion
- Identify user segments

#### `event_guestlist_success`

Triggered on successful registration.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title
- `venue_name` - Venue name
- `artist_name` - Artist name
- `already_registered` - Boolean
- `time_to_complete_seconds` - Total form time
- `api_response_time_ms` - API latency
- `has_activation_code` - Boolean
- `country_code` - User's country

**Use Cases:**

- Track conversion rate
- Measure API performance
- Identify returning users
- Analyze user segments

#### `event_guestlist_api_error`

Triggered on API error during registration.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title
- `error_message` - Error description
- `api_response_time_ms` - API latency
- `country_code` - User's country

**Use Cases:**

- Monitor API health
- Track error rates
- Identify systemic issues

#### `event_guestlist_network_error`

Triggered on network error during registration.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title
- `error_message` - Error description
- `country_code` - User's country

**Use Cases:**

- Track connectivity issues
- Identify regional problems
- Monitor user experience

---

### 6. **Post-Registration Actions**

#### `event_download_app_click`

Triggered when user clicks "Download App" button.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title
- `from_state` - "already_registered" or "new_registration"

**Use Cases:**

- Track app download intent
- Measure registration success impact
- Optimize post-registration flow

#### `event_activation_code_copied`

Triggered when user copies activation code.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title

**Use Cases:**

- Track code usage
- Measure activation intent
- Optimize activation flow

#### `event_activation_code_missing`

Triggered when activation code is not provided by API.

**Parameters:**

- `event_id` - Event UUID

**Use Cases:**

- Monitor API issues
- Track system failures
- Alert on missing codes

---

### 7. **CTA Interactions**

#### `event_scroll_to_form`

Triggered when sticky "Join Guest List" button is clicked.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title

**Use Cases:**

- Track sticky button effectiveness
- Measure mobile UX
- Optimize CTA placement

#### `event_submit_button_click`

Triggered when user clicks submit button (before validation).

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title
- `has_first_name` - Boolean
- `has_last_name` - Boolean
- `has_phone` - Boolean

**Use Cases:**

- Track premature submissions
- Identify incomplete forms
- Measure user behavior

---

### 8. **Media & Assets**

#### `event_video_played`

Triggered when video banner starts playing.

**Parameters:**

- `event_id` - Event UUID
- `event_name` - Event title

**Use Cases:**

- Track video engagement
- Measure banner effectiveness
- Optimize media strategy

#### `event_video_error`

Triggered when video fails to load.

**Parameters:**

- `event_id` - Event UUID
- `video_url` - Video URL

**Use Cases:**

- Monitor video hosting
- Track broken assets
- Identify CDN issues

#### `event_image_error`

Triggered when image fails to load.

**Parameters:**

- `event_id` - Event UUID
- `image_url` - Image URL

**Use Cases:**

- Monitor image hosting
- Track broken assets
- Identify CDN issues

---

### 9. **Error States**

#### `event_error_page_displayed`

Triggered when error page is shown.

**Parameters:**

- `event_id` - Event UUID
- `error_message` - Error description

**Use Cases:**

- Track 404 rates
- Monitor user experience
- Identify broken links

#### `event_error_go_home_click`

Triggered when user clicks "Go back home" on error page.

**Parameters:**

- `event_id` - Event UUID

**Use Cases:**

- Track error recovery
- Measure bounce rate
- Optimize error UX

---

## Analytics Dashboards to Build

### Conversion Funnel

1. Page Load → Form Viewed → Form Started → Submit Attempt → Success
2. Drop-off rates at each stage
3. Time at each stage
4. Error rates at each stage

### Performance Metrics

- Page load time (p50, p90, p99)
- API response time
- Error rates by type
- Video/image load success rate

### User Behavior

- Scroll depth distribution
- Time on page distribution
- Form completion time
- Field interaction patterns
- Country code distribution

### Event Performance

- Registrations by event
- Capacity utilization
- Registration velocity (over time)
- Peak registration times
- Guestlist closure impact

### Error Analysis

- Validation errors by field
- API error rates over time
- Network error patterns
- Common error messages
- Error impact on conversion

### Geographic Insights

- Registrations by country code
- Country code change patterns
- Regional error rates
- Geographic time to conversion

---

## Key Growth Metrics

### Primary KPIs

- **Conversion Rate**: (Success / Page Views) × 100
- **Form Start Rate**: (Form Started / Page Views) × 100
- **Form Completion Rate**: (Success / Form Started) × 100
- **Time to Convert**: Median time from page load to success
- **Error Rate**: (Errors / Submit Attempts) × 100

### Secondary KPIs

- **App Download Intent**: Download clicks / Successful registrations
- **Video Engagement**: Video plays / Page views with video
- **Scroll Depth**: % reaching 75%+
- **Sticky CTA Effectiveness**: Sticky clicks / Form starts
- **Returning User Rate**: Already registered / Success events

---

## Recommended Alerts

1. **High Error Rate**: > 10% of submissions failing
2. **Slow Page Load**: > 3 seconds average load time
3. **Capacity Nearing Full**: > 90% capacity on popular events
4. **API Issues**: > 5% API errors in 5-minute window
5. **Video Failures**: > 20% video load failures
6. **Low Conversion**: < 30% conversion rate (investigate friction)

---

## Implementation Notes

- All events automatically include UTM parameters and attribution data (via `lib/attribution.ts`)
- All timestamps are in ISO 8601 format
- All durations are in seconds unless specified otherwise
- All percentages are 0-100 (not 0-1)
- All events follow GA4 naming conventions

---

**Last Updated**: December 5, 2025
**Version**: 1.0
