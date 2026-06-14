import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'makingcode.dev' }],
        destination: 'https://www.makingcode.dev/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
