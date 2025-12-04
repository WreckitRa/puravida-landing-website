import { Suspense } from "react";
import EventPageClient from "./EventPageClient";

// Generate static params for common/mock events
// With dynamic routes enabled (no output: "export"), any event ID will work at runtime
// This function pre-generates common event pages for better performance
export async function generateStaticParams() {
  // Optionally pre-generate common event pages for better performance
  // Any event ID (including UUIDs) will work at runtime even if not listed here
  return [
    { id: "summer-vibes-2024" },
    { id: "rooftop-sessions" },
    { id: "pool-party" },
    { id: "abla-bakh" },
  ];
}

// Allow dynamic params that aren't in generateStaticParams
export const dynamicParams = true;

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <EventPageClient eventId={id} />
    </Suspense>
  );
}

