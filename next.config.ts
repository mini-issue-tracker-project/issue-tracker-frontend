import type { NextConfig } from "next";
import path from "path";

const backendUrl = process.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    // Only add the external rewrite if backendUrl is defined
    if (backendUrl) {
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`
        }
      ];
    }
    // Return empty array if no backend URL is configured
    return [];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
    };
    return config;
  }
};

export default nextConfig;
