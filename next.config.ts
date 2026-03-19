import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack root dizini
  turbopack: {
    root: __dirname,
  },

  // Görsel optimizasyonu
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.atabilet.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // SEO-uyumlu trailing slash
  trailingSlash: false,

  // Güvenlik başlıkları
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
