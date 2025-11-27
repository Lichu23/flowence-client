// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
    ],
  },
  // PERFORMANCE: Optimize production builds
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // PERFORMANCE: Enable SWC minification (faster than Terser)
  swcMinify: true,
  // PERFORMANCE: Optimize fonts
  optimizeFonts: true,
  // PERFORMANCE: Enable strict mode for better performance
  reactStrictMode: true,
};

export default nextConfig;
