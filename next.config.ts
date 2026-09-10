import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/clinic/dr-avishek-clinic",
        destination: "/clinic/dr-priyabarta-clinic",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
