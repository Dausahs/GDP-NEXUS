import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Tell Next.js to generate a static HTML build (creates the 'out' folder)
  output: "export",

  // Enable React strict mode for better perf insights
  reactStrictMode: true,

  // Compression (gzip) — reduces payload size significantly
  compress: true,

  // Production source maps disabled — faster builds, smaller bundles
  productionBrowserSourceMaps: false,

  // Image optimization
  // NOTE: Static exports require images to be unoptimized unless using an external loader
  images: {
    unoptimized: true,
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
};

export default nextConfig;