# Event Page Tracking - Quick Reference

## Top 10 Most Important Events

### 1. 🎯 `event_guestlist_success`
**What**: User successfully registered for guestlist  
**Why**: Primary conversion metric  
**Key Params**: `event_id`, `already_registered`, `time_to_complete_seconds`

### 2. 📄 `event_page_loaded`
**What**: Event page loaded successfully  
**Why**: Entry point for funnel  
**Key Params**: `event_id`, `event_name`, `capacity_percentage`, `load_time_ms`

### 3. 👀 `event_form_viewed`
**What**: Registration form entered viewport  
**Why**: Shows user intent  
**Key Params**: `event_id`, `time_to_view_seconds`

### 4. ✏️ `event_form_started`
**What**: User interacted with first form field  
**Why**: Active engagement indicator  
**Key Params**: `event_id`, `first_field`, `time_to_start_seconds`

### 5. 🚀 `event_guestlist_submit_attempt`
**What**: User clicked submit button  
**Why**: Conversion attempt  
**Key Params**: `event_id`, `time_to_submit_seconds`, `country_code`

### 6. ❌ `event_validation_error`
**What**: Form validation failed  
**Why**: Identifies friction  
**Key Params**: `field`, `error_type`, `time_to_error_seconds`

### 7. 🔴 `event_guestlist_api_error`
**What**: API call failed  
**Why**: System health indicator  
**Key Params**: `error_message`, `api_response_time_ms`

### 8. 📶 `event_guestlist_network_error`
**What**: Network connection failed  
**Why**: Infrastructure issues  
**Key Params**: `error_message`

### 9. 📏 `event_scroll_depth`
**What**: User scrolled to milestone (25/50/75/100%)  
**Why**: Engagement metric  
**Key Params**: `depth`

### 10. ⏱️ `event_time_on_page`
**What**: User left the page  
**Why**: Session quality  
**Key Params**: `time_seconds`, `form_submitted`, `form_started`

---

## Quick Queries for GA4

### Current Conversion Rate
```
Events: event_guestlist_success / event_page_loaded × 100
```

### Form Start Rate
```
Events: event_form_started / event_page_loaded × 100
```

### Form Completion Rate
```
Events: event_guestlist_success / event_form_started × 100
```

### Average Time to Convert
```
Event: event_guestlist_success
Parameter: time_to_complete_seconds
Metric: Average
```

### Error Rate
```
Events: (event_validation_error + event_guestlist_api_error + event_guestlist_network_error) 
        / event_guestlist_submit_attempt × 100
```

### Top Validation Errors
```
Event: event_validation_error
Breakdown by: error_type
```

### Page Load Performance
```
Event: event_page_loaded
Parameter: load_time_ms
Metrics: Average, P50, P90, P99
```

### Popular Events
```
Event: event_guestlist_success
Breakdown by: event_name
Count: Total
```

### Registration by Country
```
Event: event_guestlist_success
Breakdown by: country_code
```

### Capacity Utilization
```
Event: event_page_loaded
Parameter: capacity_percentage
Breakdown by: event_name
```

---

## Debugging Checklist

### ❓ Why is conversion rate low?

1. Check `event_form_viewed` rate - Are users seeing the form?
2. Check `event_form_started` rate - Are they engaging?
3. Check `event_validation_error` - Are errors blocking them?
4. Check `event_time_on_page` - Are they leaving too quickly?
5. Check `event_scroll_depth` - Are they scrolling enough?

### ❓ Why are submissions failing?

1. Check `event_guestlist_api_error` count and `error_message`
2. Check `event_guestlist_network_error` count
3. Check `api_response_time_ms` - Is API slow?
4. Check `event_validation_error` by `error_type`

### ❓ Which fields cause the most problems?

1. `event_validation_error` grouped by `field`
2. `event_field_blur` with `has_value: false`
3. Compare `event_field_focus` to `event_field_blur` per field

### ❓ When do users drop off?

1. Compare counts: page_loaded → form_viewed → form_started → submit_attempt → success
2. Calculate % drop at each stage
3. Check `event_time_on_page` distribution

### ❓ Are videos loading?

1. Check `event_video_played` vs `event_page_loaded` (with video)
2. Check `event_video_error` count
3. Review `video_url` in errors

---

## Event Parameter Quick Lookup

| Parameter | Type | Found In | Description |
|-----------|------|----------|-------------|
| `event_id` | UUID | All events | Event identifier |
| `event_name` | String | Most events | Event title |
| `venue_name` | String | Many events | Venue name |
| `venue_id` | UUID | Some events | Venue identifier |
| `artist_name` | String | Some events | Main artist |
| `capacity_percentage` | Number | page_loaded | % of capacity filled |
| `is_guestlist_open` | Boolean | page_loaded | Can register? |
| `is_guestlist_full` | Boolean | page_loaded | At capacity? |
| `load_time_ms` | Number | page_loaded | Page load duration |
| `api_response_time_ms` | Number | API events | API call duration |
| `time_to_view_seconds` | Number | form_viewed | Time until form seen |
| `time_to_start_seconds` | Number | form_started | Time until form interaction |
| `time_to_complete_seconds` | Number | guestlist_success | Total form time |
| `time_seconds` | Number | time_on_page | Total page time |
| `depth` | Number | scroll_depth | 25, 50, 75, or 100 |
| `field` | String | field events | "first_name", "last_name", "phone" |
| `error_type` | String | validation_error | Type of validation error |
| `error_message` | String | API errors | Error description |
| `country_code` | String | Submissions | Phone country code |
| `already_registered` | Boolean | guestlist_success | Returning user? |
| `has_value` | Boolean | field_blur | Field has data? |
| `first_field` | String | form_started | First field touched |
| `form_submitted` | Boolean | time_on_page | Did they submit? |
| `form_started` | Boolean | time_on_page | Did they start? |
| `from_state` | String | download_app_click | Registration state |

---

## Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | >5% | >10% |
| Page Load Time | >2s | >3s |
| API Response Time | >500ms | >1s |
| Conversion Rate | <40% | <30% |
| Form Start Rate | <60% | <50% |
| Video Error Rate | >5% | >10% |
| Capacity Utilization | >80% | >90% |

---

## Testing Commands

### Check if tracking is loaded
```javascript
// In browser console
window.gtag
window.dataLayer
```

### View all tracked events
```javascript
// In browser console
window.dataLayer.filter(item => Array.isArray(item) && item[0] === 'event')
```

### Manually trigger test event
```javascript
// In browser console
window.gtag('event', 'test_event', { test_param: 'test_value' })
```

---

**Quick Reference Version**: 1.0  
**Last Updated**: December 5, 2025
