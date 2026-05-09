import Link from "next/link";
import Logo from "../../components/common/Logo";
import { useTranslation } from "../../context/LanguageContext";

/** AtaBilet — Footer. Trust strip, ikonlu linkler, telefon, kurumsal. */
const FooterOne = () => {
   const { t } = useTranslation();

   return (
      <footer className="bb-footer">

         {/* ── Main columns ── */}
         <div className="bb-footer__main">
            <div className="container">
               <div className="bb-footer__row row">

                  {/* Brand */}
                  <div className="col-lg-3 col-md-6 bb-footer__col">
                     <Logo variant="white" />
                     <p className="bb-footer__brand-desc">{t.footerDesc}</p>
                     <a href="tel:08505550000" className="bb-footer__phone">
                        <i className="fa-solid fa-phone-volume" />
                        0850 555 00 00
                     </a>
                     <div className="bb-footer__social">
                        <a href="https://www.instagram.com/atabiletcom/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                           </svg>
                        </a>
                     </div>
                  </div>

                  {/* Hızlı Erişim */}
                  <div className="col-lg-3 col-md-6 bb-footer__col">
                     <h4 className="bb-footer__title">Hızlı Erişim</h4>
                     <ul className="bb-footer__links">
                        <li><Link href="/"><i className="fa-solid fa-magnifying-glass" />Uçuş Ara</Link></li>
                        <li><Link href="/bilet-sorgula"><i className="fa-solid fa-ticket" />Bilet Sorgula</Link></li>
                        <li><Link href="/check-in"><i className="fa-solid fa-plane-departure" />Online Check-in</Link></li>
                        <li><Link href="/iptal-iade"><i className="fa-solid fa-rotate-left" />İptal &amp; İade</Link></li>
                        <li><Link href="/destek"><i className="fa-solid fa-headset" />Destek Talebi</Link></li>
                     </ul>
                  </div>

                  {/* Popüler Rotalar */}
                  <div className="col-lg-3 col-md-6 bb-footer__col">
                     <h4 className="bb-footer__title">{t.popularFlightRoutes}</h4>
                     <ul className="bb-footer__links">
                        <li><Link href="/?from=IST&to=AYT"><i className="fa-solid fa-plane" />İstanbul – Antalya</Link></li>
                        <li><Link href="/?from=IST&to=ADB"><i className="fa-solid fa-plane" />İstanbul – İzmir</Link></li>
                        <li><Link href="/?from=ESB&to=IST"><i className="fa-solid fa-plane" />Ankara – İstanbul</Link></li>
                        <li><Link href="/?from=IST&to=TZX"><i className="fa-solid fa-plane" />İstanbul – Trabzon</Link></li>
                        <li><Link href="/?from=IST&to=BJV"><i className="fa-solid fa-plane" />İstanbul – Bodrum</Link></li>
                     </ul>
                  </div>

                  {/* Kurumsal */}
                  <div className="col-lg-3 col-md-6 bb-footer__col">
                     <h4 className="bb-footer__title">{t.corporate}</h4>
                     <ul className="bb-footer__links">
                        <li><Link href="/hakkimizda"><i className="fa-solid fa-circle-info" />{t.aboutUs}</Link></li>
                        <li><Link href="/iletisim"><i className="fa-solid fa-envelope" />{t.contact}</Link></li>
                        <li><Link href="/sss"><i className="fa-solid fa-circle-question" />SSS</Link></li>
                        <li><Link href="/blog"><i className="fa-solid fa-newspaper" />Blog</Link></li>
                        <li><Link href="/gizlilik"><i className="fa-solid fa-user-shield" />{t.kvkk}</Link></li>
                        <li><Link href="/gizlilik#cerez"><i className="fa-solid fa-cookie-bite" />{t.cookiePolicy}</Link></li>
                     </ul>
                  </div>

               </div>
            </div>
         </div>

         {/* ── Bottom bar ── */}
         <div className="bb-footer__bottom">
            <div className="container">
               <div className="bb-footer__bottom-inner">
                  <span>© {new Date().getFullYear()} AtaBilet. {t.allRightsReserved}</span>
                  <div className="bb-footer__bottom-links">
                     <Link href="/gizlilik">Gizlilik Politikası</Link>
                     <span>·</span>
                     <Link href="/kullanim-sartlari">Kullanım Şartları</Link>
                  </div>
               </div>
            </div>
         </div>

      </footer>
   );
};

export default FooterOne;
