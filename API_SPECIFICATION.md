# API Specification for PuraVida Onboarding

This document outlines all API endpoints required for the PuraVida onboarding application.

## Base URL

```
Production & Local: https://api.puravida.events
```

**Note:** The frontend uses the same API URL for both production and local development.

## Authentication

Currently, no authentication is required for the onboarding endpoint. Consider implementing rate limiting and/or CAPTCHA for production.

---

## 1. Submit Onboarding Application

**Endpoint:** `POST /api/onboarding`

**Description:** Submits a completed onboarding application with all user data and marketing attribution.

### Request

**Headers:**

```
Content-Type: application/json
```

**Body Schema:**

```typescript
{
  // Personal Information (Step 1)
  fullName: string;           // Required, min 2 chars, max 100 chars
  gender: string;             // Required, one of: "Male", "Female", "Other", "Prefer not to say"
  age: string;                // Required, numeric string, min 18, max 120
  nationality: string;         // Required, min 2 chars, max 50 chars
  mobile: string;             // Required, phone number format (international format preferred)
  email: string;              // Required, valid email format
  instagram: string;          // Required, Instagram handle (with or without @)

  // Music & Lifestyle Preferences (Step 2)
  musicTaste: string[];       // Required, array of strings, min 1 item
                              // Valid values: "House", "Techno", "Hip-Hop", "R&B", "Electronic",
                              // "Pop", "Jazz", "Latin", "Afrobeats", "Indie", "Rock", "Other"
  musicTasteOther?: string;   // Optional, required if "Other" is in musicTaste, max 100 chars
  favoriteDJ: string;          // Required, min 2 chars, max 100 chars
  favoritePlacesDubai: string[]; // Required, array of strings, min 1 item
                                  // Valid values: "White Dubai", "Cavalli Club", "Zero Gravity",
                                  // "Soho Garden", "MAD", "BLU", "Sky 2.0", "Sass Cafe",
                                  // "Cirque Le Soir", "Base Dubai", "Other"
  favoritePlacesOther?: string;   // Optional, required if "Other" is in favoritePlacesDubai, max 100 chars
  festivalsBeenTo: string;        // Required, min 2 chars, max 500 chars
  festivalsWantToGo: string;     // Required, min 2 chars, max 500 chars
  nightlifeFrequency: string;     // Required, one of: "Daily", "3-4 times a week", "Weekly",
                                  // "2-3 times a month", "Monthly", "Rarely"
  idealNightOut: string;         // Required, min 10 chars, max 1000 chars

  // Marketing Attribution (Automatically captured)
  attribution: {
    // UTM Parameters
    utm_source?: string;          // Optional, max 100 chars
    utm_medium?: string;          // Optional, max 100 chars
    utm_campaign?: string;         // Optional, max 100 chars
    utm_term?: string;             // Optional, max 100 chars
    utm_content?: string;          // Optional, max 100 chars

    // Platform Click IDs
    gclid?: string;                // Optional, Google Ads Click ID
    fbclid?: string;                // Optional, Facebook Click ID
    ttclid?: string;                // Optional, TikTok Click ID
    li_fat_id?: string;             // Optional, LinkedIn Click ID
    msclkid?: string;               // Optional, Microsoft Ads Click ID

    // Custom Parameters
    ref?: string;                   // Optional, custom referral code, max 100 chars

    // Timestamps
    first_touch_timestamp?: string; // Optional, ISO 8601 format
    last_touch_timestamp?: string;  // Optional, ISO 8601 format

    // Tracking
    landing_page?: string;          // Optional, URL path
    referrer?: string;               // Optional, HTTP referrer URL
  };

  // Metadata
  submitted_at: string;            // Required, ISO 8601 timestamp
  time_to_complete_seconds: number; // Required, numeric, time spent on form in seconds
}
```

### Example Request

```json
{
  "fullName": "John Doe",
  "gender": "Male",
  "age": "28",
  "nationality": "UAE",
  "mobile": "+971501234567",
  "email": "john.doe@example.com",
  "instagram": "@johndoe",
  "musicTaste": ["House", "Techno", "Electronic"],
  "musicTasteOther": "",
  "favoriteDJ": "David Guetta",
  "favoritePlacesDubai": ["White Dubai", "Zero Gravity"],
  "favoritePlacesOther": "",
  "festivalsBeenTo": "Ultra Music Festival, Tomorrowland",
  "festivalsWantToGo": "Coachella, Burning Man",
  "nightlifeFrequency": "Weekly",
  "idealNightOut": "VIP table at a rooftop club with great music and good vibes",
  "attribution": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "summer2024",
    "gclid": "ABC123xyz",
    "first_touch_timestamp": "2024-01-15T10:30:00Z",
    "last_touch_timestamp": "2024-01-15T10:35:00Z",
    "landing_page": "/onboarding",
    "referrer": "https://google.com"
  },
  "submitted_at": "2024-01-15T10:35:00Z",
  "time_to_complete_seconds": 300
}
```

### Response

#### Success Response (200 OK)

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

#### Error Response (400 Bad Request)

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
      },
      {
        "field": "age",
        "message": "Age must be at least 18"
      }
    ]
  }
}
```

#### Error Response (429 Too Many Requests)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

#### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An error occurred while processing your request"
  }
}
```

### Validation Rules

#### Personal Information

- `fullName`: Required, 2-100 characters, alphanumeric and spaces only
- `gender`: Required, must be one of the predefined values
- `age`: Required, must be numeric string, between 18-120
- `nationality`: Required, 2-50 characters
- `mobile`: Required, valid phone number (accept international format)
- `email`: Required, valid email format, should be unique (check for duplicates)
- `instagram`: Required, 1-30 characters, alphanumeric, underscores, periods (handle with/without @)

#### Music & Lifestyle

- `musicTaste`: Required, array with at least 1 item, all items must be valid genre values
- `musicTasteOther`: Required if "Other" is in `musicTaste`, max 100 characters
- `favoriteDJ`: Required, 2-100 characters
- `favoritePlacesDubai`: Required, array with at least 1 item, all items must be valid place values
- `favoritePlacesOther`: Required if "Other" is in `favoritePlacesDubai`, max 100 characters
- `festivalsBeenTo`: Required, 2-500 characters
- `festivalsWantToGo`: Required, 2-500 characters
- `nightlifeFrequency`: Required, must be one of the predefined values
- `idealNightOut`: Required, 10-1000 characters

#### Attribution

- All attribution fields are optional
- Timestamps should be validated as ISO 8601 format
- URLs should be validated if provided

### Business Logic

1. **Duplicate Prevention:**

   - Check if email already exists in database
   - If exists, return appropriate error (or handle based on business rules)

2. **Data Storage:**

   - Store all form data
   - Store attribution data for marketing analysis
   - Store metadata (submitted_at, time_to_complete_seconds)

3. **Notifications:**

   - Send confirmation email to applicant
   - Notify admin/team of new application
   - Optional: Send SMS confirmation

4. **Status Management:**
   - Set initial status (e.g., "pending_review", "under_review", "approved", "rejected")
   - Track status changes with timestamps

---

## 2. Health Check (Optional but Recommended)

**Endpoint:** `GET /api/health`

**Description:** Simple health check endpoint to verify API is running.

### Response (200 OK)

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:35:00Z",
  "version": "1.0.0"
}
```

---

## Error Codes

| Code                  | HTTP Status | Description                     |
| --------------------- | ----------- | ------------------------------- |
| `VALIDATION_ERROR`    | 400         | Request validation failed       |
| `DUPLICATE_EMAIL`     | 409         | Email already exists            |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests               |
| `INTERNAL_ERROR`      | 500         | Server error                    |
| `SERVICE_UNAVAILABLE` | 503         | Service temporarily unavailable |

---

## Rate Limiting

**Recommended Limits:**

- 5 requests per minute per IP address
- 20 requests per hour per IP address
- 100 requests per day per IP address

**Headers:**

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1642248000
```

---

## CORS Configuration

Allow requests from:

- Production: `https://invite.puravida.events`
- Development: `http://localhost:3000`

**Headers:**

```
Access-Control-Allow-Origin: https://invite.puravida.events
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

---

## Data Storage Requirements

### Database Schema Suggestions

**Applications Table:**

- `id` (Primary Key, UUID)
- `full_name` (VARCHAR)
- `gender` (ENUM)
- `age` (INTEGER)
- `nationality` (VARCHAR)
- `mobile` (VARCHAR, indexed)
- `email` (VARCHAR, unique, indexed)
- `instagram` (VARCHAR)
- `music_taste` (JSON/ARRAY)
- `music_taste_other` (TEXT, nullable)
- `favorite_dj` (VARCHAR)
- `favorite_places_dubai` (JSON/ARRAY)
- `favorite_places_other` (TEXT, nullable)
- `festivals_been_to` (TEXT)
- `festivals_want_to_go` (TEXT)
- `nightlife_frequency` (VARCHAR)
- `ideal_night_out` (TEXT)
- `status` (ENUM: pending_review, under_review, approved, rejected)
- `submitted_at` (TIMESTAMP)
- `time_to_complete_seconds` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Attribution Table:**

- `id` (Primary Key, UUID)
- `application_id` (Foreign Key to Applications)
- `utm_source` (VARCHAR, nullable)
- `utm_medium` (VARCHAR, nullable)
- `utm_campaign` (VARCHAR, nullable)
- `utm_term` (VARCHAR, nullable)
- `utm_content` (VARCHAR, nullable)
- `gclid` (VARCHAR, nullable)
- `fbclid` (VARCHAR, nullable)
- `ttclid` (VARCHAR, nullable)
- `li_fat_id` (VARCHAR, nullable)
- `msclkid` (VARCHAR, nullable)
- `ref` (VARCHAR, nullable)
- `first_touch_timestamp` (TIMESTAMP, nullable)
- `last_touch_timestamp` (TIMESTAMP, nullable)
- `landing_page` (VARCHAR, nullable)
- `referrer` (VARCHAR, nullable)
- `created_at` (TIMESTAMP)

---

## Security Considerations

1. **Input Sanitization:**

   - Sanitize all user inputs to prevent XSS
   - Validate and escape special characters
   - Use parameterized queries to prevent SQL injection

2. **Email Validation:**

   - Verify email format
   - Consider email verification step (optional)
   - Check for disposable email addresses (optional)

3. **Phone Number Validation:**

   - Validate phone number format
   - Normalize to international format
   - Consider SMS verification (optional)

4. **Rate Limiting:**

   - Implement IP-based rate limiting
   - Consider CAPTCHA for suspicious activity

5. **Data Privacy:**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Comply with GDPR/CCPA requirements
   - Implement data retention policies

---

## Testing Requirements

### Test Cases

1. **Valid Submission:**

   - Submit complete form with all required fields
   - Verify 200 response
   - Verify data is stored correctly

2. **Validation Tests:**

   - Missing required fields
   - Invalid email format
   - Invalid age (below 18, above 120)
   - Invalid phone number
   - Empty arrays for required multi-select fields

3. **Edge Cases:**

   - Very long strings (test max length)
   - Special characters in names
   - Unicode characters
   - Empty strings vs null

4. **Attribution Tests:**

   - With all attribution fields
   - With partial attribution
   - With no attribution

5. **Error Handling:**
   - Database connection errors
   - Timeout scenarios
   - Rate limiting

---

## Integration Example (Frontend)

```typescript
const submitApplication = async (
  formData: FormData,
  attribution: AttributionData
) => {
  const submissionData = {
    ...formData,
    attribution,
    submitted_at: new Date().toISOString(),
    time_to_complete_seconds: timeToComplete,
  };

  try {
    const response = await fetch(`${API_URL}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Submission failed");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Submission error:", error);
    throw error;
  }
};
```

---

## Environment Variables (Backend)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/puravida
DATABASE_SSL=true

# API
API_PORT=3001
API_URL=https://api.puravida.events
NODE_ENV=production

# Email Service (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# SMS Service (optional)
SMS_API_KEY=your-sms-api-key
SMS_FROM_NUMBER=+971501234567

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

---

## Additional Recommendations

1. **Logging:**

   - Log all API requests
   - Log errors with stack traces
   - Log attribution data for analysis

2. **Monitoring:**

   - Set up error tracking (Sentry, etc.)
   - Monitor API response times
   - Set up alerts for high error rates

3. **Analytics:**

   - Track conversion rates by attribution
   - Monitor form completion rates
   - Analyze time to complete metrics

4. **Future Enhancements:**
   - Webhook support for status updates
   - Admin API for managing applications
   - Export functionality for data analysis
   - Email verification endpoint
   - Application status check endpoint

---

## Questions for Backend Developer

1. What database system will be used? (PostgreSQL, MySQL, MongoDB, etc.)
2. What email service will be used for notifications? (SendGrid, AWS SES, etc.)
3. Do you need SMS notifications?
4. What authentication system will be used for admin endpoints?
5. What file storage will be used for any future file uploads?
6. What logging/monitoring tools will be integrated?
7. What is the expected response time SLA?
8. What is the expected uptime SLA?

---

## Contact

For questions or clarifications, please contact the frontend development team.
