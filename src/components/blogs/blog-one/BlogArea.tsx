import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "../../../data/BlogData";
import { useTranslation } from "../../../context/LanguageContext";

const BlogArea = () => {
   const { t, lang } = useTranslation();
   const isTr = lang === "tr";

   return (
      <div className="bb-blog-grid">
         {blogPosts.map((post) => (
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
                  <h2 className="bb-blog-card__title">
                     <Link href={`/blog/${post.slug}`}>
                        {isTr ? post.title_tr : post.title_en}
                     </Link>
                  </h2>
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
   );
};

export default BlogArea;
