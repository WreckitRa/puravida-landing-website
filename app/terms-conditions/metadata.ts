import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puravida.com';

export const termsMetadata: Metadata = {
  title: 'Terms and Conditions - PuraVida',
  description: 'PuraVida Terms and Conditions. Please read the terms carefully before using our service. Learn about membership, fees, guest list policies, and user responsibilities.',
  keywords: [
    'PuraVida terms and conditions',
    'terms of service',
    'user agreement',
    'membership terms',
    'Dubai nightlife terms',
    'guest list terms',
  ],
  openGraph: {
    title: 'Terms and Conditions - PuraVida',
    description: 'PuraVida Terms and Conditions. Please read the terms carefully before using our service.',
    url: `${siteUrl}/terms-conditions`,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'PuraVida Terms and Conditions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms and Conditions - PuraVida',
    description: 'PuraVida Terms and Conditions. Please read the terms carefully before using our service.',
    images: [`${siteUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: `${siteUrl}/terms-conditions`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

