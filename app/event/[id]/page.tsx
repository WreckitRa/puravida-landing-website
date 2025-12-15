// React imports
import { Suspense } from "react";
import { notFound } from "next/navigation";

// Internal components
import EventPageClient from "./EventPageClient";

// Dynamic route with ISR-style caching on fetch
export const dynamic = "force-dynamic";

interface EventPageProps {
  params: { id: string };
}

// Lightweight ID validation to avoid heavy work on malformed input
function isValidEventId(id: string | undefined | null): id is string {
  if (!id) return false;
  // Only allow reasonably sized slug/ID values
  if (id.length > 64) return false;
  // Basic safety: restrict to URL-safe characters
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

// Server-side function to fetch event data with caching
async function getEvent(id: string) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api.puravida.events";

  try {
    const response = await fetch(`${API_BASE_URL}/api/public/events/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const id = params?.id;

  if (!isValidEventId(id)) {
    return notFound();
  }

  const event = await getEvent(id);

  if (!event) {
    return notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <EventPageClient eventId={id} initialEvent={event} />
    </Suspense>
  );
}
