// Analytics utility for comprehensive growth tracking

import { getAttribution } from "./attribution";

declare global {
  interface Window {
    gtag?: {
      // Config call: gtag("config", GA_ID, {...})
      (
        command: "config",
        targetId: string,
        config?: Record<string, unknown>
      ): void;
      // Event call: gtag("event", "event_name", {...})
      (
        command: "event",
        eventName: string,
        eventParams?: Record<string, unknown>
      ): void;
      // JS call: gtag("js", Date)
      (command: "js", date: Date): void;
      // Set call: gtag("set", {...})
      (command: "set", config: Record<string, unknown>): void;
      // Generic fallback for other commands
      (command: string, ...args: unknown[]): void;
    };
    dataLayer?: unknown[];
  }
}

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === "undefined" || !window.gtag) return;

  // Include attribution in page view
  const attribution = getAttribution();

  // Send page_view event (NOT config - that doesn't create events in GA4)
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
    ...attribution,
  });
};

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
) => {
  if (typeof window === "undefined" || !window.gtag) return;

  // Automatically include attribution data in all events
  const attribution = getAttribution();

  window.gtag("event", eventName, {
    ...eventParams,
    ...attribution,
    timestamp: new Date().toISOString(),
  });
};

// Onboarding-specific tracking functions

// Track step view
export const trackStepView = (stepNumber: number, stepName: string) => {
  trackEvent("onboarding_step_view", {
    step_number: stepNumber,
    step_name: stepName,
    progress_percentage: Math.round((stepNumber / 8) * 100),
  });
};

// Track step completion
export const trackStepComplete = (
  stepNumber: number,
  stepName: string,
  timeSpent: number
) => {
  trackEvent("onboarding_step_complete", {
    step_number: stepNumber,
    step_name: stepName,
    time_spent_seconds: timeSpent,
    progress_percentage: Math.round((stepNumber / 8) * 100),
  });
};

// Track button click
export const trackButtonClick = (
  buttonName: string,
  stepNumber: number,
  location: string
) => {
  trackEvent("onboarding_button_click", {
    button_name: buttonName,
    step_number: stepNumber,
    location,
  });
};

// Track form field interaction
export const trackFieldInteraction = (
  fieldName: string,
  stepNumber: number,
  action: "focus" | "blur" | "change"
) => {
  trackEvent("onboarding_field_interaction", {
    field_name: fieldName,
    step_number: stepNumber,
    action,
  });
};

// Track form submission
export const trackFormSubmission = (
  success: boolean,
  formData: Record<string, unknown>,
  timeToComplete: number
) => {
  const attribution = getAttribution();

  trackEvent("onboarding_form_submission", {
    success,
    time_to_complete_seconds: timeToComplete,
    form_data: {
      has_music_taste:
        Array.isArray(formData.musicTaste) && formData.musicTaste.length > 0,
      has_favorite_dj: !!formData.favoriteDJ,
      has_favorite_places:
        Array.isArray(formData.favoritePlacesDubai) &&
        formData.favoritePlacesDubai.length > 0,
      has_festivals: !!formData.festivalsBeenTo,
      music_genres_count: Array.isArray(formData.musicTaste)
        ? formData.musicTaste.filter((g: unknown) => g !== "Other").length
        : 0,
      places_count: Array.isArray(formData.favoritePlacesDubai)
        ? formData.favoritePlacesDubai.filter((p: unknown) => p !== "Other")
            .length
        : 0,
    },
    // Attribution is automatically included via trackEvent
  });

  // Return attribution for form submission
  return attribution;
};

// Track drop-off
export const trackDropOff = (stepNumber: number, stepName: string) => {
  trackEvent("onboarding_drop_off", {
    step_number: stepNumber,
    step_name: stepName,
    progress_percentage: Math.round((stepNumber / 8) * 100),
  });
};

// Track selection (for multi-select fields)
export const trackSelection = (
  fieldName: string,
  value: string,
  stepNumber: number,
  isSelected: boolean
) => {
  trackEvent("onboarding_selection", {
    field_name: fieldName,
    value,
    step_number: stepNumber,
    is_selected: isSelected,
  });
};

// Track conversion (final submission)
export const trackConversion = (
  formData: Record<string, unknown>,
  timeToComplete: number
) => {
  const attribution = getAttribution();

  // Calculate engagement quality score (0-100)
  const engagementScore = calculateEngagementScore(formData, timeToComplete);

  // Track as GA4 conversion event with value
  trackEvent("conversion", {
    event_category: "Onboarding",
    event_label: "Form Completed",
    value: 1,
    currency: "USD",
    time_to_complete_seconds: timeToComplete,
    form_completeness: calculateFormCompleteness(formData),
    engagement_score: engagementScore,
    // Attribution is automatically included via trackEvent
  });

  // Track as lead generation event (for Google Ads optimization)
  trackEvent("generate_lead", {
    value: 1,
    currency: "USD",
    engagement_score: engagementScore,
    lead_type: "onboarding_complete",
  });

  // Track purchase intent signal (high engagement = high intent)
  if (engagementScore >= 70) {
    trackEvent("purchase_intent", {
      intent_score: engagementScore,
      intent_level: engagementScore >= 85 ? "high" : "medium",
      time_to_complete_seconds: timeToComplete,
    });
  }

  // Return attribution for form submission
  return attribution;
};

// Calculate form completeness percentage
const calculateFormCompleteness = (
  formData: Record<string, unknown>
): number => {
  const fields = [
    "fullName",
    "gender",
    "age",
    "nationality",
    "mobile",
    "email",
    "instagram",
    "musicTaste",
    "favoriteDJ",
    "favoritePlacesDubai",
    "festivalsBeenTo",
    "festivalsWantToGo",
    "nightlifeFrequency",
    "idealNightOut",
  ];

  let completed = 0;
  fields.forEach((field) => {
    const value = formData[field];
    if (Array.isArray(value)) {
      if (value.length > 0) completed++;
    } else if (typeof value === "string" && value.trim() !== "") {
      completed++;
    }
  });

  return Math.round((completed / fields.length) * 100);
};

// Track time spent on step
export const trackTimeOnStep = (
  stepNumber: number,
  stepName: string,
  timeSpent: number
) => {
  trackEvent("onboarding_time_on_step", {
    step_number: stepNumber,
    step_name: stepName,
    time_spent_seconds: timeSpent,
  });
};

// Track validation errors
export const trackValidationError = (
  stepNumber: number,
  fieldName: string,
  errorType: string
) => {
  trackEvent("onboarding_validation_error", {
    step_number: stepNumber,
    field_name: fieldName,
    error_type: errorType,
  });
};

// Track scroll depth (for longer steps)
export const trackScrollDepth = (
  stepNumber: number,
  depth: 25 | 50 | 75 | 100
) => {
  trackEvent("onboarding_scroll_depth", {
    step_number: stepNumber,
    scroll_depth: depth,
  });
};

// Calculate engagement quality score (0-100)
// Higher score = more engaged user = better lead quality
const calculateEngagementScore = (
  formData: Record<string, unknown>,
  timeToComplete: number
): number => {
  let score = 0;

  // Form completeness (40 points max)
  const completeness = calculateFormCompleteness(formData);
  score += (completeness / 100) * 40;

  // Time spent (20 points max) - optimal range 2-10 minutes
  if (timeToComplete >= 120 && timeToComplete <= 600) {
    score += 20; // Optimal engagement time
  } else if (timeToComplete >= 60 && timeToComplete < 120) {
    score += 10; // Too fast, might be low quality
  } else if (timeToComplete > 600 && timeToComplete <= 1800) {
    score += 15; // Longer but still engaged
  } else if (timeToComplete > 1800) {
    score += 5; // Very long, might indicate confusion
  }

  // Music taste selection (10 points max)
  if (Array.isArray(formData.musicTaste) && formData.musicTaste.length >= 2) {
    score += 10;
  } else if (
    Array.isArray(formData.musicTaste) &&
    formData.musicTaste.length === 1
  ) {
    score += 5;
  }

  // Favorite places selection (10 points max)
  if (
    Array.isArray(formData.favoritePlacesDubai) &&
    formData.favoritePlacesDubai.length >= 2
  ) {
    score += 10;
  } else if (
    Array.isArray(formData.favoritePlacesDubai) &&
    formData.favoritePlacesDubai.length === 1
  ) {
    score += 5;
  }

  // Has favorite DJ (10 points)
  if (
    formData.favoriteDJ &&
    typeof formData.favoriteDJ === "string" &&
    formData.favoriteDJ.trim() !== ""
  ) {
    score += 10;
  }

  // Has festivals info (10 points)
  if (
    (formData.festivalsBeenTo &&
      typeof formData.festivalsBeenTo === "string" &&
      formData.festivalsBeenTo.trim() !== "") ||
    (formData.festivalsWantToGo &&
      typeof formData.festivalsWantToGo === "string" &&
      formData.festivalsWantToGo.trim() !== "")
  ) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
};

// Track app install click (for iOS/Android)
export const trackAppInstallClick = (
  platform: "ios" | "android",
  location: string
) => {
  trackEvent("app_install_click", {
    platform,
    location,
    // Attribution automatically included
  });

  // Track as conversion event for app installs
  trackEvent("generate_lead", {
    value: 0.5, // Lower value than full form completion
    currency: "USD",
    lead_type: "app_install_intent",
    platform,
  });
};

// Track subscription/payment intent
export const trackSubscriptionIntent = (
  productId: string,
  productName: string,
  price: number,
  currency: string = "USD"
) => {
  // Enhanced ecommerce tracking
  trackEvent("add_payment_info", {
    currency,
    value: price,
    items: [
      {
        item_id: productId,
        item_name: productName,
        price,
        quantity: 1,
      },
    ],
  });

  // Purchase intent signal
  trackEvent("purchase_intent", {
    intent_score: 90, // High intent when reaching payment
    intent_level: "high",
    product_id: productId,
    product_name: productName,
    value: price,
    currency,
  });
};

// Track subscription/payment completion
export const trackSubscriptionComplete = (
  productId: string,
  productName: string,
  price: number,
  transactionId: string,
  currency: string = "USD"
) => {
  // Enhanced ecommerce purchase event
  trackEvent("purchase", {
    transaction_id: transactionId,
    value: price,
    currency,
    items: [
      {
        item_id: productId,
        item_name: productName,
        price,
        quantity: 1,
      },
    ],
  });

  // Conversion event
  trackEvent("conversion", {
    event_category: "Subscription",
    event_label: "Payment Completed",
    value: price,
    currency,
    transaction_id: transactionId,
  });
};

// Track lead quality signal (for remarketing)
export const trackLeadQuality = (
  quality: "high" | "medium" | "low",
  score: number,
  signals: Record<string, unknown>
) => {
  trackEvent("lead_quality", {
    quality,
    quality_score: score,
    ...signals,
  });
};
