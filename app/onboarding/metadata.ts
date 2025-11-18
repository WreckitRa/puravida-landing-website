import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://puravida.com";

export const onboardingMetadata: Metadata = {
  title: "Join PuraVida - Dubai's Exclusive Inner Circle",
  description:
    "Apply for membership to Dubai's most exclusive lifestyle network. Access VIP guestlists, priority tables, and curated parties. Private, invite-only community for Dubai's elite.",
  keywords: [
    "Dubai membership application",
    "join PuraVida",
    "Dubai VIP membership",
    "exclusive club Dubai",
    "Dubai lifestyle application",
    "private membership Dubai",
    "Dubai elite community",
    "VIP access Dubai",
  ],
  openGraph: {
    title: "Join PuraVida - Dubai's Exclusive Inner Circle",
    description:
      "Apply for membership to Dubai's most exclusive lifestyle network. Access VIP guestlists, priority tables, and curated parties.",
    url: `${siteUrl}/onboarding`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image-onboarding.jpg`,
        width: 1200,
        height: 630,
        alt: "Join PuraVida - Dubai's Exclusive Inner Circle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join PuraVida - Dubai's Exclusive Inner Circle",
    description:
      "Apply for membership to Dubai's most exclusive lifestyle network.",
    images: [`${siteUrl}/og-image-onboarding.jpg`],
  },
  alternates: {
    canonical: `${siteUrl}/onboarding`,
  },
  robots: {
    index: true,
    follow: true,
  },
};
