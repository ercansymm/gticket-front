"use client";

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
                     <a href="tel:08503020282" className="bb-footer__phone">
                        <i className="fa-solid fa-phone-volume" />
                        0850 302 0282
                     </a>
                     {/* TÜRSAB + ETBİS QR'lari yan yana — orijinal TÜRSAB konumu ve telefonla mesafesi korunur */}
                     <div className="bb-footer__certs">
                        {/* TÜRSAB Dijital Doğrulama Sistemi (DDS) — referrer header ile doğrulama yapılır, rel="noreferrer" KOYMA */}
                        <a
                           href="https://www.tursab.org.tr/tr/ddsv"
                           target="_blank"
                           rel="noopener nofollow"
                           aria-label="TÜRSAB Dijital Doğrulama Sistemi"
                           className="bb-footer__tursab-dds"
                        >
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img
                              src="/images/tursab-dds-18474.webp"
                              alt="TÜRSAB DDS Belge No: 18474"
                              width={120}
                              height={120}
                           />
                        </a>
                        {/* ETBİS — Elektronik Ticaret Bilgi Sistemi (T.C. Ticaret Bakanlığı) */}
                        <a
                           href="https://etbis.ticaret.gov.tr/tr/SiteSorgulamaSonuc?siteId=be0ca649-1625-4956-8081-c66ed8073fb7"
                           target="_blank"
                           rel="noopener nofollow"
                           aria-label="ETBİS Kayıt Belgesi"
                           className="bb-footer__etbis"
                        >
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img
                              src="/images/etbis.webp"
                              alt="ETBİS Kayıt Belgesi"
                              width={120}
                              height={120}
                           />
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
                        <li><Link href="/kvkk"><i className="fa-solid fa-user-shield" />{t.kvkk}</Link></li>
                        <li><Link href="/cerez-politikasi"><i className="fa-solid fa-cookie-bite" />{t.cookiePolicy}</Link></li>
                     </ul>
                  </div>

               </div>
            </div>
         </div>

         {/* ── Agency strip (TÜRSAB) ── */}
         <div className="bb-footer__agency">
            <div className="container">
               <div className="bb-footer__agency-inner">
                  <span className="bb-footer__agency-item">Zlatna Rota Turizm Seyahat Acentası</span>
                  <span className="bb-footer__agency-sep">·</span>
                  <span className="bb-footer__agency-item">TÜRSAB Belge No: 18474</span>
               </div>
            </div>
         </div>

         {/* ── Bottom bar ── */}
         <div className="bb-footer__bottom">
            <div className="container">
               <div className="bb-footer__bottom-inner">
                  <span>© {new Date().getFullYear()} AtaBilet. {t.allRightsReserved}</span>
                  <span className="bb-footer__tursab">Türsab Belge No: 18474 · Zlatna Rota Turizm Seyahat Acentası</span>
                  <div className="bb-footer__bottom-links">
                     <Link href="/gizlilik">Gizlilik Politikası</Link>
                     <span>·</span>
                     <Link href="/kullanim-sartlari">Kullanım Şartları</Link>
                     <span>·</span>
                     <Link href="/kvkk">KVKK</Link>
                     <span>·</span>
                     <Link href="/cerez-politikasi">Çerez Politikası</Link>
                  </div>
               </div>
            </div>
         </div>

      </footer>
   );
};

export default FooterOne;
