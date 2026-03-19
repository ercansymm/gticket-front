import Link from "next/link";
import { useTranslation } from "../../context/LanguageContext";
import { blogPosts } from "../../data/BlogData";

/** AtaBilet — SEO odaklı footer. Popüler rotalar internal linking, kurumsal ve yardım linkleri. */
const FooterOne = () => {
   const { t, lang } = useTranslation();
   const isTr = lang === "tr";
   const recentPosts = blogPosts.slice(0, 3);

   return (
      <footer>
         <div className="tg-footer-area tg-footer-su-wrapper tg-footer-space include-bg" style={{ backgroundImage: `url(/assets/img/footer/footer.jpg)` }}>
            <div className="container">
               <div className="tg-footer-top mb-45">
                  <div className="row">
                     {/* Kurumsal */}
                     <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                        <div className="tg-footer-widget mb-40">
                           <div className="tg-footer-logo mb-20">
                              <Link href="/" className="bb-logo bb-logo--white">AtaBilet</Link>
                           </div>
                           <p className="mb-20">{t.footerDesc}</p>
                           <div className="tg-footer-social">
                              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i className="fa-brands fa-twitter"></i></a>
                              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
                           </div>
                        </div>
                     </div>

                     {/* Popüler Rotalar — SEO internal linking */}
                     <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                        <div className="tg-footer-widget tg-footer-link ml-80 mb-40">
                           <h3 className="tg-footer-widget-title mb-25">{t.popularFlightRoutes}</h3>
                           <ul>
                              <li><Link href="/?from=IST&to=AYT">İstanbul Antalya Uçak Bileti</Link></li>
                              <li><Link href="/?from=IST&to=ADB">İstanbul İzmir Uçak Bileti</Link></li>
                              <li><Link href="/?from=ESB&to=IST">Ankara İstanbul Uçak Bileti</Link></li>
                              <li><Link href="/?from=IST&to=TZX">İstanbul Trabzon Uçak Bileti</Link></li>
                              <li><Link href="/?from=IST&to=BJV">İstanbul Bodrum Uçak Bileti</Link></li>
                           </ul>
                        </div>
                     </div>

                     {/* Yardım */}
                     <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                        <div className="tg-footer-widget tg-footer-link mb-40">
                           <h3 className="tg-footer-widget-title mb-25">{t.helpCenter}</h3>
                           <ul>
                              <li><Link href="/faq">{t.faq}</Link></li>
                              <li><Link href="/bilet-sorgula">{t.bookingCheckFooter}</Link></li>
                              <li><Link href="/contact">{t.cancelRefund}</Link></li>
                              <li><Link href="/contact">{t.contact}</Link></li>
                              <li><Link href="/blog">{t.travelGuide}</Link></li>
                              <li><a href="tel:08505550000">{t.supportLineFooter}</a></li>
                           </ul>
                           <h4 className="tg-footer-widget-title mt-20 mb-15">{t.recentPosts}</h4>
                           <ul>
                              {recentPosts.map((post) => (
                                 <li key={post.id}>
                                    <Link href={`/blog/${post.slug}`}>
                                       {isTr ? post.title_tr : post.title_en}
                                    </Link>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>

                     {/* Kurumsal & Güven */}
                     <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                        <div className="tg-footer-widget tg-footer-info mb-40">
                           <h3 className="tg-footer-widget-title mb-25">{t.corporate}</h3>
                           <ul>
                              <li><Link href="/about">{t.aboutUs}</Link></li>
                              <li><Link href="/contact">{t.contact}</Link></li>
                              <li><Link href="#">{t.kvkk}</Link></li>
                              <li><Link href="#">{t.cookiePolicy}</Link></li>
                           </ul>
                           <div className="bb-footer-trust mt-20">
                              <span className="bb-footer-badge"><i className="fa-solid fa-shield-halved"></i> {t.sslSecure}</span>
                              <span className="bb-footer-badge"><i className="fa-solid fa-plane"></i> {t.iataMember}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="tg-footer-copyright text-center">
               <span>
                  © 2025 AtaBilet. {t.allRightsReserved}
               </span>
            </div>
         </div>
      </footer>
   )
}

export default FooterOne
