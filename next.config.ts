import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/create": ["./public/meme-templates/*.jpg"] },
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
