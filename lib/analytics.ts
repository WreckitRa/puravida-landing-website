// Analytics utility for comprehensive growth tracking

import { getAttribution } from "./attribution";

declare global {
  interface Window {
    gtag?: {
      // Config call: gtag("config", GA_ID, {...})
      (command: "config", targetId: string, config?: Record<string, any>): void;
      // Event call: gtag("event", "event_name", {...})
      (
        command: "event",
        eventName: string,
        eventParams?: Record<string, any>
      ): void;
      // JS call: gtag("js", Date)
      (command: "js", date: Date): void;
      // Set call: gtag("set", {...})
      (command: "set", config: Record<string, any>): void;
      // Generic fallback for other commands
      (command: string, ...args: any[]): void;
    };
    dataLayer?: any[];
  }
}

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  if (typeof window === "undefined" || !measurementId) {
    console.error("initGA: window is undefined or measurementId is missing");
    return;
  }

  // Prevent duplicate initialization - check if script already exists
  const existingScript = document.querySelector(
    `script[src*="googletagmanager.com/gtag/js"]`
  );
  if (existingScript || (window.gtag && window.dataLayer)) {
    console.warn("Google Analytics already initialized, skipping...");
    return;
  }

  // Step 1: Initialize dataLayer and gtag function BEFORE external script loads
  // This is the critical inline initialization that GA requires
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag as any;

  // Mark initialization time
  gtag("js", new Date());

  // Step 2: Inject the external GA script (the actual gtag.js library)
  // ONLY ONE SCRIPT INJECTION - this is critical
  const externalScript = document.createElement("script");
  externalScript.async = true;
  externalScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  externalScript.onerror = () => {
    console.error(
      "❌ Failed to load Google Analytics script. Check network connection and ad blockers."
    );
  };
  externalScript.onload = () => {
    console.log("✅ Google Analytics script loaded from googletagmanager.com");

    // Configure GA ONCE after the external script has loaded
    // This is the ONLY place we call config to avoid duplicate init
    if (window.gtag) {
      // Disable automatic page view - we'll send it manually to include attribution
      window.gtag("config", measurementId, {
        send_page_view: false,
      });
      console.log(
        "✅ Google Analytics configured with Measurement ID:",
        measurementId
      );

      // Send the initial page view event with attribution
      const attribution = getAttribution();
      window.gtag("event", "page_view", {
        page_path: window.location.pathname,
        page_title: document.title,
        ...attribution,
      });
      console.log("✅ Initial page_view event sent");
    } else {
      console.error("❌ gtag function not available after script load");
    }
  };

  // Append to head - this triggers the script load
  document.head.appendChild(externalScript);

  // DO NOT call gtag("config") here - wait for script to load
  // The config will be called once in the onload callback above
};

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
