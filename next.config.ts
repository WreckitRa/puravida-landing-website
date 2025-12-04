import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Static export for production hosting
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
