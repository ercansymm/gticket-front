import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/giris",
          "/kayit-ol",
          "/sepet",
          "/checkout",
          "/favoriler",
          "/ucus-sonuclari",
        ],
      },
    ],
    sitemap: "https://www.atabilet.com/sitemap.xml",
  };
}
