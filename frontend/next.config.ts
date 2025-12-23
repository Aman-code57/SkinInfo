import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👉 Allow LAN access for development
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.93:3000",
  ],
};

export default nextConfig;
