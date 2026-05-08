"use client";

import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "../../../data/BlogData";
import { useTranslation } from "../../../context/LanguageContext";

const BlogSidebar = () => {
  const { lang } = useTranslation();
  const isTr = lang === "tr";
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <aside className="tg-blog-sidebar">
      <div className="tg-blog-sidebar-widget mb-40">
        <h4 className="tg-blog-sidebar-title">
          {isTr ? "Son Yazılar" : "Recent Posts"}
        </h4>
        <ul className="tg-blog-sidebar-recent">
          {recentPosts.map((post) => (
            <li key={post.id} className="tg-blog-sidebar-recent-item">
              <Link href={`/blog/${post.slug}`} className="tg-blog-sidebar-recent-thumb">
                <Image
                  src={post.thumb}
                  alt={isTr ? post.title_tr : post.title_en}
                  width={70}
                  height={70}
                />
              </Link>
              <div className="tg-blog-sidebar-recent-body">
                <h6>
                  <Link href={`/blog/${post.slug}`}>
                    {isTr ? post.title_tr : post.title_en}
                  </Link>
                </h6>
                <span>{new Date(post.date).toLocaleDateString(isTr ? "tr-TR" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="tg-blog-sidebar-widget mb-40">
        <h4 className="tg-blog-sidebar-title">
          {isTr ? "Kategoriler" : "Categories"}
        </h4>
        <ul className="tg-blog-sidebar-cats">
          <li><Link href="/blog">{isTr ? "İpuçları" : "Tips"}</Link></li>
          <li><Link href="/blog">{isTr ? "Destinasyon" : "Destination"}</Link></li>
          <li><Link href="/blog">{isTr ? "Rehber" : "Guide"}</Link></li>
          <li><Link href="/blog">{isTr ? "Pratik Bilgi" : "Practical Info"}</Link></li>
          <li><Link href="/blog">{isTr ? "Tatil" : "Holiday"}</Link></li>
        </ul>
      </div>
    </aside>
  );
};

export default BlogSidebar;
