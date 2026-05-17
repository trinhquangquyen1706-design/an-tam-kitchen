import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/types"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.openfoodfacts.org",
        pathname: "/images/products/**",
      },
      {
        protocol: "https",
        hostname: "static.openfoodfacts.org",
        pathname: "/images/products/**",
      },
    ],
  },
};

export default nextConfig;
