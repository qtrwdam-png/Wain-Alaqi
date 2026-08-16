/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    unoptimized: true,
  },
  // Next.js intercepts *.html requests before serving /public files, so the
  // Google Search Console verification file is exposed via an API route rewrite.
  async rewrites() {
    return [
      {
        source: "/google9cf4fc8ca5076e7b.html",
        destination: "/api/google-verification",
      },
    ];
  },
};

module.exports = nextConfig;
