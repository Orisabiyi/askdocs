/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
      {
        protocol: "http",
        hostname: "*",
      },
    ],
  },
  // turbopack: (config: { resolve: { alias: { canvas: boolean; encoding: boolean; }; }; }) => {
  //   config.resolve.alias.canvas = false;
  //   config.resolve.alias.encoding = false;
  //   return config;
  // },
};

module.exports = nextConfig;