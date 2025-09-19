import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://port-0-account-book-node-mfh2zrw921687152.sel3.cloudtype.app/:path*",
      },
    ];
  },
};

export default nextConfig;
