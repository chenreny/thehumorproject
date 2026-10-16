import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: { "/create": ["./public/meme-templates/*.jpg", "./public/room/animals/*.webp"] },
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
