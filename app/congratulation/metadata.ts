import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://puravida.com";

export const congratulationMetadata: Metadata = {
  title: "Congratulations - Welcome to PuraVida",
  description:
    "Your profile is under review. Invite your crew to move up the waitlist and get bumped on the queue. For every person you invite, you jump 100 spots on the list.",
  keywords: [
    "PuraVida congratulations",
    "waitlist position",
    "invite friends",
    "Dubai membership",
    "VIP waitlist",
    "exclusive access",
  ],
  openGraph: {
    title: "Congratulations - Welcome to PuraVida",
    description:
      "Your profile is under review. Invite your crew to move up the waitlist!",
    url: `${siteUrl}/congratulation`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "PuraVida - Congratulations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Congratulations - Welcome to PuraVida",
    description:
      "Your profile is under review. Invite your crew to move up the waitlist!",
    images: [`${siteUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: `${siteUrl}/congratulation`,
  },
  robots: {
    index: false, // Don't index this page as it's user-specific
    follow: true,
  },
};
