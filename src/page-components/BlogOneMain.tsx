import { useTranslation } from "../context/LanguageContext";
import BlogArea from "../components/blogs/blog-one/BlogArea";
import TrustBar from "../components/homes/home-one/TrustBar";
import HeaderOne from "../layouts/headers/HeaderOne";
import FooterOne from "../layouts/footers/FooterOne";

const BlogOneMain = () => {
   const { t } = useTranslation();

   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main>
            <div className="pt-130 pb-80">
               <div className="container">
                  <div className="row justify-content-center mb-40">
                     <div className="col-lg-6 col-md-8 text-center">
                        <h1 className="tg-section-su-title text-capitalize">{t.travelGuide}</h1>
                     </div>
                  </div>
                  <BlogArea />
               </div>
            </div>
         </main>
         <FooterOne />
      </>
   );
};

export default BlogOneMain;
