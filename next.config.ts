import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.kapruka.com",
      },
      {
        protocol: "https",
        hostname: "**.kaprukaimg.com",
      },
      {
        protocol: "https",
        hostname: "kapruka.com",
      },
      {
        protocol: "https",
        hostname: "www.kapruka.com",
      },
    ],
  },
};

export default nextConfig;
