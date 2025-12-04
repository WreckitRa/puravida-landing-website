import { Suspense } from "react";
import EventPageClient from "./EventPageClient";

// Generate static params for static export
export async function generateStaticParams() {
  return [
    { id: "summer-vibes-2024" },
    { id: "rooftop-sessions" },
    { id: "pool-party" },
  ];
}

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

