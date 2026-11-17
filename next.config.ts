import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `output: 'export'`: blogs come from Solvix at request time (ISR), so
  // the site needs a Node.js host (Netlify's Next.js runtime handles this).
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;