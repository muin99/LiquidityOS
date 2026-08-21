import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This folder has its own package.json, separate from the one in the
  // parent LiquidityOS folder — this line tells Next.js to treat this
  // folder as the project root, so it stops guessing.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
