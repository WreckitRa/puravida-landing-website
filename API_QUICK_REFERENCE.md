# API Quick Reference

Quick reference for backend developers implementing the PuraVida onboarding API.

## Endpoints

### 1. Submit Onboarding Application

- **Method:** `POST`
- **URL:** `/api/onboarding`
- **Content-Type:** `application/json`

## Required Fields

### Personal Information

- `fullName` (string, required, 2-100 chars)
- `gender` (string, required, enum: "Male", "Female", "Other", "Prefer not to say")
- `age` (string, required, numeric, 18-120)
- `nationality` (string, required, 2-50 chars)
- `mobile` (string, required, phone format)
- `email` (string, required, valid email, unique)
- `instagram` (string, required, 1-30 chars)

### Music & Lifestyle

- `musicTaste` (array, required, min 1 item)
  - Values: "House", "Techno", "Hip-Hop", "R&B", "Electronic", "Pop", "Jazz", "Latin", "Afrobeats", "Indie", "Rock", "Other"
- `musicTasteOther` (string, optional, required if "Other" in musicTaste)
- `favoriteDJ` (string, required, 2-100 chars)
- `favoritePlacesDubai` (array, required, min 1 item)
  - Values: "White Dubai", "Cavalli Club", "Zero Gravity", "Soho Garden", "MAD", "BLU", "Sky 2.0", "Sass Cafe", "Cirque Le Soir", "Base Dubai", "Other"
- `favoritePlacesOther` (string, optional, required if "Other" in favoritePlacesDubai)
- `festivalsBeenTo` (string, required, 2-500 chars)
- `festivalsWantToGo` (string, required, 2-500 chars)
- `nightlifeFrequency` (string, required, enum: "Daily", "3-4 times a week", "Weekly", "2-3 times a month", "Monthly", "Rarely")
- `idealNightOut` (string, required, 10-1000 chars)

### Attribution (All Optional)

- `attribution.utm_source`
- `attribution.utm_medium`
- `attribution.utm_campaign`
- `attribution.utm_term`
- `attribution.utm_content`
- `attribution.gclid` (Google Ads)
- `attribution.fbclid` (Facebook Ads)
- `attribution.ttclid` (TikTok Ads)
- `attribution.li_fat_id` (LinkedIn Ads)
- `attribution.msclkid` (Microsoft Ads)
- `attribution.ref` (Custom referral)
- `attribution.first_touch_timestamp` (ISO 8601)
- `attribution.last_touch_timestamp` (ISO 8601)
- `attribution.landing_page`
- `attribution.referrer`

### Metadata

- `submitted_at` (string, required, ISO 8601)
- `time_to_complete_seconds` (number, required)

## Response Codes

- `200` - Success
- `400` - Validation Error
- `409` - Duplicate Email
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Success Response

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicationId": "app_1234567890",
    "status": "pending_review",
    "submittedAt": "2024-01-15T10:35:00Z"
  }
}
```

## Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Rate Limiting

- 5 requests/minute per IP
- 20 requests/hour per IP
- 100 requests/day per IP

## CORS

- Allow: `https://invite.puravida.events`
- Dev: `http://localhost:3000`

For complete specification, see [API_SPECIFICATION.md](./API_SPECIFICATION.md)
