import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://puravida.com";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PuraVida - Dubai's Exclusive Inner Circle",
    short_name: "PuraVida",
    description:
      "Dubai's most exclusive lifestyle membership offering access to VIP guestlists, priority tables, and curated parties",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/assets/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
