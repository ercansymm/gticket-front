import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Görsel optimizasyonu
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.atabilet.com",
      },
      {
        protocol: "https",
        hostname: "atabilet.com",
      },
      {
        protocol: "http",
        hostname: "37.148.212.253",
        port: "5000",
      },
      {
        protocol: "https",
        hostname: "pics.avs.io",
      },
      {
        protocol: "https",
        hostname: "images.kiwi.com",
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
            value: "frame-ancestors 'none'; frame-src 'self' https://pay3dstage.biletbank.com https://pay3d.biletbank.com https://www.google.com https://maps.google.com https://maps.googleapis.com https://www.google.com.tr https://www.openstreetmap.org;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
