import type { NextConfig } from "next";

const backendUrl = process.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ];
  }
};


export default nextConfig;
