"use client";

import BlogDetailsArea from "@/components/blogs/blog-details/BlogDetailsArea";

export default function BlogDetailsClient({ slug }: { slug: string }) {
  void slug;
  return <BlogDetailsArea />;
}
