import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/login",
          "/register",
          "/cart",
          "/checkout",
          "/wishlist",
          "/search-results",
        ],
      },
    ],
    sitemap: "https://www.atabilet.com/sitemap.xml",
  };
}
