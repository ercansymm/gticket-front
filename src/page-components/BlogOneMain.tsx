"use client";

import BlogArea from "../components/blogs/blog-one/BlogArea";
import TrustBar from "../components/homes/home-one/TrustBar";
import HeaderOne from "../layouts/headers/HeaderOne";
import FooterOne from "../layouts/footers/FooterOne";
import { useTranslation } from "../context/LanguageContext";

const BlogOneMain = () => {
  const { lang } = useTranslation();
  const isTr = lang === "tr";

  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main>
        <section className="bb-blog-hero">
          <div className="bb-blog-hero__dots" aria-hidden="true" />
          <div className="container">
            <div className="bb-blog-hero__content">
              <span className="bb-blog-hero__badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                {isTr ? "Seyahat Blogu" : "Travel Blog"}
              </span>
              <h1 className="bb-blog-hero__title">
                {isTr ? "Seyahat Rehberiniz" : "Your Travel Guide"}
              </h1>
              <p className="bb-blog-hero__subtitle">
                {isTr
                  ? "En iyi seyahat ipuçları, destinasyon rehberleri ve ucuz uçuş stratejileri"
                  : "Best travel tips, destination guides and budget flight strategies"}
              </p>
              <div className="bb-blog-hero__stats">
                <div className="bb-blog-hero__stat">
                  <strong>50+</strong>
                  <span>{isTr ? "Makale" : "Articles"}</span>
                </div>
                <div className="bb-blog-hero__stat-sep" />
                <div className="bb-blog-hero__stat">
                  <strong>10+</strong>
                  <span>{isTr ? "Destinasyon" : "Destinations"}</span>
                </div>
                <div className="bb-blog-hero__stat-sep" />
                <div className="bb-blog-hero__stat">
                  <strong>5K+</strong>
                  <span>{isTr ? "Okuyucu" : "Readers"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bb-blog-hero__wave" aria-hidden="true">
            <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0 36 C480 72 960 0 1440 36 L1440 72 L0 72 Z" fill="#F8FAFC" />
            </svg>
          </div>
        </section>

        <section className="bb-blog-page-section">
          <div className="container">
            <BlogArea />
          </div>
        </section>
      </main>
      <FooterOne />
    </>
  );
};

export default BlogOneMain;
