/** @type {import('next').NextConfig} */
const nextConfig = {
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

  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
