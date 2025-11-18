import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://puravida.com";

export const iHaveInviteMetadata: Metadata = {
  title: "You Have an Invite - PuraVida",
  description:
    "Congratulations! You can download the PuraVida app and enter your invite code. Get the app and subscribe to the goodlife!",
  keywords: [
    "PuraVida invite",
    "PuraVida app download",
    "Dubai membership invite",
    "VIP invite code",
    "exclusive app access",
    "PuraVida invitation",
  ],
  openGraph: {
    title: "You Have an Invite - PuraVida",
    description:
      "Congratulations! You can download the PuraVida app and enter your invite code. Get the app and subscribe to the goodlife!",
    url: `${siteUrl}/ihaveinvite`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "PuraVida - You Have an Invite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "You Have an Invite - PuraVida",
    description:
      "Congratulations! You can download the PuraVida app and enter your invite code.",
    images: [`${siteUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: `${siteUrl}/ihaveinvite`,
  },
  robots: {
    index: false, // Don't index this page as it's user-specific
    follow: true,
  },
};
