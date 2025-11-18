# UTM & Marketing Parameter Tracking

This onboarding flow automatically captures and stores all UTM parameters and marketing attribution data from your marketing channels.

## Supported Parameters

### UTM Parameters (Standard)

- `utm_source` - The source of traffic (e.g., google, facebook, newsletter)
- `utm_medium` - The marketing medium (e.g., cpc, email, social)
- `utm_campaign` - The campaign name (e.g., summer2024, launch)
- `utm_term` - The paid search keyword
- `utm_content` - The specific ad/content variation

### Platform-Specific Click IDs

- `gclid` - Google Ads Click ID
- `fbclid` - Facebook Click ID
- `ttclid` - TikTok Click ID
- `li_fat_id` - LinkedIn Click ID
- `msclkid` - Microsoft Ads Click ID

### Custom Parameters

- `ref` - Custom referral code/identifier

## How It Works

1. **Automatic Capture**: Parameters are automatically captured from the URL when users land on the page
2. **Persistent Storage**: Attribution data is stored in localStorage and persists across the entire onboarding flow
3. **First Touch Attribution**: First touch timestamp is recorded when user first arrives
4. **Last Touch Attribution**: Last touch timestamp is updated if user returns with new parameters
5. **Analytics Integration**: All attribution data is automatically included in every Google Analytics event
6. **Form Submission**: Attribution is included in the final form submission data

## Example URLs

### Google Ads

```
https://yoursite.com/onboarding?utm_source=google&utm_medium=cpc&utm_campaign=summer2024&gclid=ABC123
```

### Facebook Ads

```
https://yoursite.com/onboarding?utm_source=facebook&utm_medium=social&utm_campaign=launch&fbclid=XYZ789
```

### Email Campaign

```
https://yoursite.com/onboarding?utm_source=newsletter&utm_medium=email&utm_campaign=welcome&utm_content=button1
```

### Instagram Story

```
https://yoursite.com/onboarding?utm_source=instagram&utm_medium=social&utm_campaign=story&ref=influencer_john
```

### TikTok Ads

```
https://yoursite.com/onboarding?utm_source=tiktok&utm_medium=cpc&utm_campaign=genz&ttclid=TT456
```

### Custom Referral

```
https://yoursite.com/onboarding?ref=partner_abc&utm_source=partner&utm_medium=referral
```

## What Gets Tracked

### In Google Analytics

Every event automatically includes:

- All UTM parameters
- All click IDs
- Referrer information
- Landing page
- First touch timestamp
- Last touch timestamp

### In Form Submission

When the form is submitted, the data includes:

```json
{
  "formData": { ... },
  "attribution": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "summer2024",
    "gclid": "ABC123",
    "first_touch_timestamp": "2024-01-15T10:30:00Z",
    "last_touch_timestamp": "2024-01-15T10:30:00Z",
    "landing_page": "/onboarding",
    "referrer": "https://google.com"
  },
  "submitted_at": "2024-01-15T10:35:00Z",
  "time_to_complete_seconds": 300
}
```

## Analytics Reports

### In Google Analytics 4

1. **Acquisition Report**

   - Go to Reports > Acquisition
   - See traffic by source/medium/campaign
   - Filter by UTM parameters

2. **Custom Dimensions** (Recommended Setup)

   - Create custom dimensions for:
     - UTM Source
     - UTM Medium
     - UTM Campaign
     - Referrer
     - Landing Page

3. **Conversion by Channel**

   - Create a custom report showing:
     - Conversions by utm_source
     - Conversions by utm_medium
     - Conversions by utm_campaign
     - ROI by channel

4. **Funnel Analysis by Channel**
   - Compare completion rates by:
     - Traffic source
     - Campaign
     - Medium

## Best Practices

### 1. Consistent Naming

Use consistent naming conventions:

- **Sources**: google, facebook, instagram, email, direct
- **Mediums**: cpc, social, email, organic, referral
- **Campaigns**: Use descriptive names (e.g., summer2024_launch)

### 2. Track Everything

Add UTM parameters to:

- Paid ads (Google, Facebook, TikTok, LinkedIn)
- Email campaigns
- Social media posts
- Partner links
- Influencer links
- QR codes

### 3. Use Campaign Builder

Create a UTM builder tool for your team:

```
https://yoursite.com/onboarding?
  utm_source={{source}}&
  utm_medium={{medium}}&
  utm_campaign={{campaign}}&
  utm_content={{content}}
```

### 4. Track Content Variations

Use `utm_content` to A/B test:

- Different ad creatives
- Different CTA buttons
- Different landing page versions

### 5. Monitor Attribution

- Check which channels drive the most conversions
- Identify high-value traffic sources
- Optimize spend based on ROI

## Testing

### Test Your UTM Parameters

1. **Add parameters to URL**:

   ```
   http://localhost:3000/onboarding?utm_source=test&utm_medium=test&utm_campaign=test
   ```

2. **Check browser console**:

   - Should see: `Attribution data: { utm_source: 'test', ... }`

3. **Check localStorage**:

   - Open DevTools > Application > Local Storage
   - Look for `puravida_attribution` key

4. **Check Google Analytics**:
   - Use GA4 DebugView for real-time testing
   - Verify events include UTM parameters

## Data Retention

- Attribution data is stored in localStorage
- Persists across browser sessions
- Survives page refreshes
- Cleared only when user clears browser data

## Privacy

- No PII (Personally Identifiable Information) in attribution
- Only marketing parameters are stored
- Complies with GDPR/CCPA
- Can be cleared by user clearing browser data

## Troubleshooting

### Parameters not being captured?

1. Check URL format (must be query parameters)
2. Check browser console for errors
3. Verify localStorage is enabled
4. Check if parameters are being stripped by redirects

### Attribution not in analytics?

1. Verify GA4 is initialized
2. Check GA4 DebugView
3. Wait 24-48 hours for data to appear in reports
4. Verify Measurement ID is correct

### Need to clear attribution?

```javascript
// In browser console:
localStorage.removeItem("puravida_attribution");
```

## Integration with Backend

When submitting form data, attribution is automatically included:

```typescript
// Example API endpoint
POST /api/onboarding
{
  "fullName": "John Doe",
  "email": "john@example.com",
  // ... other form fields
  "attribution": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "summer2024",
    "gclid": "ABC123",
    "first_touch_timestamp": "2024-01-15T10:30:00Z",
    "last_touch_timestamp": "2024-01-15T10:30:00Z"
  },
  "submitted_at": "2024-01-15T10:35:00Z"
}
```

Store this data in your CRM/database to:

- Track ROI by channel
- Attribute conversions correctly
- Optimize marketing spend
- Build customer journey maps
