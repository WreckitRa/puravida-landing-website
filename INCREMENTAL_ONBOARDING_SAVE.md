# Incremental Onboarding Data Save

This document explains the incremental save feature that saves onboarding data to the database on every step, ensuring data is captured even if users abandon the flow.

## Overview

Previously, onboarding data was only saved:

1. When step 1 was completed (user creation via `createManualUser`)
2. When the entire form was submitted (via `submitOnboarding`)

Now, data is saved **incrementally after each step**, so you can recover partial data even if users abandon the onboarding flow.

## Implementation

### 1. New API Endpoint

**Endpoint:** `POST /api/onboarding/partial`

**Function:** `savePartialOnboarding()` in `lib/api.ts`

**Purpose:** Saves partial onboarding data with step tracking.

**Data Structure:**

```typescript
{
  // User identifier
  user_id?: number | string;  // From step 1 user creation
  phone?: string;              // Phone number
  country_code?: string;       // Country code

  // Step tracking
  current_step: number;        // Current step (0-9)
  step_name: string;           // Human-readable step name

  // Partial form data (only completed fields)
  fullName?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  age?: number;
  nationality?: string;
  email?: string;
  instagram?: string;
  musicTaste?: string[];
  musicTasteOther?: string;
  favoriteDJ?: string;
  favoritePlacesDubai?: string[];
  favoritePlacesOther?: string;
  festivalsBeenTo?: string;
  festivalsWantToGo?: string;
  nightlifeFrequency?: string;
  idealNightOut?: string;

  // Attribution data
  attribution?: { ... };

  // Metadata
  updated_at: string;           // ISO timestamp
  time_spent_seconds?: number;  // Time spent on current step
}
```

### 2. When Data is Saved

Data is automatically saved in the following scenarios:

#### A. After Each Step Completion

- When user clicks "Continue" and moves to the next step
- Saves all data collected up to that point
- Includes current step number and step name
- Tracks time spent on the step

#### B. When User Leaves the Page

- Uses `beforeunload` event listener
- Saves current progress even if user closes browser/tab
- Uses `fetch` with `keepalive: true` for reliable delivery
- Only saves if user is past step 0 (hero screen)

### 3. Data Collection Strategy

- **Step 0 (Hero):** No data saved (just intro screen)
- **Step 1 (Personal Info):** Saves name, gender, age, nationality, phone, email, Instagram
- **Step 2 (Music Taste):** Saves music preferences
- **Step 3 (Favorite DJ):** Saves favorite DJ
- **Step 4 (Favorite Places):** Saves favorite places in Dubai
- **Step 5 (Festivals Been To):** Saves festivals attended
- **Step 6 (Festivals Want To Go):** Saves festivals interested in
- **Step 7 (Nightlife Frequency):** Saves nightlife frequency
- **Step 8 (Ideal Night Out):** Saves ideal night out description
- **Step 9+:** Final steps (review, payment, etc.)

### 4. User Identification

The system uses multiple identifiers to track users:

1. **Primary:** `user_id` (from step 1 user creation)
2. **Fallback:** `phone` + `country_code` (if user_id not available yet)

This ensures data can be linked even if:

- User abandons before completing step 1
- User creation fails but phone number is entered
- User returns later and completes onboarding

## Backend Requirements

You need to implement the backend endpoint:

**Endpoint:** `POST /api/onboarding/partial`

**Expected Behavior:**

1. Accept partial onboarding data
2. Store/update data in database
3. Track `current_step` to know where user left off
4. Merge with existing data (don't overwrite completed fields)
5. Return success response

**Database Schema Suggestions:**

- Store partial data in a separate table (e.g., `onboarding_progress`)
- Or update existing user record with partial data
- Track `current_step` to know where user abandoned
- Store `updated_at` timestamp for each save

**Example Backend Logic:**

```php
// Pseudo-code example
function savePartialOnboarding($data) {
    // Find or create user record
    $user = findUserByPhoneOrId($data['phone'], $data['user_id']);

    // Update onboarding progress
    $user->onboarding_step = $data['current_step'];
    $user->onboarding_step_name = $data['step_name'];
    $user->onboarding_updated_at = $data['updated_at'];

    // Merge partial data (only update fields that are provided)
    if (isset($data['fullName'])) $user->full_name = $data['fullName'];
    if (isset($data['email'])) $user->email = $data['email'];
    // ... etc for all fields

    // Save attribution data
    if (isset($data['attribution'])) {
        $user->attribution = json_encode($data['attribution']);
    }

    $user->save();

    return ['success' => true, 'data' => ['user_id' => $user->id]];
}
```

## Benefits

1. **Data Recovery:** Never lose user data, even if they abandon the flow
2. **Analytics:** Track where users drop off in the onboarding process
3. **User Recovery:** Can follow up with users who didn't complete onboarding
4. **A/B Testing:** Compare completion rates across different steps
5. **Support:** Help users who had issues completing onboarding

## Error Handling

- **Silent Failures:** Save failures don't interrupt user flow
- **Non-Blocking:** Saves happen asynchronously (fire and forget)
- **Graceful Degradation:** If save fails, user can still continue
- **Logging:** Errors are logged to console for debugging

## Testing

To test the incremental save feature:

1. **Start onboarding flow**
2. **Complete step 1** - Check database for user creation + partial save
3. **Complete step 2** - Check database for updated partial data
4. **Close browser on step 3** - Check database for beforeunload save
5. **Verify data** - All collected data should be in database

## Monitoring

Monitor these metrics:

- **Save Success Rate:** How often partial saves succeed
- **Abandonment Points:** Which steps users abandon most
- **Recovery Rate:** How many abandoned users return
- **Data Completeness:** Average fields filled before abandonment

## Future Enhancements

Potential improvements:

1. **Resume Flow:** Allow users to resume from where they left off
2. **Email Reminders:** Send follow-up emails to users who abandoned
3. **Progress Indicators:** Show users their saved progress
4. **Data Validation:** Validate partial data before saving
5. **Conflict Resolution:** Handle cases where user completes form while partial save is in progress





