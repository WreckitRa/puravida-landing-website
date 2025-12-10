/**
 * Google Analytics 4 initialization for SSR-compatible Next.js
 *
 * This module provides SSR-safe GA initialization that:
 * - Only runs on the client (checks for window)
 * - Queues events even if gtag loads late
 * - Prevents double injection across SSR re-renders
 * - Loads GA4 ID from environment variable safely
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "config" | "event" | "js" | "set",
      targetIdOrEventName: string,
      configOrParams?: Record<string, unknown> | Date
    ) => void;
  }
}

/**
 * Initialize Google Analytics 4
 *
 * @param measurementId - GA4 Measurement ID (e.g., "G-XXXXXXXXXX")
 * @returns true if initialization was successful, false otherwise
 */
export function initGA(measurementId: string): boolean {
  // SSR safety check - only run on client
  if (typeof window === "undefined") {
    return false;
  }

  // Validate measurement ID
  if (!measurementId || measurementId.trim() === "") {
    console.warn("⚠️ Google Analytics: Measurement ID is empty");
    return false;
  }

  // Prevent double initialization
  if (window.gtag && window.dataLayer) {
    console.log("✅ Google Analytics already initialized");
    return true;
  }

  // Initialize dataLayer if not present
  window.dataLayer = window.dataLayer || [];

  // Create gtag function that queues events
  function gtag(
    command: "config" | "event" | "js" | "set",
    targetIdOrEventName: string,
    configOrParams?: Record<string, unknown> | Date
  ): void {
    window.dataLayer!.push(arguments);
  }

  // Attach gtag to window
  window.gtag = gtag;

  // Send timestamp
  gtag("js", new Date());

  console.log("✅ Google Analytics dataLayer initialized");

  return true;
}

/**
 * Load the GA4 script tag dynamically
 * Prevents duplicate script injection across SSR re-renders
 *
 * @param measurementId - GA4 Measurement ID
 * @returns Promise that resolves when script is loaded
 */
export function loadGAScript(measurementId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // SSR safety check
    if (typeof window === "undefined") {
      reject(new Error("Cannot load GA script on server"));
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src*="googletagmanager.com/gtag/js"]'
    );

    if (existingScript) {
      console.log("✅ Google Analytics script already loaded");
      resolve();
      return;
    }

    // Create and inject script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

    script.onload = () => {
      console.log("✅ Google Analytics script loaded");
      resolve();
    };

    script.onerror = () => {
      console.error("❌ Failed to load Google Analytics script");
      reject(new Error("Failed to load GA script"));
    };

    document.head.appendChild(script);
  });
}

/**
 * Configure GA4 after script loads
 *
 * @param measurementId - GA4 Measurement ID
 * @param config - Optional configuration object
 */
export function configureGA(
  measurementId: string,
  config?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.warn("⚠️ Google Analytics not initialized");
    return;
  }

  window.gtag("config", measurementId, {
    send_page_view: false, // We'll track page views manually
    ...config,
  });

  console.log(`✅ Google Analytics configured: ${measurementId}`);
}
