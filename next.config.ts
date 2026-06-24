import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better perf insights
  reactStrictMode: true,

  // Compression (gzip) — reduces payload size significantly
  compress: true,

  // Production source maps disabled — faster builds, smaller bundles
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Experimental: optimise package imports to avoid full library bundles
  experimental: {
    optimizePackageImports: [
      "date-fns",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "react-big-calendar",
    ],
  },

  // Headers for better caching and security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Cache public font files aggressively (these are static by nature)
        source: "/fonts/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
