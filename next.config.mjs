/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Next 16 only allows quality 75 by default; the 星化 mark (Mark.tsx)
    // asks for 90 so its fine chrome glints survive optimization.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        pathname: "/media/**",
      },
      {
        // Seonghwa's Stories (src/data/stories.ts) — official photo CDN
        // for ateez.kqent.com's Story/Star posts.
        protocol: "https",
        hostname: "image.static.bstage.in",
        pathname: "/cdn-cgi/image/**",
      },
    ],
  },
};

export default nextConfig;
