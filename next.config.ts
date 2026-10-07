import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  agentRules: false,
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
        hostname: 'shettar.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shettar.s3.amazonaws.com',
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
        hostname: 'api-v1.shettar.com',
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
  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'shettar.com' }],
        destination: 'https://www.shettar.com/',
        permanent: true,
      },
      {
        source: '/:path+',
        has: [{ type: 'host', value: 'shettar.com' }],
        destination: 'https://www.shettar.com/:path+',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
      // BIMI logo: https://www.shettar.com/.well-known/bimi/shettar.svg
      // Cloudflare TXT name default._bimi
      // value: v=BIMI1; l=https://www.shettar.com/.well-known/bimi/shettar.svg
      // Leave a= off until a VMC exists.
      // Keep _dmarc.shettar.com at p=none until both senders pass aligned DMARC:
      // Mailgun (From noreply@shettar.com) must DKIM-sign with d=shettar.com, and
      // Zoho staff mail must keep its shettar.com DKIM. SPF must authorize both.
      {
        source: '/.well-known/bimi/shettar.svg',
        headers: [{ key: 'Content-Type', value: 'image/svg+xml' }],
      },
    ];
  },
};

export default nextConfig;
