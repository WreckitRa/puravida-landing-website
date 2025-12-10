"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { initGA, loadGAScript, configureGA } from "@/analytics/init";
import { trackPageView } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";

/**
 * Google Analytics component for SSR-compatible Next.js
 *
 * Features:
 * - SSR-safe initialization (only runs on client)
 * - Prevents double injection across re-renders
 * - Queues events even if gtag loads late
 * - Loads GA4 ID from environment variable
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Get measurement ID from environment variable
  // Supports both NEXT_PUBLIC_GA_MEASUREMENT_ID and NEXT_PUBLIC_GA4_ID
  const measurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GA4_ID ||
    "";

  // Initialize GA on mount (client-side only)
  useEffect(() => {
    if (!measurementId) {
      console.warn(
        "⚠️ Google Analytics: Measurement ID not found!\n" +
          "Set NEXT_PUBLIC_GA_MEASUREMENT_ID or NEXT_PUBLIC_GA4_ID in your environment variables."
      );
      return;
    }

    // Initialize dataLayer and gtag function
    if (initGA(measurementId)) {
      setIsInitialized(true);

      // Load the GA script
      loadGAScript(measurementId)
        .then(() => {
          setScriptLoaded(true);

          // Configure GA after script loads
          configureGA(measurementId);

          // Send initial page view with attribution
          const attribution = getAttribution();
          if (window.gtag) {
            window.gtag("event", "page_view", {
              page_path: window.location.pathname,
              page_title: document.title,
              page_location: window.location.href,
              ...attribution,
            });
            console.log("✅ Initial page_view sent");
          }
        })
        .catch((error) => {
          console.error("❌ Failed to load Google Analytics script:", error);
        });
    }
  }, [measurementId]);

  // Track page views on route change
  useEffect(() => {
    if (measurementId && pathname && scriptLoaded) {
      // Track page view on route change
      trackPageView(pathname);
      console.log("📊 Page view tracked:", pathname);
    }
  }, [pathname, measurementId, scriptLoaded]);

  // Don't render anything (this is a client-only component)
  return null;
}
