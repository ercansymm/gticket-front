import Link from "next/link";
import Logo from "../../components/common/Logo";
import { useTranslation } from "../../context/LanguageContext";

/** AtaBilet — Professional footer. Dark gradient, 4 columns, responsive grid. */
const FooterOne = () => {
   const { t } = useTranslation();

   return (
      <footer className="bb-footer">
         <div className="bb-footer__main">
            <div className="container">
               <div className="bb-footer__row row">
                  {/* Brand / Logo */}
                  <div className="col-lg-3 col-md-6 bb-footer__col">
                     <Logo variant="white" />
                     <p className="bb-footer__brand-desc">{t.footerDesc}</p>
                     <div className="bb-footer__social">
                        <a href="https://www.instagram.com/atabiletcom/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                     </div>
                  </div>

                  {/* Popüler Rotalar */}
                  <div className="col-lg-3 col-md-6 bb-footer__col">
                     <h4 className="bb-footer__title">{t.popularFlightRoutes}</h4>
                     <ul className="bb-footer__links">
                        <li><Link href="/?from=IST&to=AYT">İstanbul Antalya Uçak Bileti</Link></li>
                        <li><Link href="/?from=IST&to=ADB">İstanbul İzmir Uçak Bileti</Link></li>
                        <li><Link href="/?from=ESB&to=IST">Ankara İstanbul Uçak Bileti</Link></li>
                        <li><Link href="/?from=IST&to=TZX">İstanbul Trabzon Uçak Bileti</Link></li>
                        <li><Link href="/?from=IST&to=BJV">İstanbul Bodrum Uçak Bileti</Link></li>
                     </ul>
                  </div>

                  {/* Yardım */}
                  <div className="col-lg-3 col-md-6 bb-footer__col">
                     <h4 className="bb-footer__title">{t.helpCenter}</h4>
                     <ul className="bb-footer__links">
                        <li><Link href="/faq">{t.faq}</Link></li>
                        <li><Link href="/bilet-sorgula">{t.bookingCheckFooter}</Link></li>
                        <li><Link href="/contact">{t.cancelRefund}</Link></li>
                        <li><Link href="/contact">{t.contact}</Link></li>
                        <li><Link href="/blog">{t.travelGuide}</Link></li>
                        <li><a href="tel:08505550000">{t.supportLineFooter}</a></li>
                     </ul>
                  </div>

                  {/* Kurumsal & Güven */}
                  <div className="col-lg-3 col-md-6 bb-footer__col">
                     <h4 className="bb-footer__title">{t.corporate}</h4>
                     <ul className="bb-footer__links">
                        <li><Link href="/about">{t.aboutUs}</Link></li>
                        <li><Link href="/contact">{t.contact}</Link></li>
                        <li><Link href="#">{t.kvkk}</Link></li>
                        <li><Link href="#">{t.cookiePolicy}</Link></li>
                     </ul>
                     <div className="bb-footer-trust">
                        <span className="bb-footer-badge"><i className="fa-solid fa-shield-halved"></i> {t.sslSecure}</span>
                        <span className="bb-footer-badge"><i className="fa-solid fa-plane"></i> {t.iataMember}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="bb-footer__bottom">
            <div className="container">
               <span>© {new Date().getFullYear()} AtaBilet. {t.allRightsReserved}</span>
            </div>
         </div>
      </footer>
   )
}

export default FooterOne
