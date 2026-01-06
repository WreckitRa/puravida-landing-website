import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Friends & Family Invitation | PuraVida",
  description: "You're invited to an exclusive event",
  openGraph: {
    title: "Friends & Family Invitation | PuraVida",
    description: "You're invited to an exclusive event",
    type: "website",
  },
};

export default function FriendsFamilyInviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

