"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * Google Analytics component for Next.js
 * Uses Next.js Script component for optimal loading
 * Matches the working ga-test.html implementation
 */

// Get measurement ID at module level for build-time embedding
// NEXT_PUBLIC_* vars must be accessed at module level, not inside component
// This ensures they're embedded during build, not runtime
const measurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GA4_ID ||
  "";

export default function GoogleAnalytics() {
  const pathname = usePathname();

  // Track page views on route change
  useEffect(() => {
    if (
      measurementId &&
      pathname &&
      typeof window !== "undefined" &&
      window.gtag
    ) {
      // Use setTimeout to ensure gtag is ready
      const timer = setTimeout(() => {
        trackPageView(pathname);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, measurementId]);

  if (!measurementId) {
    // Warn in both dev and production (but only once)
    if (typeof window !== "undefined") {
      console.warn(
        "⚠️ Google Analytics: Measurement ID not found!\n" +
          "Set NEXT_PUBLIC_GA_MEASUREMENT_ID or NEXT_PUBLIC_GA4_ID in your environment variables.\n" +
          "IMPORTANT: Rebuild after setting the variable (npm run build)"
      );
    }
    return null;
  }

  return (
    <>
      {/* Google Analytics Script - Load first */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      {/* Initialize dataLayer and gtag function */}
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: false
          });
          console.log('✅ GA initialized with ID: ${measurementId}');
        `}
      </Script>
    </>
  );
}
