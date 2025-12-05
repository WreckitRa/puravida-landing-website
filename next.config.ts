import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export in production builds
  // This allows dynamic routes to work in dev mode
  ...(process.env.NODE_ENV === "production" && { output: "export" }),
  images: {
    unoptimized: true,
  },
  // Note: Files in public/ are automatically copied to out/ during build
  // The post-build script (scripts/post-build.js) verifies fallback.html exists
};

export default nextConfig;
