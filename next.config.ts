import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No "output: standalone" — let Vercel auto-detect
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow image optimization for external domains if needed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
