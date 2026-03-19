import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/BlogData";

const BASE_URL = "https://www.atabilet.com";

// Popüler iç hat güzergahları
const popularDomesticRoutes = [
  "istanbul-antalya",
  "istanbul-izmir",
  "istanbul-ankara",
  "istanbul-trabzon",
  "istanbul-adana",
  "istanbul-bodrum",
  "istanbul-dalaman",
  "istanbul-diyarbakir",
  "istanbul-gaziantep",
  "istanbul-erzurum",
  "ankara-antalya",
  "ankara-izmir",
  "ankara-trabzon",
  "izmir-antalya",
  "antalya-ankara",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/ucak-bileti`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/bilet-sorgula`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dinamik uçak bileti güzergah sayfaları
  const flightRoutePages: MetadataRoute.Sitemap = popularDomesticRoutes.map(
    (route) => ({
      url: `${BASE_URL}/ucak-bileti/${route}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })
  );

  // Blog detay sayfaları
  // TODO: İleride API'den dinamik çekilecek
  const blogDetailPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...flightRoutePages, ...blogDetailPages];
}
