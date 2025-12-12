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
export default function GoogleAnalytics() {
  const pathname = usePathname();

  // Get measurement ID from environment variable
  const measurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GA4_ID ||
    "";

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
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ Google Analytics: Measurement ID not found!\n" +
          "Set NEXT_PUBLIC_GA_MEASUREMENT_ID or NEXT_PUBLIC_GA4_ID in your environment variables."
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
