import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React Strict Mode to prevent double-render issues with WebSocket
  reactStrictMode: false,
};

export default nextConfig;
