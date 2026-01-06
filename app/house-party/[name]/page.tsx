import { Suspense } from "react";
import HousePartyClient from "./HousePartyClient";

export const dynamic = "force-dynamic";

interface HousePartyPageProps {
  params: { name: string };
}

export default async function HousePartyPage({ params }: HousePartyPageProps) {
  const inviterName = decodeURIComponent(params.name || "");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <HousePartyClient inviterName={inviterName} />
    </Suspense>
  );
}


