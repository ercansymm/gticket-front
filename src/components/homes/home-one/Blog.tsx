"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslation } from "../../../context/LanguageContext";
import type { ApiBlogPost } from "../../../types/blog";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const thumbSrc = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
};
const isUpload = (url: string | null) => url?.startsWith("/uploads/") ?? false;

const Blog = ({ style: _style }: { style?: boolean }) => {
  const { t, lang } = useTranslation();
  const isTr = lang === "tr";
  const [posts, setPosts] = useState<ApiBlogPost[]>([]);

  useEffect(() => {
    fetch("/api/blog/public")
      .then((r) => r.json())
      .then((data) => setPosts((data.posts ?? []).slice(0, 3)))
      .catch(() => setPosts([]));
  }, []);

  if (posts.length === 0) return null;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <section aria-label={t.travelGuide} className="bb-section bb-blog-section">
      <div className="container">
        <div className="bb-blog-section__header">
          <div>
            <span className="bb-section-eyebrow">Blog</span>
            <h2 className="bb-section-title">{t.travelGuide}</h2>
            <p className="bb-section-subtitle">
              {isTr
                ? "Seyahat ipuçları, ucuz bilet rehberleri ve popüler rota önerileri."
                : "Travel tips, cheap ticket guides and popular route suggestions."}
            </p>
          </div>
          <Link href="/blog" className="bb-blog-section__all-link">
            {t.viewAll} <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        <div className="bb-blog-grid">
          {posts.map((post) => {
            const src = thumbSrc(post.thumbUrl);
            return (
              <article key={post.id} className="bb-blog-card">
                <Link href={`/blog/${post.slug}`} className="bb-blog-card__img-wrap">
                  {src ? (
                    <Image
                      src={src}
                      alt={isTr ? post.titleTr : post.titleEn}
                      className="bb-blog-card__img"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                      loading="lazy"
                      unoptimized={isUpload(post.thumbUrl)}
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: "#e2e8f0" }} />
                  )}
                  <div className="bb-blog-card__img-overlay" />
                  <span className="bb-blog-card__tag">{isTr ? post.tagTr : post.tagEn}</span>
                </Link>
                <div className="bb-blog-card__body">
                  <div className="bb-blog-card__meta">
                    <time dateTime={post.createdAt}>
                      <i className="fa-regular fa-calendar"></i> {formatDate(post.createdAt)}
                    </time>
                    <span>
                      <i className="fa-regular fa-clock"></i> {post.readTime} {isTr ? "dk" : "min"}
                    </span>
                  </div>
                  <h3 className="bb-blog-card__title">
                    <Link href={`/blog/${post.slug}`}>
                      {isTr ? post.titleTr : post.titleEn}
                    </Link>
                  </h3>
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
      </div>
    </section>
  );
};

export default Blog;
