"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "../../../context/LanguageContext";

interface BlogPost {
  id: number;
  slug: string;
  titleTr: string;
  titleEn: string;
  summaryTr: string;
  summaryEn: string;
  thumbUrl: string | null;
  tagTr: string;
  tagEn: string;
  date: string;
  createdAt: string;
  readTime: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const BlogArea = () => {
  const { t, lang } = useTranslation();
  const isTr = lang === "tr";
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog/public")
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bb-blog-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bb-blog-card animate-pulse">
            <div className="bb-blog-card__img-wrap bg-gray-200" style={{ height: 200 }} />
            <div className="bb-blog-card__body">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full mb-1" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bb-blog-grid" style={{ textAlign: "center", padding: "40px 0" }}>
        <p>{isTr ? "Henüz blog yazısı yok." : "No blog posts yet."}</p>
      </div>
    );
  }

  return (
    <div className="bb-blog-grid">
      {posts.map((post) => {
        const thumb = post.thumbUrl
          ? post.thumbUrl.startsWith("/uploads/")
            ? `${BACKEND_URL}${post.thumbUrl}`
            : post.thumbUrl
          : "/assets/img/blog/blog-placeholder.jpg";
        const date = post.createdAt ?? post.date;

        return (
          <article key={post.id} className="bb-blog-card">
            <Link href={`/blog/${post.slug}`} className="bb-blog-card__img-wrap">
              <Image
                src={thumb}
                alt={isTr ? post.titleTr : post.titleEn}
                className="bb-blog-card__img"
                width={400}
                height={250}
                loading="lazy"
              />
              <span className="bb-blog-card__tag">{isTr ? post.tagTr : post.tagEn}</span>
            </Link>
            <div className="bb-blog-card__body">
              <div className="bb-blog-card__meta">
                <time dateTime={date}>
                  <i className="fa-regular fa-calendar"></i>{" "}
                  {new Date(date).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
                <span>
                  <i className="fa-regular fa-clock"></i> {post.readTime} {isTr ? "dk" : "min"}
                </span>
              </div>
              <h2 className="bb-blog-card__title">
                <Link href={`/blog/${post.slug}`}>
                  {isTr ? post.titleTr : post.titleEn}
                </Link>
              </h2>
              <p className="bb-blog-card__summary">
                {isTr ? post.summaryTr : post.summaryEn}
              </p>
              <Link href={`/blog/${post.slug}`} className="bb-blog-card__read-more">
                {t.readMore} <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default BlogArea;
