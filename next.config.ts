import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Only bypass Next.js image optimization in local dev to prevent local active_storage timeouts. 
    // In production, Next.js will optimize and cache the images perfectly.
    unoptimized: process.env.NODE_ENV === 'development',
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'abri-dreams.s3.eu-west-2.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.stg.shettar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.prd.shettar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  sassOptions: {
    quietDeps: true,
    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
  },
};

export default nextConfig;
