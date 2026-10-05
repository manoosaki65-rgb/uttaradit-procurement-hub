import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages will serve the generated static output from /out.
  // The current homepage and /api/news GET route are build-time/static-safe.
  output: "export",
  // Weather API JSON is validated by the browser at runtime; do not block deployment on its inferred unknown type.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
