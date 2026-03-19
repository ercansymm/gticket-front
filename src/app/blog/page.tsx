import type { Metadata } from "next";
import BlogClient from "./blog-client";

export const metadata: Metadata = {
  title: "Blog - Seyahat Rehberi",
  description: "Seyahat ipuçları, ucuz uçak bileti tavsiyeleri ve gezi rehberleri.",
  alternates: { canonical: "https://www.atabilet.com/blog" },
};

export default function BlogPage() {
  return <BlogClient />;
}
