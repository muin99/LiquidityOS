import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This folder has its own package.json, separate from the one in the
  // parent LiquidityOS folder — this line tells Next.js to treat this
  // folder as the project root, so it stops guessing.
  turbopack: {
    root: __dirname,
  },
  // Lets you open the dev server from another device on the same
  // Wi-Fi (e.g. your phone) using this computer's network address,
  // without hot-reload getting blocked.
  allowedDevOrigins: ["192.168.0.49"],
};

export default nextConfig;
