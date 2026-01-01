import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event | PuraVida",
  description: "Join PuraVida's exclusive events and get on the guest list",
  openGraph: {
    title: "Event | PuraVida",
    description: "Join PuraVida's exclusive events and get on the guest list",
    type: "website",
  },
};

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

