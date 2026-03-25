import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "../../../data/BlogData";
import { useTranslation } from "../../../context/LanguageContext";

const BlogDetailsArea = () => {
   const { slug } = useParams<{ slug: string }>();
   const { t, lang } = useTranslation();
   const isTr = lang === "tr";

   const post = blogPosts.find(p => p.slug === slug);

   if (!post) {
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

   const title = isTr ? post.title_tr : post.title_en;
   const content = isTr ? post.content_tr : post.content_en;
   const tag = isTr ? post.tag_tr : post.tag_en;

   // Related posts (same tag, exclude current)
   const related = blogPosts
      .filter(p => p.id !== post.id)
      .slice(0, 2);

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
                        <time dateTime={post.date}>
                           {new Date(post.date).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
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
                  {post.thumb && (
                     <div className="bb-blog-detail__img-wrap">
                        <Image
                           src={post.thumb}
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

                  {/* Share & tags */}
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
                        {isTr ? 'Diğer Yazılar' : 'Other Posts'}
                     </h3>
                     {related.map(r => (
                        <Link key={r.id} href={`/blog/${r.slug}`} className="bb-blog-sidebar__item">
                           <Image
                              src={r.thumb}
                              alt={isTr ? r.title_tr : r.title_en}
                              width={80}
                              height={56}
                              className="bb-blog-sidebar__thumb"
                           />
                           <div>
                              <h4 className="bb-blog-sidebar__item-title">
                                 {isTr ? r.title_tr : r.title_en}
                              </h4>
                              <span className="bb-blog-sidebar__item-date">
                                 {new Date(r.date).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
                                    day: 'numeric',
                                    month: 'short',
                                 })}
                              </span>
                           </div>
                        </Link>
                     ))}
                  </div>
               </aside>
            </div>
         </div>
      </div>
   );
};

export default BlogDetailsArea;
