import { Suspense } from "react";
import EventPageClient from "./EventPageClient";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;

  // With SSR, we can use the actual event ID directly from the route params
  const eventId = id;

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
