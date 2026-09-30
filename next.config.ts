import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages will serve the generated static output from /out.
  // The current homepage and /api/news GET route are build-time/static-safe.
  output: "export",
};

export default nextConfig;
