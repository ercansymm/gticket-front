import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "../../../context/LanguageContext";
import { blogPosts } from "../../../data/BlogData";

const Blog = ({ style: _style }: { style?: boolean }) => {
   const { t, lang } = useTranslation();
   const isTr = lang === "tr";
   const latestPosts = blogPosts.slice(0, 3);
   const [featured, ...sidePosts] = latestPosts;

   const formatDate = (date: string) =>
      new Date(date).toLocaleDateString(isTr ? 'tr-TR' : 'en-US', {
         day: 'numeric',
         month: 'short',
         year: 'numeric',
      });

   return (
      <section aria-label={t.travelGuide} className="bb-section bb-blog-section">
         <div className="container">
            <div className="bb-blog-section__header">
               <div>
                  <span className="bb-section-eyebrow">{isTr ? 'Blog' : 'Blog'}</span>
                  <h2 className="bb-section-title">{t.travelGuide}</h2>
                  <p className="bb-section-subtitle">
                     {isTr
                        ? 'Seyahat ipuçları, ucuz bilet rehberleri ve popüler rota önerileri.'
                        : 'Travel tips, cheap ticket guides and popular route suggestions.'}
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
                        <Image
                           src={featured.thumb}
                           alt={isTr ? featured.title_tr : featured.title_en}
                           className="bb-blog-feature__img"
                           fill
                           sizes="(max-width: 992px) 100vw, 60vw"
                           loading="lazy"
                        />
                        <span className="bb-blog-card__tag">{isTr ? featured.tag_tr : featured.tag_en}</span>
                     </Link>
                     <div className="bb-blog-feature__body">
                        <div className="bb-blog-card__meta">
                           <time dateTime={featured.date}>
                              <i className="fa-regular fa-calendar"></i> {formatDate(featured.date)}
                           </time>
                           <span><i className="fa-regular fa-clock"></i> {featured.readTime} {isTr ? 'dk' : 'min'}</span>
                        </div>
                        <h3 className="bb-blog-feature__title">
                           <Link href={`/blog/${featured.slug}`}>
                              {isTr ? featured.title_tr : featured.title_en}
                           </Link>
                        </h3>
                        <p className="bb-blog-feature__summary">
                           {isTr ? featured.summary_tr : featured.summary_en}
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
                           <Image
                              src={post.thumb}
                              alt={isTr ? post.title_tr : post.title_en}
                              className="bb-blog-side-card__img"
                              width={240}
                              height={180}
                              loading="lazy"
                           />
                        </Link>
                        <div className="bb-blog-side-card__body">
                           <span className="bb-blog-side-card__tag">{isTr ? post.tag_tr : post.tag_en}</span>
                           <h3 className="bb-blog-side-card__title">
                              <Link href={`/blog/${post.slug}`}>
                                 {isTr ? post.title_tr : post.title_en}
                              </Link>
                           </h3>
                           <div className="bb-blog-side-card__meta">
                              <time dateTime={post.date}>{formatDate(post.date)}</time>
                              <span>·</span>
                              <span>{post.readTime} {isTr ? 'dk' : 'min'}</span>
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
