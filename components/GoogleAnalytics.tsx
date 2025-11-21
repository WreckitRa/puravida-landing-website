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
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Google Analytics initialized:', measurementId);
    }
  }, [measurementId]);

  useEffect(() => {
    if (measurementId && pathname) {
      // Track page view on route change
      trackPageView(pathname);
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Page view tracked:', pathname);
      }
    }
  }, [pathname, measurementId]);

  return null;
}
