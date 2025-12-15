// React imports
import { Suspense } from "react";

// Internal components
import EventPageClient from "./EventPageClient";

// Use ISR instead of pure SSR - cache for 60 seconds
export const dynamic = "force-static";
export const revalidate = 60;

interface EventPageProps {
  params: Promise<{ id: string }>;
}

// Server-side function to fetch event data with ISR
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
      next: { revalidate: 60 }, // ISR cache for 60 seconds
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
  const { id } = await params;
  const event = await getEvent(id);

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
