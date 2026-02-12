import withPWA from "next-pwa";
const runtimeCaching = require("next-pwa/cache");

const nextConfig = {
  /* config options here */
  turbopack: {},
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /\/api\/auth\/.*/i,
      handler: "NetworkOnly",
      options: {
        cacheName: "next-auth-network-only",
      },
    },
    ...runtimeCaching,
  ],
})(nextConfig);
