import Link from "next/link";
import { blogPosts } from "../../../data/BlogData";
import { useTranslation } from "../../../context/LanguageContext";

const BlogArea = () => {
   const { t, lang } = useTranslation();
   const isTr = lang === "tr";

   return (
      <div className="row">
         {blogPosts.map((post) => (
            <article key={post.id} className="col-xl-4 col-lg-6 col-md-6 mb-30">
               <div className="tg-blog-grid-item">
                  <div className="tg-blog-standard-thumb mb-15">
                     <Link href={`/blog/${post.slug}`}>
                        <img
                           className="w-100"
                           src={post.thumb}
                           alt={isTr ? post.title_tr : post.title_en}
                           loading="lazy"
                        />
                     </Link>
                  </div>
                  <div className="tg-blog-standard-content">
                     <span className="bb-blog-detail__tag">
                        {isTr ? post.tag_tr : post.tag_en}
                     </span>
                     <h2 className="tg-blog-standard-title">
                        <Link href={`/blog/${post.slug}`}>
                           {isTr ? post.title_tr : post.title_en}
                        </Link>
                     </h2>
                     <div className="tg-blog-standard-date mb-10">
                        <time dateTime={post.date}>
                           <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.76501 0.777771V3.26668M4.23413 0.777771V3.26668M0.777344 5.75548H13.2218M2.16006 2.02211H11.8391C12.6027 2.02211 13.2218 2.57927 13.2218 3.26656V11.9778C13.2218 12.6651 12.6027 13.2222 11.8391 13.2222H2.16006C1.39641 13.2222 0.777344 12.6651 0.777344 11.9778V3.26656C0.777344 2.57927 1.39641 2.02211 2.16006 2.02211Z" stroke="#E30A17" strokeWidth="0.977778" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>
                           {" "}{post.date}
                        </time>
                        <span> · {post.readTime} {t.minRead}</span>
                     </div>
                     <p className="mb-20 tg-blog-standard-para">
                        {isTr ? post.summary_tr : post.summary_en}
                     </p>
                     <Link href={`/blog/${post.slug}`} className="tg-btn tg-btn-switch-animation bb-btn-primary">
                        <span>{t.readMore}</span>
                     </Link>
                  </div>
               </div>
            </article>
         ))}
      </div>
   );
};

export default BlogArea;
