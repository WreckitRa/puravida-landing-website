// Analytics utility for comprehensive growth tracking

import { getAttribution } from "./attribution";

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  if (typeof window === "undefined" || !measurementId) return;

  // Prevent duplicate initialization
  if (window.gtag) return;

  // Load gtag script
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag as any;

  gtag("js", new Date());
  gtag("config", measurementId, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === "undefined" || !window.gtag) return;

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return;

  // Include attribution in page view
  const attribution = getAttribution();

  window.gtag("config", measurementId, {
    page_path: path,
    page_title: title,
    ...attribution,
  });
};

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
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
    progress_percentage: Math.round((stepNumber / 9) * 100),
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
    progress_percentage: Math.round((stepNumber / 9) * 100),
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
  formData: any,
  timeToComplete: number
) => {
  const attribution = getAttribution();

  trackEvent("onboarding_form_submission", {
    success,
    time_to_complete_seconds: timeToComplete,
    form_data: {
      has_music_taste: formData.musicTaste?.length > 0,
      has_favorite_dj: !!formData.favoriteDJ,
      has_favorite_places: formData.favoritePlacesDubai?.length > 0,
      has_festivals: !!formData.festivalsBeenTo,
      music_genres_count:
        formData.musicTaste?.filter((g: string) => g !== "Other").length || 0,
      places_count:
        formData.favoritePlacesDubai?.filter((p: string) => p !== "Other")
          .length || 0,
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
    progress_percentage: Math.round((stepNumber / 9) * 100),
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
export const trackConversion = (formData: any, timeToComplete: number) => {
  const attribution = getAttribution();

  trackEvent("conversion", {
    event_category: "Onboarding",
    event_label: "Form Completed",
    value: 1,
    time_to_complete_seconds: timeToComplete,
    form_completeness: calculateFormCompleteness(formData),
    // Attribution is automatically included via trackEvent
  });

  // Return attribution for form submission
  return attribution;
};

// Calculate form completeness percentage
const calculateFormCompleteness = (formData: any): number => {
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
    } else if (value && value.trim() !== "") {
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
