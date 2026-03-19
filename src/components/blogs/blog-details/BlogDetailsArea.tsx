import { useParams } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "../../../data/BlogData";
import { useTranslation } from "../../../context/LanguageContext";

const BlogDetailsArea = () => {
   const { slug } = useParams<{ slug: string }>();
   const { t, lang } = useTranslation();

   const post = blogPosts.find(p => p.slug === slug);

   if (!post) {
      return (
         <div className="bb-blog-detail" style={{ textAlign: "center", paddingTop: 60, paddingBottom: 60 }}>
            <h1>{lang === "tr" ? "Yazı bulunamadı" : "Post not found"}</h1>
            <p>{lang === "tr" ? "Aradığınız blog yazısı mevcut değil." : "The blog post you are looking for does not exist."}</p>
            <Link href="/blog" className="tg-btn tg-btn-switch-animation" style={{ display: "inline-block", marginTop: 20 }}>
               {lang === "tr" ? "Blog'a Dön" : "Back to Blog"}
            </Link>
         </div>
      );
   }

   const title = lang === "tr" ? post.title_tr : post.title_en;
   const content = lang === "tr" ? post.content_tr : post.content_en;
   const tag = lang === "tr" ? post.tag_tr : post.tag_en;

   return (
      <div className="pt-130 pb-80">
         <div className="container">
            <article className="bb-blog-detail">
               <header>
                  <span className="bb-blog-detail__tag">{tag}</span>
                  <h1 className="bb-blog-detail__title">{title}</h1>
                  <div className="bb-blog-detail__meta">
                     <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
                           year: "numeric",
                           month: "long",
                           day: "numeric",
                        })}
                     </time>
                     <span>{post.readTime} {lang === "tr" ? "dk okuma" : "min read"}</span>
                     <span>{post.author}</span>
                  </div>
               </header>

               {post.thumb && (
                  <img
                     src={post.thumb}
                     alt={title}
                     className="bb-blog-detail__image"
                     width={800}
                     height={450}
                     loading="eager"
                  />
               )}

               <div
                  className="bb-blog-detail__content"
                  dangerouslySetInnerHTML={{ __html: content }}
               />

               <footer className="bb-blog-detail__footer">
                  <Link href="/blog" className="bb-blog-detail__back">
                     <i className="fa-solid fa-arrow-left"></i> {t.travelGuide}
                  </Link>
               </footer>
            </article>
         </div>
      </div>
   );
};

export default BlogDetailsArea;
