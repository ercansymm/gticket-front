"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import FooterOne from "../../../layouts/footers/FooterOne";
import TrustBar from "../../../components/homes/home-one/TrustBar";
import { useTranslation } from "../../../context/LanguageContext";
import type { ApiBlogPost } from "../../../types/blog";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const thumbSrc = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
};

interface Props {
  post: ApiBlogPost;
}

const BlogDetailsClient = ({ post }: Props) => {
  const { lang } = useTranslation();
  const isTr = lang === "tr";
  const [related, setRelated] = useState<ApiBlogPost[]>([]);

  useEffect(() => {
    fetch("/api/blog/public")
      .then((r) => r.json())
      .then((data) =>
        setRelated(
          (data.posts ?? []).filter((p: ApiBlogPost) => p.slug !== post.slug).slice(0, 5)
        )
      )
      .catch(() => setRelated([]));
  }, [post.slug]);

  const title = isTr ? post.titleTr : post.titleEn;
  const content = isTr ? post.contentTr : post.contentEn;
  const tag = isTr ? post.tagTr : post.tagEn;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatDateShort = (date: string) =>
    new Date(date).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main className="bb-blog-detail-page">

        {/* ── Hero: koyu gradient, beyaz başlık ── */}
        <div className="bb-blog-detail__hero">
          <div className="container">
            <nav className="bb-blog-detail__breadcrumb">
              <Link href="/">{isTr ? "Ana Sayfa" : "Home"}</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: 10 }}></i>
              <Link href="/blog">Blog</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: 10 }}></i>
              <span>{tag}</span>
            </nav>
            <div className="bb-blog-detail__hero-content">
              <span className="bb-blog-detail__tag">{tag}</span>
              <h1 className="bb-blog-detail__title">{title}</h1>
              <div className="bb-blog-detail__meta">
                <span className="bb-blog-detail__meta-item">
                  <i className="fa-regular fa-calendar"></i>
                  <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
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

        {/* ── İçerik: makale + sidebar ── */}
        <div className="container">
          <div className="bb-blog-detail__layout">

            <article className="bb-blog-detail__article">
              {thumbSrc(post.thumbUrl) && (
                <div className="bb-blog-detail__img-wrap">
                  <Image
                    src={thumbSrc(post.thumbUrl)!}
                    alt={title}
                    className="bb-blog-detail__image"
                    width={900}
                    height={480}
                    priority
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              )}

              <div
                className="bb-blog-detail__content"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              <div className="bb-blog-detail__footer">
                <Link href="/blog" className="bb-blog-detail__back-btn">
                  <i className="fa-solid fa-arrow-left"></i>
                  {isTr ? "Blog'a Dön" : "Back to Blog"}
                </Link>
              </div>
            </article>

            {related.length > 0 && (
              <aside className="bb-blog-detail__sidebar">
                <div className="bb-blog-sidebar__card">
                  <h3 className="bb-blog-sidebar__title">
                    {isTr ? "Diğer Yazılar" : "More Articles"}
                  </h3>
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/blog/${item.slug}`}
                      className="bb-blog-sidebar__item"
                    >
                      <div
                        className="bb-blog-sidebar__thumb"
                        style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}
                      >
                        {thumbSrc(item.thumbUrl) && (
                          <Image
                            src={thumbSrc(item.thumbUrl)!}
                            alt={isTr ? item.titleTr : item.titleEn}
                            fill
                            sizes="80px"
                            style={{ objectFit: "cover" }}
                          />
                        )}
                      </div>
                      <div>
                        <div className="bb-blog-sidebar__item-title">
                          {isTr ? item.titleTr : item.titleEn}
                        </div>
                        <div className="bb-blog-sidebar__item-date">
                          {formatDateShort(item.createdAt)}
                          {" · "}
                          {item.readTime} {isTr ? "dk" : "min"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </aside>
            )}

          </div>
        </div>

      </main>
      <FooterOne />
    </>
  );
};

export default BlogDetailsClient;
