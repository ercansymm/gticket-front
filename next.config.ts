import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Görsel optimizasyonu — unoptimized: true ile next/image encode adımı atlanır,
  // resimler doğrudan kaynak URL'den sunulur. Cloudflare Cache-Control ile cache'ler.
  images: {
    unoptimized: true,
  },

  // SEO-uyumlu trailing slash
  trailingSlash: false,

  // Eski İngilizce URL'lerden yeni Türkçe URL'lere kalıcı yönlendirme (SEO dostu 308)
  async redirects() {
    return [
      { source: "/about",          destination: "/hakkimizda",   permanent: true },
      { source: "/contact",        destination: "/iletisim",      permanent: true },
      { source: "/faq",            destination: "/sss",           permanent: true },
      { source: "/pricing",        destination: "/fiyatlandirma", permanent: true },
      { source: "/login",          destination: "/giris",         permanent: true },
      { source: "/register",       destination: "/kayit-ol",      permanent: true },
      { source: "/search-results", destination: "/ucus-sonuclari",permanent: true },
      { source: "/cart",           destination: "/sepet",         permanent: true },
      { source: "/wishlist",       destination: "/favoriler",     permanent: true },
    ];
  },

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
