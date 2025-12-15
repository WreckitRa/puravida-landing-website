/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/app/invite",
        destination: "/ihaveinvite",
        permanent: true,
      },
    ];
  },
  // Optimize build output for better performance
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header for security
};

module.exports = nextConfig;
