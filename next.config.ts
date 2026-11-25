import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output keeps the Docker image small (AD-17).
  output: "standalone",
};

export default nextConfig;
