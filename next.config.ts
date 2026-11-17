import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ibb.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/student-dashboard',
        destination: '/student',
        permanent: false,
      },
      {
        source: '/teacher-dashboard',
        destination: '/teacher',
        permanent: false,
      },
      {
        source: '/company/dashboard',
        destination: '/company',
        permanent: false,
      },
      {
        source: '/student/ai-tutor',
        destination: '/student',
        permanent: false,
      },
    ];
  },
  transpilePackages: ['motion'],
};

export default withSerwist(nextConfig);
