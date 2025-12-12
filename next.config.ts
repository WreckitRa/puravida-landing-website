/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Optimize build output for better performance
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header for security
  // Optimize static generation
  swcMinify: true, // Use SWC minifier (faster than Terser)
};

module.exports = nextConfig;
