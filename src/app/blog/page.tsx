import type { Metadata } from "next";
import BlogClient from "./blog-client";

export const metadata: Metadata = {
  title: "Seyahat Blogu | AtaBilet",
  description:
    "Uçak bileti ipuçları, destinasyon rehberleri ve seyahat önerileri. AtaBilet blog ile en ucuz uçak biletini bulun.",
};

export default function BlogPage() {
  return <BlogClient />;
}
