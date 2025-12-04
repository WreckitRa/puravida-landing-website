import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: "export" to support dynamic routes for event pages with UUIDs
  // If you need static export for other pages, consider using a hybrid approach
  // or generating all event IDs at build time
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
