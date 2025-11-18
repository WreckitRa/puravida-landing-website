// Attribution and UTM parameter tracking

export interface AttributionData {
  // UTM Parameters
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;

  // Other marketing parameters
  ref?: string;
  gclid?: string; // Google Ads Click ID
  fbclid?: string; // Facebook Click ID
  ttclid?: string; // TikTok Click ID
  li_fat_id?: string; // LinkedIn Click ID
  msclkid?: string; // Microsoft Ads Click ID

  // Timestamps
  first_touch_timestamp?: string;
  last_touch_timestamp?: string;

  // Additional tracking
  landing_page?: string;
  referrer?: string;
}

const ATTRIBUTION_STORAGE_KEY = "puravida_attribution";

// Parse URL parameters
export const parseUrlParams = (): AttributionData => {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const attribution: AttributionData = {};

  // UTM Parameters
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const utmTerm = params.get("utm_term");
  const utmContent = params.get("utm_content");

  if (utmSource) attribution.utm_source = utmSource;
  if (utmMedium) attribution.utm_medium = utmMedium;
  if (utmCampaign) attribution.utm_campaign = utmCampaign;
  if (utmTerm) attribution.utm_term = utmTerm;
  if (utmContent) attribution.utm_content = utmContent;

  // Other marketing parameters
  const ref = params.get("ref");
  const gclid = params.get("gclid");
  const fbclid = params.get("fbclid");
  const ttclid = params.get("ttclid");
  const liFatId = params.get("li_fat_id");
  const msclkid = params.get("msclkid");

  if (ref) attribution.ref = ref;
  if (gclid) attribution.gclid = gclid;
  if (fbclid) attribution.fbclid = fbclid;
  if (ttclid) attribution.ttclid = ttclid;
  if (liFatId) attribution.li_fat_id = liFatId;
  if (msclkid) attribution.msclkid = msclkid;

  // Store landing page and referrer
  attribution.landing_page = window.location.pathname;
  attribution.referrer = document.referrer || undefined;

  return attribution;
};

// Get stored attribution data
export const getStoredAttribution = (): AttributionData | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error reading attribution from localStorage:", error);
    return null;
  }
};

// Store attribution data
export const storeAttribution = (attribution: AttributionData): void => {
  if (typeof window === "undefined") return;

  try {
    const existing = getStoredAttribution();
    const now = new Date().toISOString();

    // Merge with existing data
    const merged: AttributionData = {
      ...existing,
      ...attribution,
    };

    // Set first touch timestamp if this is the first time
    if (
      !existing?.first_touch_timestamp &&
      Object.keys(attribution).length > 0
    ) {
      merged.first_touch_timestamp = now;
    }

    // Always update last touch timestamp if we have new attribution data
    if (Object.keys(attribution).length > 0) {
      merged.last_touch_timestamp = now;
    }

    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error("Error storing attribution to localStorage:", error);
  }
};

// Initialize attribution tracking
export const initAttribution = (): AttributionData => {
  // Parse current URL parameters
  const urlParams = parseUrlParams();

  // Get existing stored attribution
  const stored = getStoredAttribution();

  // If we have new UTM parameters, update attribution
  if (Object.keys(urlParams).length > 0) {
    storeAttribution(urlParams);
    return { ...stored, ...urlParams };
  }

  // Return stored attribution if available
  return stored || {};
};

// Get attribution for analytics/form submission
export const getAttribution = (): AttributionData => {
  const stored = getStoredAttribution();
  const current = parseUrlParams();

  // Merge current params with stored (current takes precedence)
  return {
    ...stored,
    ...current,
  };
};

// Clear attribution (useful for testing)
export const clearAttribution = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
};

// Get attribution summary for display/logging
export const getAttributionSummary = (): string => {
  const attribution = getAttribution();
  const parts: string[] = [];

  if (attribution.utm_source) parts.push(`Source: ${attribution.utm_source}`);
  if (attribution.utm_medium) parts.push(`Medium: ${attribution.utm_medium}`);
  if (attribution.utm_campaign)
    parts.push(`Campaign: ${attribution.utm_campaign}`);
  if (attribution.ref) parts.push(`Ref: ${attribution.ref}`);

  return parts.length > 0 ? parts.join(" | ") : "Direct";
};
