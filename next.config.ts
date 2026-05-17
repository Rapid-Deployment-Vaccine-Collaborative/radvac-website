import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "radvac-297e5f.ingress-alpha.ewp.live",
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
  async rewrites() {
    // Preserve inbound links to legacy WP upload URLs (e.g. the cited white paper PDF)
    // by transparently proxying them to the WordPress install on EasyWP.
    return [
      {
        source: "/wp-content/uploads/:path*",
        destination: "https://radvac-297e5f.ingress-alpha.ewp.live/wp-content/uploads/:path*",
      },
    ];
  },
  async redirects() {
    return [
      { source: "/wp-admin", destination: "https://radvac-297e5f.ingress-alpha.ewp.live/wp-admin", permanent: true },
      { source: "/wp-admin/:path*", destination: "https://radvac-297e5f.ingress-alpha.ewp.live/wp-admin/:path*", permanent: true },
      { source: "/wp-login.php", destination: "https://radvac-297e5f.ingress-alpha.ewp.live/wp-login.php", permanent: true },
    ];
  },
};

export default nextConfig;
