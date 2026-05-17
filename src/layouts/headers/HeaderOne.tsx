"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Offcanvas from "./Menu/Offcanvas";
import Logo from "../../components/common/Logo";
import { useTranslation } from "../../context/LanguageContext";
import CurrencySelector from "../../components/common/CurrencySelector";
import { Info, BookOpen, HelpCircle, Phone } from "lucide-react";

const NAV_LINKS = [
   { label: "Hakkımızda", href: "/hakkimizda", Icon: Info },
   { label: "Blog",        href: "/blog",        Icon: BookOpen },
   { label: "SSS",         href: "/sss",         Icon: HelpCircle },
   { label: "İletişim",   href: "/iletisim",    Icon: Phone },
];

/** AtaBilet — Header. Logo, navigasyon, dil seçici, döviz seçici ve müşteri hesabı menüsü. */
const HeaderOne = () => {

   const { t, lang, setLang } = useTranslation();
   const { data: session, status } = useSession();
   const pathname = usePathname();
   const [mobileMenu, setMobileMenu] = useState(false);
   const [langOpen, setLangOpen] = useState(false);
   const [accountOpen, setAccountOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);
   const langRef = useRef<HTMLDivElement>(null);
   const accountRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      // On home page header stays transparent over the hero image until user scrolls past it.
      // Other pages have no hero, so switch to solid as soon as the user scrolls.
      const isHome = pathname === "/";
      const threshold = isHome ? 540 : 10;
      const onScroll = () => setScrolled(window.scrollY > threshold);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
   }, [pathname]);

   useEffect(() => {
      const handler = (e: MouseEvent) => {
         if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
         if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
      };
      const escHandler = (e: KeyboardEvent) => {
         if (e.key === "Escape") {
            setLangOpen(false);
            setAccountOpen(false);
         }
      };
      document.addEventListener("mousedown", handler);
      document.addEventListener("keydown", escHandler);
      return () => {
         document.removeEventListener("mousedown", handler);
         document.removeEventListener("keydown", escHandler);
      };
   }, []);

   const user = session?.user;

   return (
      <>
         <header className={`bb-header-wrap${scrolled ? " bb-header-wrap--scrolled" : ""}`}>
            <div className="container">
               <div className="bb-header-inner">
                  <div className="bb-header-left">
                     <Logo variant="white" />
                     <nav aria-label="Ana menü">
                        <ul className="bb-nav-links d-none d-lg-flex">
                           {NAV_LINKS.map(({ label, href, Icon }) => (
                              <li key={href}>
                                 <Link
                                    href={href}
                                    className={pathname === href ? "bb-nav-link--active" : ""}
                                 >
                                    <Icon size={14} strokeWidth={2} />
                                    {label}
                                 </Link>
                              </li>
                           ))}
                        </ul>
                     </nav>
                  </div>
                  <div className="bb-header-right">

                     {/* Türsab badge */}
                     <span className="bb-tursab-badge d-none d-lg-inline-flex">
                        Türsab Belge No: 18474
                     </span>

                     {/* Currency Selector — arama sonrası görünür */}
                     <CurrencySelector />

                     {/* Account / Login */}
                     {status === "authenticated" && user ? (
                        <div ref={accountRef} className="bb-account d-none d-sm-inline-block">
                           <button
                              type="button"
                              className={`bb-account__toggle${accountOpen ? " bb-account__toggle--open" : ""}`}
                              onClick={() => setAccountOpen((p) => !p)}
                              aria-haspopup="menu"
                              aria-expanded={accountOpen}
                              aria-label="Müşteri hesabı menüsü"
                           >
                              <span>{user.name || user.email?.split("@")[0] || "Hesabınız"}</span>
                              <i className="fa-solid fa-chevron-down bb-account__chevron" />
                           </button>
                           {accountOpen && (
                              <div className="bb-account__menu" role="menu">
                                 <div className="bb-account__menu-header">
                                    <div style={{ minWidth: 0 }}>
                                       <p className="bb-account__menu-name">{user.name || "Müşteri"}</p>
                                       {user.email && (
                                          <p className="bb-account__menu-email">{user.email}</p>
                                       )}
                                    </div>
                                 </div>
                                 <div className="bb-account__menu-list">
                                    <Link
                                       href="/destek-taleplerim"
                                       className="bb-account__menu-item"
                                       role="menuitem"
                                       onClick={() => setAccountOpen(false)}
                                    >
                                       <i className="fa-solid fa-headset" />
                                       Destek Taleplerim
                                    </Link>
                                    <Link
                                       href="/seyahatlerim"
                                       className="bb-account__menu-item"
                                       role="menuitem"
                                       onClick={() => setAccountOpen(false)}
                                    >
                                       <i className="fa-solid fa-plane-departure" />
                                       Seyahatlerim
                                    </Link>
                                    <div className="bb-account__menu-divider" />
                                    <button
                                       type="button"
                                       className="bb-account__menu-item bb-account__menu-item--danger"
                                       role="menuitem"
                                       onClick={() => {
                                          setAccountOpen(false);
                                          signOut({ callbackUrl: "/" });
                                       }}
                                    >
                                       <i className="fa-solid fa-right-from-bracket" />
                                       Çıkış Yap
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>
                     ) : (
                        <Link href="/giris" className="bb-header-btn bb-header-btn--login d-none d-sm-inline-flex">
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
