"use client";

import { useEffect } from "react";
import { initGA, trackPageView } from "@/lib/analytics";
import { usePathname } from "next/navigation";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!measurementId) {
      console.error(
        "❌ Google Analytics: Measurement ID not found!\n" +
        "Set NEXT_PUBLIC_GA_MEASUREMENT_ID in your environment variables.\n" +
        "Current value:", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      );
      return;
    }

    // Initialize GA
    try {
      initGA(measurementId);
      console.log('✅ Google Analytics initialized:', measurementId);
      
      // Verify it's actually loaded after a short delay
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.gtag) {
          console.log('✅ Google Analytics script loaded successfully');
        } else {
          console.error('❌ Google Analytics script failed to load. Check network tab for errors.');
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Error initializing Google Analytics:', error);
    }
  }, [measurementId]);

  useEffect(() => {
    if (measurementId && pathname) {
      // Track page view on route change
      trackPageView(pathname);
      console.log('📊 Page view tracked:', pathname);
    }
  }, [pathname, measurementId]);

  return null;
}
