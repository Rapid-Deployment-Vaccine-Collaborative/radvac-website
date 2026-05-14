import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Locally, build into ~/.cache so Dropbox doesn't sync the .next directory.
  // On Vercel (and any other CI/host), use the default `.next` so the
  // platform can find routes-manifest.json etc. in the expected location.
  ...(process.env.VERCEL
    ? {}
    : { distDir: "/home/dan/.cache/radvac-next" }),
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
