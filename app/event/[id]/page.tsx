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
