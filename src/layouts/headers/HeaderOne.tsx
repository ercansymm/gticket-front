"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Offcanvas from "./Menu/Offcanvas";
import Logo from "../../components/common/Logo";
import { useTranslation } from "../../context/LanguageContext";
import CurrencySelector from "../../components/common/CurrencySelector";

/** AtaBilet — Header. Logo, navigasyon, destek hattı, bilet sorgula, dil seçici ve giriş butonu. */
const HeaderOne = () => {

   const { t, lang, setLang } = useTranslation();
   const { data: session, status } = useSession();
   const [mobileMenu, setMobileMenu] = useState(false);
   const [langOpen, setLangOpen] = useState(false);
   const langRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handler = (e: MouseEvent) => {
         if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, []);

   return (
      <>
         <header className="bb-header-wrap">
            <div className="container">
               <div className="bb-header-inner">
                  <div className="bb-header-left">
                     <Logo variant="white" />
                  </div>
                  <div className="bb-header-right">
                     {/* Bilet Sorgula */}
                     <Link href="/bilet-sorgula" className="bb-header-btn d-none d-md-inline-flex">
                        <i className="fa-solid fa-ticket"></i> {t.bookingCheck}
                     </Link>

                     {/* Destek Taleplerim - sadece giriş yapanlara */}
                     {status === "authenticated" && (
                        <Link href="/destek-taleplerim" className="bb-header-btn d-none d-md-inline-flex">
                           <i className="fa-solid fa-headset"></i> Taleplerim
                        </Link>
                     )}
                     <span className="bb-divider d-none d-md-block"></span>

                     {/* Language Selector */}
                     <div ref={langRef} className="bb-lang-selector d-none d-sm-block">
                        <button
                           type="button"
                           className="bb-lang-selector__toggle"
                           onClick={() => setLangOpen(p => !p)}
                           aria-label={t.language}
                           aria-expanded={langOpen}
                           aria-haspopup="listbox"
                        >
                           <i className="fa-solid fa-globe"></i> {lang === "tr" ? "TR" : "EN"} <i className="fa-solid fa-chevron-down bb-lang-selector__arrow"></i>
                        </button>
                        {langOpen && (
                           <ul className="bb-lang-selector__dropdown" role="listbox">
                              <li
                                 role="option"
                                 aria-selected={lang === "tr"}
                                 className={lang === "tr" ? "bb-lang-selector__item--active" : ""}
                                 onClick={() => { setLang("tr"); setLangOpen(false); }}
                              >
                                 {lang === "tr" && <i className="fa-solid fa-check"></i>} Türkçe
                              </li>
                              <li
                                 role="option"
                                 aria-selected={lang === "en"}
                                 className={lang === "en" ? "bb-lang-selector__item--active" : ""}
                                 onClick={() => { setLang("en"); setLangOpen(false); }}
                              >
                                 {lang === "en" && <i className="fa-solid fa-check"></i>} English
                              </li>
                           </ul>
                        )}
                     </div>
                     <span className="bb-divider d-none d-sm-block"></span>

                     {/* Currency Selector — arama sonrası görünür */}
                     <CurrencySelector />

                     {/* Login / Logout */}
                     {status === "authenticated" && session?.user ? (
                        <>
                           <span className="bb-header-btn d-none d-sm-inline-flex" style={{ cursor: "default" }}>
                              <i className="fa-solid fa-user"></i> {session.user.name || session.user.email}
                           </span>
                           <button
                              type="button"
                              onClick={() => signOut({ callbackUrl: "/" })}
                              className="bb-header-btn bb-header-btn--login d-none d-sm-inline-flex"
                              style={{ background: "none", border: "none" }}
                           >
                              <i className="fa-solid fa-right-from-bracket"></i> Çıkış Yap
                           </button>
                        </>
                     ) : (
                        <Link href="/login" className="bb-header-btn bb-header-btn--login d-none d-sm-inline-flex">
                           <i className="fa-solid fa-user"></i> {t.login}
                        </Link>
                     )}

                     {/* Mobile menu toggle */}
                     <button
                        onClick={() => setMobileMenu(true)}
                        className="bb-mobile-toggle d-block d-lg-none"
                        aria-label={t.menuOpen}
                     >
                        <i className="fa-solid fa-bars"></i>
                     </button>
                  </div>
               </div>
            </div>
         </header>
         <Offcanvas offCanvas={mobileMenu} setOffCanvas={setMobileMenu} />
      </>
   )
}

export default HeaderOne
