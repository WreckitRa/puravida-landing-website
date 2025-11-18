import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://puravida.com";

export const privacyMetadata: Metadata = {
  title: "Privacy Policy - PuraVida",
  description:
    "PuraVida Privacy Policy. Learn how we collect, use, and protect your personal information when you use our mobile app and services.",
  keywords: [
    "PuraVida privacy policy",
    "privacy policy Dubai",
    "data protection",
    "user privacy",
    "personal information",
    "GDPR compliance",
  ],
  openGraph: {
    title: "Privacy Policy - PuraVida",
    description:
      "PuraVida Privacy Policy. Learn how we collect, use, and protect your personal information.",
    url: `${siteUrl}/privacy-policy`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "PuraVida Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - PuraVida",
    description:
      "PuraVida Privacy Policy. Learn how we collect, use, and protect your personal information.",
    images: [`${siteUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};
