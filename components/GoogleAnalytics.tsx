"use client";

import { useEffect } from "react";
import { initGA, trackPageView } from "@/lib/analytics";
import { usePathname } from "next/navigation";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!measurementId) {
      console.warn(
        "Google Analytics Measurement ID not found. Set NEXT_PUBLIC_GA_MEASUREMENT_ID in your .env file."
      );
      return;
    }

    // Initialize GA
    initGA(measurementId);
  }, [measurementId]);

  useEffect(() => {
    if (measurementId && pathname) {
      // Track page view on route change
      trackPageView(pathname);
    }
  }, [pathname, measurementId]);

  return null;
}
