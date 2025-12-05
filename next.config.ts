import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export in production builds
  // This allows dynamic routes to work in dev mode
  ...(process.env.NODE_ENV === "production" && { output: "export" }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
