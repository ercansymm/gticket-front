"use client";

import { useEffect, useState, useMemo } from "react";
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
const PAGE_SIZE = 6;

const getThumb = (post: BlogPost) =>
  post.thumbUrl
    ? post.thumbUrl.startsWith("/uploads/")
      ? `${BACKEND_URL}${post.thumbUrl}`
      : post.thumbUrl
    : "/assets/img/blog/blog-placeholder.jpg";

const formatDate = (dateStr: string, locale: string) =>
  new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const BlogArea = () => {
  const { t, lang } = useTranslation();
  const isTr = lang === "tr";
  const locale = isTr ? "tr-TR" : "en-US";

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetch("/api/blog/public")
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const tags = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const p of posts) {
      const tag = isTr ? p.tagTr : p.tagEn;
      if (tag && !seen.has(tag)) { seen.add(tag); result.push(tag); }
    }
    return result;
  }, [posts, isTr]);

  const filtered = useMemo(() => {
    if (activeTag === "all") return posts;
    return posts.filter((p) => (isTr ? p.tagTr : p.tagEn) === activeTag);
  }, [posts, activeTag, isTr]);

  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1, visibleCount + 1);
  const hasMore = filtered.length > visibleCount + 1;

  if (loading) return <BlogSkeleton />;

  if (posts.length === 0) {
    return (
      <div className="bb-blog-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <p>{isTr ? "Henüz blog yazısı eklenmemiş." : "No blog posts yet."}</p>
      </div>
    );
  }

  return (
    <div className="bb-blog-page">
      {tags.length > 1 && (
        <div className="bb-blog-filters">
          <button
            className={`bb-blog-filter-pill${activeTag === "all" ? " active" : ""}`}
            onClick={() => { setActiveTag("all"); setVisibleCount(PAGE_SIZE); }}
          >
            {isTr ? "Tümü" : "All"}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`bb-blog-filter-pill${activeTag === tag ? " active" : ""}`}
              onClick={() => { setActiveTag(tag); setVisibleCount(PAGE_SIZE); }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {featured && (
        <article className="bb-blog-featured">
          <Link href={`/blog/${featured.slug}`} className="bb-blog-featured__img-wrap">
            <Image
              src={getThumb(featured)}
              alt={isTr ? featured.titleTr : featured.titleEn}
              fill
              className="bb-blog-featured__img"
              priority
            />
            <div className="bb-blog-featured__overlay" />
            <span className="bb-blog-featured__tag">{isTr ? featured.tagTr : featured.tagEn}</span>
          </Link>
          <div className="bb-blog-featured__body">
            <span className="bb-blog-featured__label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {isTr ? "Öne Çıkan" : "Featured"}
            </span>
            <h2 className="bb-blog-featured__title">
              <Link href={`/blog/${featured.slug}`}>
                {isTr ? featured.titleTr : featured.titleEn}
              </Link>
            </h2>
            <p className="bb-blog-featured__summary">
              {isTr ? featured.summaryTr : featured.summaryEn}
            </p>
            <div className="bb-blog-featured__meta">
              <span className="bb-blog-featured__meta-item">
                <CalendarIcon />
                {formatDate(featured.createdAt ?? featured.date, locale)}
              </span>
              <span className="bb-blog-featured__meta-item">
                <ClockIcon />
                {featured.readTime} {isTr ? "dk okuma" : "min read"}
              </span>
            </div>
            <Link href={`/blog/${featured.slug}`} className="bb-blog-featured__cta">
              {isTr ? "Devamını Oku" : "Read More"}
              <ArrowIcon />
            </Link>
          </div>
        </article>
      )}

      {rest.length > 0 && (
        <div className="bb-blog-grid">
          {rest.map((post) => (
            <article key={post.id} className="bb-blog-card">
              <Link href={`/blog/${post.slug}`} className="bb-blog-card__img-wrap">
                <Image
                  src={getThumb(post)}
                  alt={isTr ? post.titleTr : post.titleEn}
                  fill
                  className="bb-blog-card__img"
                  loading="lazy"
                />
                <div className="bb-blog-card__img-overlay" />
                <span className="bb-blog-card__tag">{isTr ? post.tagTr : post.tagEn}</span>
              </Link>
              <div className="bb-blog-card__body">
                <div className="bb-blog-card__meta">
                  <span>
                    <CalendarIcon />
                    {formatDate(post.createdAt ?? post.date, locale)}
                  </span>
                  <span>
                    <ClockIcon />
                    {post.readTime} {isTr ? "dk" : "min"}
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
                  {t.readMore}
                  <ArrowIcon />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="bb-blog-loadmore">
          <button
            className="bb-blog-loadmore__btn"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            {isTr ? "Daha Fazla Yükle" : "Load More"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

const BlogSkeleton = () => (
  <div className="bb-blog-page">
    <div className="bb-blog-featured animate-pulse">
      <div className="bb-blog-featured__img-wrap" style={{ background: "#e2e8f0" }} />
      <div className="bb-blog-featured__body">
        <div style={{ height: 14, background: "#e2e8f0", borderRadius: 8, width: "25%", marginBottom: 18 }} />
        <div style={{ height: 36, background: "#e2e8f0", borderRadius: 8, width: "85%", marginBottom: 10 }} />
        <div style={{ height: 36, background: "#e2e8f0", borderRadius: 8, width: "65%", marginBottom: 20 }} />
        <div style={{ height: 14, background: "#e2e8f0", borderRadius: 6, width: "100%", marginBottom: 8 }} />
        <div style={{ height: 14, background: "#e2e8f0", borderRadius: 6, width: "88%", marginBottom: 8 }} />
        <div style={{ height: 14, background: "#e2e8f0", borderRadius: 6, width: "70%", marginBottom: 28 }} />
        <div style={{ height: 42, background: "#e2e8f0", borderRadius: 8, width: "140px" }} />
      </div>
    </div>
    <div className="bb-blog-grid">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bb-blog-card animate-pulse">
          <div className="bb-blog-card__img-wrap" style={{ background: "#e2e8f0" }} />
          <div className="bb-blog-card__body">
            <div style={{ height: 12, background: "#e2e8f0", borderRadius: 6, width: "55%", marginBottom: 14 }} />
            <div style={{ height: 20, background: "#e2e8f0", borderRadius: 6, width: "90%", marginBottom: 8 }} />
            <div style={{ height: 20, background: "#e2e8f0", borderRadius: 6, width: "70%", marginBottom: 12 }} />
            <div style={{ height: 13, background: "#e2e8f0", borderRadius: 6, width: "100%", marginBottom: 6 }} />
            <div style={{ height: 13, background: "#e2e8f0", borderRadius: 6, width: "80%" }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default BlogArea;
