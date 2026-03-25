import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "../../../context/LanguageContext";
import { blogPosts } from "../../../data/BlogData";

const Blog = ({ style: _style }: { style?: boolean }) => {
   const { t, lang } = useTranslation();
   const isTr = lang === "tr";
   const latestPosts = blogPosts.slice(0, 3);

   return (
      <section aria-label={t.travelGuide} className="bb-section bb-blog-section">
         <div className="container">
            <div className="bb-blog-section__header">
               <div>
                  <span className="bb-blog-section__badge">
                     <i className="fa-solid fa-compass"></i> {isTr ? 'Blog' : 'Blog'}
                  </span>
                  <h2 className="bb-section-title">{t.travelGuide}</h2>
                  <p className="bb-blog-section__subtitle">
                     {isTr
                        ? 'Seyahat ipuçları, ucuz bilet rehberleri ve popüler rota önerileri'
                        : 'Travel tips, cheap ticket guides and popular route suggestions'}
                  </p>
               </div>
               <Link href="/blog" className="bb-blog-section__all-link">
                  {t.viewAll} <i className="fa-solid fa-arrow-right"></i>
               </Link>
            </div>
            <div className="bb-blog-grid">
               {latestPosts.map((post) => (
                  <article key={post.id} className="bb-blog-card">
                     <Link href={`/blog/${post.slug}`} className="bb-blog-card__img-wrap">
                        <Image
                           src={post.thumb}
                           alt={isTr ? post.title_tr : post.title_en}
                           className="bb-blog-card__img"
                           width={400}
                           height={250}
                           loading="lazy"
                        />
                        <span className="bb-blog-card__tag">{isTr ? post.tag_tr : post.tag_en}</span>
                     </Link>
                     <div className="bb-blog-card__body">
                        <div className="bb-blog-card__meta">
                           <time dateTime={post.date}>
                              <i className="fa-regular fa-calendar"></i>{' '}
                              {new Date(post.date).toLocaleDateString(isTr ? 'tr-TR' : 'en-US', {
                                 day: 'numeric',
                                 month: 'short',
                                 year: 'numeric',
                              })}
                           </time>
                           <span><i className="fa-regular fa-clock"></i> {post.readTime} {isTr ? 'dk' : 'min'}</span>
                        </div>
                        <h3 className="bb-blog-card__title">
                           <Link href={`/blog/${post.slug}`}>
                              {isTr ? post.title_tr : post.title_en}
                           </Link>
                        </h3>
                        <p className="bb-blog-card__summary">
                           {isTr ? post.summary_tr : post.summary_en}
                        </p>
                        <Link href={`/blog/${post.slug}`} className="bb-blog-card__read-more">
                           {t.readMore} <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                     </div>
                  </article>
               ))}
            </div>
         </div>
      </section>
   );
};

export default Blog;
