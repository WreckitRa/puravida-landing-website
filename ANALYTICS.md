# Analytics Setup Guide

This project includes comprehensive analytics tracking for growth optimization with full UTM parameter and marketing attribution tracking.

## Setup

1. **Get Google Analytics 4 Measurement ID**

   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new property or use an existing one
   - Copy your Measurement ID (format: `G-XXXXXXXXXX`)

2. **Add Environment Variable**
   - Create a `.env.local` file in the root directory
   - Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
   - Restart your development server

## Attribution Tracking

All events automatically include marketing attribution data:

- **UTM Parameters**: utm_source, utm_medium, utm_campaign, utm_term, utm_content
- **Click IDs**: gclid (Google), fbclid (Facebook), ttclid (TikTok), li_fat_id (LinkedIn), msclkid (Microsoft)
- **Custom**: ref parameter
- **Timestamps**: first_touch_timestamp, last_touch_timestamp
- **Referrer**: Landing page and referrer URL

See [UTM_TRACKING.md](./UTM_TRACKING.md) for complete documentation.

## Tracked Events

### 1. Page Views

- **Event**: Automatic page view tracking
- **Trigger**: On route change
- **Data**: Page path, page title, **all attribution parameters**

### 2. Step Views

- **Event**: `onboarding_step_view`
- **Trigger**: When user views a step
- **Data**:
  - `step_number`: Current step (0-10)
  - `step_name`: Name of the step
  - `progress_percentage`: Completion percentage

### 3. Step Completion

- **Event**: `onboarding_step_complete`
- **Trigger**: When user completes a step
- **Data**:
  - `step_number`: Completed step
  - `step_name`: Name of the step
  - `time_spent_seconds`: Time spent on step
  - `progress_percentage`: Completion percentage

### 4. Button Clicks

- **Event**: `onboarding_button_click`
- **Trigger**: When user clicks any button
- **Data**:
  - `button_name`: Name of the button
  - `step_number`: Current step
  - `location`: Where the button is located

### 5. Field Interactions

- **Event**: `onboarding_field_interaction`
- **Trigger**: When user interacts with form fields
- **Data**:
  - `field_name`: Name of the field
  - `step_number`: Current step
  - `action`: 'focus', 'blur', or 'change'

### 6. Selections (Multi-select)

- **Event**: `onboarding_selection`
- **Trigger**: When user selects/deselects options
- **Data**:
  - `field_name`: Field name (e.g., 'musicTaste')
  - `value`: Selected value
  - `step_number`: Current step
  - `is_selected`: Boolean

### 7. Form Submission

- **Event**: `onboarding_form_submission`
- **Trigger**: When form is submitted
- **Data**:
  - `success`: Boolean
  - `time_to_complete_seconds`: Total time
  - `form_data`: Aggregated form data (anonymized)

### 8. Conversion

- **Event**: `conversion`
- **Trigger**: When form is successfully submitted
- **Data**:
  - `event_category`: 'Onboarding'
  - `event_label`: 'Form Completed'
  - `value`: 1
  - `time_to_complete_seconds`: Total time
  - `form_completeness`: Percentage of fields filled

### 9. Time on Step

- **Event**: `onboarding_time_on_step`
- **Trigger**: When user leaves a step
- **Data**:
  - `step_number`: Step number
  - `step_name`: Step name
  - `time_spent_seconds`: Time spent

### 10. Validation Errors

- **Event**: `onboarding_validation_error`
- **Trigger**: When validation fails
- **Data**:
  - `step_number`: Current step
  - `field_name`: Field with error
  - `error_type`: Type of error

## Key Metrics to Track

### Funnel Analysis

1. **Hero → Step 1**: Initial engagement
2. **Step 1 → Step 2**: Personal info completion
3. **Step 2-8**: Vibe questions completion rate
4. **Step 9 → Step 10**: Final submission rate

### Drop-off Points

- Track where users abandon the form
- Identify problematic steps
- Measure time spent before drop-off

### Conversion Rate

- Total visitors → Form completions
- Step-by-step conversion rates
- Time to conversion

### User Behavior

- Most selected music genres
- Most selected places
- Average time per step
- Field interaction patterns

## Google Analytics Reports

### Custom Reports to Create

1. **Onboarding Funnel**

   - Create a funnel visualization
   - Steps: Hero → Step 1 → Step 2 → ... → Conversion

2. **Step Performance**

   - Average time per step
   - Completion rates
   - Drop-off rates

3. **Field Analysis**

   - Most interacted fields
   - Fields with most errors
   - Time spent per field

4. **Selection Patterns**
   - Most popular music genres
   - Most popular places
   - Selection counts

## Advanced Tracking

### Heatmaps (Optional)

Consider adding:

- Hotjar
- Microsoft Clarity
- FullStory

### A/B Testing

Track variant performance:

- Different button text
- Different step orders
- Different question formats

## Privacy & Compliance

- All tracking is anonymized
- No PII (Personally Identifiable Information) is sent to GA
- Form data is aggregated before sending
- Complies with GDPR/CCPA requirements

## Troubleshooting

### Analytics not working?

1. Check `.env.local` has `NEXT_PUBLIC_GA_MEASUREMENT_ID`
2. Verify Measurement ID format (starts with `G-`)
3. Check browser console for errors
4. Verify GA4 property is set up correctly

### Events not showing?

1. Use GA4 DebugView for real-time testing
2. Check Network tab for gtag requests
3. Verify events in GA4 Events report (may take 24-48 hours)

## Next Steps

1. Set up conversion goals in GA4
2. Create custom dashboards
3. Set up automated reports
4. Configure alerts for drop-offs
5. Integrate with your CRM/backend
