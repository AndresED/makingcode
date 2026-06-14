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
      {
        source: '/blog/multitenancy-nestjs-tutorial',
        destination:
          '/blog/how-to-build-a-multi-tenant-saas-application-in-nestjs-without-duplicating-your-code',
        permanent: true,
      },
      {
        source: '/blog/building-hexagonal-module-nestjs',
        destination:
          '/blog/why-your-nestjs-service-becomes-a-mess-and-how-hexagonal-architecture-fixes-it',
        permanent: true,
      },
      {
        source: '/blog/implementing-cqrs-nestjs-tutorial',
        destination: '/blog/cqrs-in-nestjs-stop-mixing-reads-and-writes-in-the-same-service',
        permanent: true,
      },
      {
        source: '/blog/outbox-pattern-nestjs-tutorial',
        destination: '/blog/your-api-doesn-t-need-more-services-it-needs-events',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
