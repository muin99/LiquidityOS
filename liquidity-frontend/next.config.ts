import type { NextConfig } from "next";

// Where the real backend lives. Change this in a ".env.local" file
// if your backend runs somewhere else.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

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
  // This is our "proxy". Any request the browser makes to "/api/xyz"
  // quietly gets forwarded to the real backend at BACKEND_URL/xyz.
  // Doing it this way means the browser only ever talks to ONE
  // address (this frontend's own address), which keeps things simple.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
