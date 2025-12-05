import { Suspense } from "react";
import EventPageClient from "./EventPageClient";

// Generate static params for common events
// Note: With static export, we pre-generate some common routes
// For other event IDs, Apache .htaccess will route them to a generated page
// The page will fetch data client-side for any event ID
export async function generateStaticParams() {
  // Pre-generate common event pages for better performance
  // Also generate a fallback page that can handle any event ID
  return [
    { id: "summer-vibes-2024" },
    { id: "rooftop-sessions" },
    { id: "pool-party" },
    { id: "fallback" }, // Fallback page for any event ID not in the list
    // Don't include "abla-bakh" here - it has its own dedicated page at /abla-bakh
  ];
}

// Allow dynamic params not in generateStaticParams
// In dev mode: allows any event ID to work
// In production with static export: Apache .htaccess routes unknown IDs to fallback page
export const dynamicParams = true;

// For static export, dynamic routes work via:
// 1. Pre-generated pages for common IDs
// 2. Apache rewrite rules that route /event/[any-id] to /event/fallback.html
// 3. Client-side code that reads the actual event ID from the URL and fetches data

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  
  // In production with static export, if ID is not in generateStaticParams,
  // Apache routes to fallback.html and client-side extracts real ID from URL
  // In dev mode, we can use the actual ID directly
  const eventId = id || "fallback";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <EventPageClient eventId={eventId} />
    </Suspense>
  );
}

