import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // REMOVE THE "N" BADGE (dev only)
  devIndicators: {
    buildActivity: false, // hides the N + build info
  }
};

export default nextConfig;