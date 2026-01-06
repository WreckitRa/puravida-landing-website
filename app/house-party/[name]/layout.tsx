import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "House Party Invitation | PuraVida",
  description: "You're invited to an exclusive house party in Dubai",
  openGraph: {
    title: "House Party Invitation | PuraVida",
    description: "You're invited to an exclusive house party in Dubai",
    type: "website",
  },
};

export default function HousePartyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


