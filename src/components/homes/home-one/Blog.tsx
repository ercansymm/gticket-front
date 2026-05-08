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

  const [featured, ...sidePosts] = posts;

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

        <div className="bb-blog-feature-grid">
          {featured && (
            <article className="bb-blog-feature">
              <Link href={`/blog/${featured.slug}`} className="bb-blog-feature__img-wrap">
                {thumbSrc(featured.thumbUrl) && (
                  <Image
                    src={thumbSrc(featured.thumbUrl)!}
                    alt={isTr ? featured.titleTr : featured.titleEn}
                    className="bb-blog-feature__img"
                    fill
                    sizes="(max-width: 992px) 100vw, 60vw"
                    loading="lazy"
                  />
                )}
                <span className="bb-blog-card__tag">{isTr ? featured.tagTr : featured.tagEn}</span>
              </Link>
              <div className="bb-blog-feature__body">
                <div className="bb-blog-card__meta">
                  <time dateTime={featured.createdAt}>
                    <i className="fa-regular fa-calendar"></i> {formatDate(featured.createdAt)}
                  </time>
                  <span>
                    <i className="fa-regular fa-clock"></i> {featured.readTime} {isTr ? "dk" : "min"}
                  </span>
                </div>
                <h3 className="bb-blog-feature__title">
                  <Link href={`/blog/${featured.slug}`}>
                    {isTr ? featured.titleTr : featured.titleEn}
                  </Link>
                </h3>
                <p className="bb-blog-feature__summary">
                  {isTr ? featured.summaryTr : featured.summaryEn}
                </p>
                <Link href={`/blog/${featured.slug}`} className="bb-blog-card__read-more">
                  {t.readMore} <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </article>
          )}

          <div className="bb-blog-side-list">
            {sidePosts.map((post) => (
              <article key={post.id} className="bb-blog-side-card">
                <Link href={`/blog/${post.slug}`} className="bb-blog-side-card__img-wrap">
                  {thumbSrc(post.thumbUrl) && (
                    <Image
                      src={thumbSrc(post.thumbUrl)!}
                      alt={isTr ? post.titleTr : post.titleEn}
                      className="bb-blog-side-card__img"
                      fill
                      sizes="140px"
                      loading="lazy"
                    />
                  )}
                </Link>
                <div className="bb-blog-side-card__body">
                  <span className="bb-blog-side-card__tag">{isTr ? post.tagTr : post.tagEn}</span>
                  <h3 className="bb-blog-side-card__title">
                    <Link href={`/blog/${post.slug}`}>
                      {isTr ? post.titleTr : post.titleEn}
                    </Link>
                  </h3>
                  <div className="bb-blog-side-card__meta">
                    <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                    <span>·</span>
                    <span>{post.readTime} {isTr ? "dk" : "min"}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
