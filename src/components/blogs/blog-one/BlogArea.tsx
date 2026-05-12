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

const BlogArea = () => {
  const { t, lang } = useTranslation();
  const isTr = lang === "tr";
  const [posts, setPosts] = useState<ApiBlogPost[]>([]);

  useEffect(() => {
    fetch("/api/blog/public")
      .then((r) => r.json())
      .then((data) => setPosts(data.posts ?? []))
      .catch(() => setPosts([]));
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (posts.length === 0) return null;

  return (
    <div className="bb-blog-grid">
      {posts.map((post) => (
        <article key={post.id} className="bb-blog-card">
          <Link href={`/blog/${post.slug}`} className="bb-blog-card__img-wrap">
            {thumbSrc(post.thumbUrl) && (
              <Image
                src={thumbSrc(post.thumbUrl)!}
                alt={isTr ? post.titleTr : post.titleEn}
                className="bb-blog-card__img"
                width={400}
                height={260}
                loading="lazy"
                unoptimized={isUpload(post.thumbUrl)}
              />
            )}
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
      ))}
    </div>
  );
};

export default BlogArea;
