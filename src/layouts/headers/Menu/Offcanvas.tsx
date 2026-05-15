import Link from "next/link";
import MobileMenu from "./MobileMenu";
import Logo from "../../../components/common/Logo";

interface OffcanvasUser {
   name?: string | null;
   email?: string | null;
}

interface MobileSidebarProps {
   offCanvas: boolean;
   setOffCanvas: (offCanvas: boolean) => void;
   user?: OffcanvasUser | null;
   onSignOut?: () => void;
}

const Offcanvas = ({ offCanvas, setOffCanvas, user, onSignOut }: MobileSidebarProps) => {
   const close = () => setOffCanvas(false);

   const initials = user?.name
      ? user.name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
      : user?.email?.[0]?.toUpperCase() ?? "?";

   return (
      <div className={offCanvas ? "mobile-menu-visible" : ""}>
         <div className="tgmobile__menu">
            <nav className="tgmobile__menu-box">
               {/* Header */}
               <div className="nav-logo">
                  <Logo variant="white" />
                  <div onClick={close} className="close-btn" role="button" aria-label="Menüyü kapat">
                     <i className="fa-solid fa-xmark" />
                  </div>
               </div>

               {/* Navigation */}
               <div className="tgmobile__menu-outer">
                  <MobileMenu />
               </div>

               {/* Social links */}
               <div className="social-links">
                  <ul className="list-wrap">
                     <li>
                        <a href="https://www.instagram.com/atabiletcom/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                           <i className="fab fa-instagram" />
                        </a>
                     </li>
                  </ul>
               </div>

               {/* Auth CTA */}
               <div className="bb-mobile-auth">
                  {user ? (
                     <>
                        <div className="bb-mobile-auth__user">
                           <div className="bb-mobile-auth__avatar">
                              <span>{initials}</span>
                           </div>
                           <div className="bb-mobile-auth__user-info">
                              <p className="bb-mobile-auth__user-name">{user.name || "Hesabınız"}</p>
                              {user.email && <p className="bb-mobile-auth__user-email">{user.email}</p>}
                           </div>
                        </div>
                        <div className="bb-mobile-auth__links">
                           <Link href="/seyahatlerim" className="bb-mobile-auth__link" onClick={close}>
                              <i className="fa-solid fa-plane-departure" />
                              Seyahatlerim
                           </Link>
                           <Link href="/destek-taleplerim" className="bb-mobile-auth__link" onClick={close}>
                              <i className="fa-solid fa-headset" />
                              Destek Taleplerim
                           </Link>
                           {onSignOut && (
                              <button
                                 type="button"
                                 className="bb-mobile-auth__signout"
                                 onClick={() => { close(); onSignOut(); }}
                              >
                                 <i className="fa-solid fa-right-from-bracket" />
                                 Çıkış Yap
                              </button>
                           )}
                        </div>
                     </>
                  ) : (
                     <div className="bb-mobile-auth__btns">
                        <Link href="/giris" className="bb-mobile-auth__login" onClick={close}>
                           <i className="fa-solid fa-user" />
                           Giriş Yap
                        </Link>
                        <Link href="/kayit-ol" className="bb-mobile-auth__register" onClick={close}>
                           <i className="fa-solid fa-user-plus" />
                           Kayıt Ol
                        </Link>
                     </div>
                  )}
               </div>
            </nav>
         </div>
         <div onClick={close} className="tgmobile__menu-backdrop" />
      </div>
   );
};

export default Offcanvas;
