"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  contentTr: string;
  contentEn: string;
  thumbUrl: string | null;
  tagTr: string;
  tagEn: string;
  author: string;
  readTime: number;
  createdAt: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const BlogDetailsArea = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useTranslation();
  const isTr = lang === "tr";

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/blog/public/${slug}`)
      .then(async (r) => {
        if (!r.ok) { setNotFound(true); return; }
        const data: BlogPost = await r.json();
        setPost(data);

        // Related posts
        fetch("/api/blog/public")
          .then((r2) => r2.json())
          .then((all: BlogPost[]) => {
            setRelated(all.filter((p) => p.id !== data.id).slice(0, 2));
          })
          .catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="bb-blog-detail animate-pulse" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="container">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="bb-blog-detail" style={{ textAlign: "center", paddingTop: 60, paddingBottom: 60 }}>
        <h1>{isTr ? "Yazı bulunamadı" : "Post not found"}</h1>
        <p>{isTr ? "Aradığınız blog yazısı mevcut değil." : "The blog post you are looking for does not exist."}</p>
        <Link href="/blog" className="bb-blog-detail__back-btn">
          <i className="fa-solid fa-arrow-left"></i> {isTr ? "Blog'a Dön" : "Back to Blog"}
        </Link>
      </div>
    );
  }

  const title = isTr ? post.titleTr : post.titleEn;
  const content = isTr ? post.contentTr : post.contentEn;
  const tag = isTr ? post.tagTr : post.tagEn;

  const thumb = post.thumbUrl
    ? post.thumbUrl.startsWith("/uploads/")
      ? `${BACKEND_URL}${post.thumbUrl}`
      : post.thumbUrl
    : null;

  return (
    <div className="bb-blog-detail-page">
      {/* Hero banner */}
      <div className="bb-blog-detail__hero">
        <div className="container">
          <Link href="/blog" className="bb-blog-detail__breadcrumb">
            <i className="fa-solid fa-arrow-left"></i> {t.travelGuide}
          </Link>
          <div className="bb-blog-detail__hero-content">
            <span className="bb-blog-detail__tag">{tag}</span>
            <h1 className="bb-blog-detail__title">{title}</h1>
            <div className="bb-blog-detail__meta">
              <span className="bb-blog-detail__meta-item">
                <i className="fa-regular fa-calendar"></i>
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </span>
              <span className="bb-blog-detail__meta-item">
                <i className="fa-regular fa-clock"></i>
                {post.readTime} {isTr ? "dk okuma" : "min read"}
              </span>
              <span className="bb-blog-detail__meta-item">
                <i className="fa-regular fa-user"></i>
                {post.author}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="container">
        <div className="bb-blog-detail__layout">
          <article className="bb-blog-detail__article">
            {thumb && (
              <div className="bb-blog-detail__img-wrap">
                <Image
                  src={thumb}
                  alt={title}
                  className="bb-blog-detail__image"
                  width={800}
                  height={450}
                  priority
                />
              </div>
            )}

            <div
              className="bb-blog-detail__content"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            <div className="bb-blog-detail__footer">
              <div className="bb-blog-detail__footer-tags">
                <i className="fa-solid fa-tag"></i>
                <span>{tag}</span>
              </div>
              <Link href="/blog" className="bb-blog-detail__back-btn">
                <i className="fa-solid fa-arrow-left"></i> {t.travelGuide}
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="bb-blog-detail__sidebar">
            <div className="bb-blog-sidebar__card">
              <h3 className="bb-blog-sidebar__title">
                {isTr ? "Diğer Yazılar" : "Other Posts"}
              </h3>
              {related.map((r) => {
                const rThumb = r.thumbUrl
                  ? r.thumbUrl.startsWith("/uploads/")
                    ? `${BACKEND_URL}${r.thumbUrl}`
                    : r.thumbUrl
                  : "/assets/img/blog/blog-placeholder.jpg";
                return (
                  <Link key={r.id} href={`/blog/${r.slug}`} className="bb-blog-sidebar__item">
                    <Image
                      src={rThumb}
                      alt={isTr ? r.titleTr : r.titleEn}
                      width={80}
                      height={56}
                      className="bb-blog-sidebar__thumb"
                    />
                    <div>
                      <h4 className="bb-blog-sidebar__item-title">
                        {isTr ? r.titleTr : r.titleEn}
                      </h4>
                      <span className="bb-blog-sidebar__item-date">
                        {new Date(r.createdAt).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailsArea;
