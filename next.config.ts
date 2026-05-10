import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "old.radvac.org",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "radvac.org",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8890",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) config.cache = false;
    return config;
  },
};

export default nextConfig;
