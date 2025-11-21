# Marketing Channels Guide - Invite Links with Attribution

This guide shows you how to create tracked invite links for different marketing channels (paid ads, Instagram stories, etc.) so you can measure which channels drive the most sign-ups.

## How It Works

Your invite system supports **UTM parameters** and **click IDs** that automatically track:

- Which marketing channel brought the user
- Which campaign they came from
- All attribution data is stored and sent with form submissions

## Creating Tracked Invite Links

### Basic Format

Your base invite link format is:

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE
```

To track marketing channels, add UTM parameters:

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE&utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN
```

### Step-by-Step: Creating a Tracked Link

1. **Get the base invite link** from your app or dashboard

   - Example: `https://invite.puravida.events/?invite=Sm9obiBEb2U=|OTcxNTU1NTEyMzQ1Ng==`

2. **Add UTM parameters** for the marketing channel

   - Example for Instagram Story: `&utm_source=instagram&utm_medium=story&utm_campaign=launch_2024`

3. **Final tracked link:**
   ```
   https://invite.puravida.events/?invite=Sm9obiBEb2U=|OTcxNTU1NTEyMzQ1Ng==&utm_source=instagram&utm_medium=story&utm_campaign=launch_2024
   ```

## Examples by Marketing Channel

### 1. Instagram Stories

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE&utm_source=instagram&utm_medium=story&utm_campaign=launch_2024
```

**Variations:**

- Different campaigns: `&utm_campaign=summer_party`
- Different content: `&utm_content=story_1` or `&utm_content=story_2`

### 2. Instagram Posts

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE&utm_source=instagram&utm_medium=post&utm_campaign=launch_2024
```

### 3. Instagram Reels

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE&utm_source=instagram&utm_medium=reel&utm_campaign=launch_2024
```

### 4. Facebook Paid Ads

Facebook automatically adds `fbclid`, but you should also add UTM parameters:

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE&utm_source=facebook&utm_medium=cpc&utm_campaign=summer_2024&utm_content=ad_variant_1
```

**In Facebook Ads Manager:**

1. Create your ad
2. In the "Website URL" field, paste your tracked invite link
3. Facebook will automatically append `fbclid=...` to track clicks

### 5. Google Ads

Google automatically adds `gclid`, but add UTM parameters too:

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE&utm_source=google&utm_medium=cpc&utm_campaign=summer_2024&utm_term=dubai_nightlife
```

**In Google Ads:**

1. Create your ad
2. Use the "Final URL" field with your tracked invite link
3. Google will automatically append `gclid=...` to track clicks

### 6. TikTok Ads

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE&utm_source=tiktok&utm_medium=cpc&utm_campaign=genz_2024
```

TikTok automatically adds `ttclid=...` to track clicks.

### 7. LinkedIn Ads

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE&utm_source=linkedin&utm_medium=cpc&utm_campaign=professional_2024
```

LinkedIn automatically adds `li_fat_id=...` to track clicks.

### 8. Email Campaigns

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE&utm_source=email&utm_medium=email&utm_campaign=newsletter_june&utm_content=cta_button
```

### 9. WhatsApp/SMS

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE&utm_source=whatsapp&utm_medium=message&utm_campaign=referral_program
```

### 10. Partner/Influencer Links

```
https://invite.puravida.events/?invite=BASE64_NAME|BASE64_PHONE&utm_source=partner&utm_medium=referral&utm_campaign=influencer_name&ref=influencer_123
```

## UTM Parameter Guide

### Required Parameters

- **utm_source**: Where the traffic comes from
  - Examples: `instagram`, `facebook`, `google`, `tiktok`, `email`, `whatsapp`
- **utm_medium**: The type of traffic
  - Examples: `cpc` (paid ads), `story`, `post`, `reel`, `email`, `message`, `referral`
- **utm_campaign**: The specific campaign name
  - Examples: `launch_2024`, `summer_party`, `genz_2024`, `newsletter_june`

### Optional Parameters

- **utm_content**: Differentiates similar content/links
  - Examples: `story_1`, `story_2`, `ad_variant_a`, `cta_button`
- **utm_term**: Keywords (mainly for search ads)
  - Examples: `dubai_nightlife`, `vip_club`, `exclusive_membership`

## Quick Reference: Common Sources & Mediums

| Channel         | utm_source  | utm_medium | Example Campaign    |
| --------------- | ----------- | ---------- | ------------------- |
| Instagram Story | `instagram` | `story`    | `launch_2024`       |
| Instagram Post  | `instagram` | `post`     | `launch_2024`       |
| Instagram Reel  | `instagram` | `reel`     | `launch_2024`       |
| Facebook Ads    | `facebook`  | `cpc`      | `summer_2024`       |
| Google Ads      | `google`    | `cpc`      | `summer_2024`       |
| TikTok Ads      | `tiktok`    | `cpc`      | `genz_2024`         |
| LinkedIn Ads    | `linkedin`  | `cpc`      | `professional_2024` |
| Email           | `email`     | `email`    | `newsletter_june`   |
| WhatsApp        | `whatsapp`  | `message`  | `referral_program`  |
| SMS             | `sms`       | `message`  | `referral_program`  |
| Partner         | `partner`   | `referral` | `influencer_name`   |

## Best Practices

### 1. Consistent Naming

- Use lowercase for all UTM values
- Use underscores instead of spaces: `summer_2024` not `summer 2024`
- Keep campaign names descriptive but short

### 2. Track Everything

- Even if a platform adds click IDs automatically, still add UTM parameters
- This gives you better reporting in Google Analytics

### 3. Use utm_content for A/B Testing

- Test different ad creatives: `utm_content=ad_variant_a` vs `utm_content=ad_variant_b`
- Test different story designs: `utm_content=story_design_1` vs `utm_content=story_design_2`

### 4. Document Your Links

Keep a spreadsheet with:

- Link URL
- Marketing channel
- Campaign name
- Date created
- Expected audience

## How to View Results

### In Google Analytics

1. Go to **Reports > Acquisition > Traffic acquisition**
2. Filter by **Session source/medium** to see which channels drove traffic
3. Create custom reports for:
   - Conversions by `utm_source`
   - Conversions by `utm_campaign`
   - Conversions by `utm_medium`

### In Your Backend

All attribution data is automatically included in form submissions:

```json
{
  "formData": { ... },
  "attribution": {
    "utm_source": "instagram",
    "utm_medium": "story",
    "utm_campaign": "launch_2024",
    "first_touch_timestamp": "2024-01-15T10:30:00Z",
    "last_touch_timestamp": "2024-01-15T10:30:00Z",
    "landing_page": "/",
    "referrer": "https://instagram.com"
  }
}
```

## URL Shortener (Optional)

If your links are too long, you can use a URL shortener that preserves UTM parameters:

- **Bitly**: Preserves UTM parameters
- **Rebrandly**: Custom branded short links
- **TinyURL**: Basic shortening

**Important**: Make sure the shortener preserves all URL parameters!

## Example: Complete Marketing Campaign

Let's say you're running a summer launch campaign:

1. **Instagram Story 1** (Day 1):

   ```
   https://invite.puravida.events/?invite=...&utm_source=instagram&utm_medium=story&utm_campaign=summer_launch&utm_content=day1
   ```

2. **Instagram Story 2** (Day 2):

   ```
   https://invite.puravida.events/?invite=...&utm_source=instagram&utm_medium=story&utm_campaign=summer_launch&utm_content=day2
   ```

3. **Facebook Ad**:

   ```
   https://invite.puravida.events/?invite=...&utm_source=facebook&utm_medium=cpc&utm_campaign=summer_launch&utm_content=ad_creative_a
   ```

4. **Google Ad**:
   ```
   https://invite.puravida.events/?invite=...&utm_source=google&utm_medium=cpc&utm_campaign=summer_launch&utm_term=dubai_nightlife
   ```

All of these will be tracked separately in analytics, so you can see which performs best!

## Need Help?

- Check `UTM_TRACKING.md` for technical details
- Check `ANALYTICS.md` for analytics setup
- Check `ANALYTICS_VERIFICATION.md` to verify tracking is working
