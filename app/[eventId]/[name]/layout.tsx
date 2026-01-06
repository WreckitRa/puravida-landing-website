import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event Invitation | PuraVida",
  description: "You're invited to an exclusive event",
  openGraph: {
    title: "Event Invitation | PuraVida",
    description: "You're invited to an exclusive event",
    type: "website",
  },
};

export default function EventInviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

