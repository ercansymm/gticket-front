import Link from "next/link";
import { useTranslation } from "../../../context/LanguageContext";
import { blogPosts } from "../../../data/BlogData";

const Blog = ({ style: _style }: { style?: boolean }) => {
   const { t, lang } = useTranslation();
   const isTr = lang === "tr";
   const latestPosts = blogPosts.slice(0, 3);

   return (
      <section aria-label={t.travelGuide} className="bb-section">
         <div className="container">
            <div className="text-center mb-40">
               <h2 className="bb-section-title">{t.travelGuide}</h2>
            </div>
            <div className="row">
               {latestPosts.map((post) => (
                  <div key={post.id} className="col-xl-4 col-lg-6 col-md-6">
                     <article className="tg-blog-item tg-blog-2-item mb-25">
                        <div className="tg-blog-thumb p-relative fix mb-25">
                           <Link href={`/blog/${post.slug}`}>
                              <img
                                 className="w-100"
                                 src={post.thumb}
                                 alt={isTr ? post.title_tr : post.title_en}
                                 loading="lazy"
                                 width={370}
                                 height={250}
                              />
                           </Link>
                        </div>
                        <div className="tg-blog-content p-relative">
                           <h3 className="tg-blog-title mb-15">
                              <Link href={`/blog/${post.slug}`}>
                                 {isTr ? post.title_tr : post.title_en}
                              </Link>
                           </h3>
                           <p className="bb-blog-summary">
                              {isTr ? post.summary_tr : post.summary_en}
                           </p>
                           <div className="tg-blog-date mt-10">
                              <time dateTime={post.date}>
                                 <i className="fa-light fa-calendar"></i> {post.date}
                              </time>
                           </div>
                           <Link href={`/blog/${post.slug}`} className="bb-read-more mt-10">
                              {t.readMore} <i className="fa-solid fa-arrow-right"></i>
                           </Link>
                        </div>
                     </article>
                  </div>
               ))}
            </div>
            <div className="text-center mt-20">
               <Link href="/blog" className="tg-btn tg-btn-switch-animation bb-btn-primary">
                  <span>{t.viewAll}</span>
               </Link>
            </div>
         </div>
      </section>
   );
};

export default Blog;
