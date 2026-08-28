import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static export for GitHub Pages: no Node server on the other end, so the
     image optimiser has to be off and every route pre-rendered to HTML. */
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
