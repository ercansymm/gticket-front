import type { MetadataRoute } from "next";

const BASE_URL = "https://www.atabilet.com";
const API_BASE = process.env.API_BASE_URL ?? "";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/ucak-bileti`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/bilet-sorgula`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/hakkimizda`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/iletisim`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/sss`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/fiyatlandirma`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const flightRoutePages: MetadataRoute.Sitemap = popularDomesticRoutes.map((route) => ({
    url: `${BASE_URL}/ucak-bileti/${route}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  let blogDetailPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/api/admin/blog/public`);
    if (res.ok) {
      const posts: Array<{ slug: string; updatedAt: string }> = await res.json();
      blogDetailPages = posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // backend erişilemezse blog sayfaları sitemap'e eklenmez
  }

  return [...staticPages, ...flightRoutePages, ...blogDetailPages];
}
