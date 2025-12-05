"use client";

import { useEffect } from "react";
import Script from "next/script";
import { trackPageView } from "@/lib/analytics";
import { usePathname } from "next/navigation";
import { getAttribution } from "@/lib/attribution";

// Get the measurement ID at module level (build time)
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      console.error(
        "❌ Google Analytics: Measurement ID not found!\n" +
          "Set NEXT_PUBLIC_GA_MEASUREMENT_ID in your environment variables."
      );
      return;
    }

    // Initialize dataLayer if not already present
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        window.dataLayer!.push(args);
      }
      window.gtag = gtag as typeof window.gtag;

      // Send timestamp
      gtag("js", new Date());

      console.log("✅ Google Analytics dataLayer initialized");
    }
  }, []);

  useEffect(() => {
    if (GA_MEASUREMENT_ID && pathname) {
      // Track page view on route change
      trackPageView(pathname);
      console.log("📊 Page view tracked:", pathname);
    }
  }, [pathname]);

  // Don't render anything if no measurement ID
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Load the gtag.js script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        onLoad={() => {
          console.log("✅ Google Analytics script loaded");

          // Configure GA after script loads
          if (window.gtag) {
            // Configure with send_page_view disabled (we'll track manually)
            window.gtag("config", GA_MEASUREMENT_ID, {
              send_page_view: false,
            });
            console.log("✅ Google Analytics configured:", GA_MEASUREMENT_ID);

            // Send initial page view with attribution
            const attribution = getAttribution();
            window.gtag("event", "page_view", {
              page_path: window.location.pathname,
              page_title: document.title,
              page_location: window.location.href,
              ...attribution,
            });
            console.log("✅ Initial page_view sent");
          }
        }}
        onError={() => {
          console.error("❌ Failed to load Google Analytics script");
        }}
      />
    </>
  );
}
