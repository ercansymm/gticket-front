import NavMenu from "./Menu/NavMenu"
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Offcanvas from "./Menu/Offcanvas";
import HeaderTwoTop from "./Menu/HeaderTwoTop";
import Sidebar from "./Menu/Sidebar";
import UseSticky from "../../hooks/UseSticky";
import PhoneIcon from "../../svg/PhoneIcon";
import UserIcon from "../../svg/UserIcon";

const HeaderTwo = () => {

   const { sticky } = UseSticky();
   const [offCanvas, setOffCanvas] = useState<boolean>(false);
   const [sidebar, setSidebar] = useState<boolean>(false);

   return (
      <>
         <header className="tg-header-height tg-header-tu-2-wrap">
            <HeaderTwoTop />
            <div className={`tg-header-4-bootom tg-header-lg-space ${sticky ? "header-sticky" : ""}`} id="header-sticky">
               <div className="container-fluid container-1790">
                  <div className="row align-items-center">
                     <div className="col-lg-8 col-5">
                        <div className="tgmenu__wrap d-flex align-items-center">
                           <div className="logo flex-auto">
                              <Link href="/"><Image src="/assets/img/logo/logo-green.png" alt="Logo" width={150} height={38} /></Link>
                           </div>
                           <nav className="tgmenu__nav  ml-160 d-none d-xl-block">
                              <div className="tgmenu__navbar-wrap tgmenu__main-menu tgmenu__navbar-wrap-4 d-none d-xl-flex">
                                 <NavMenu />
                              </div>
                           </nav>
                        </div>
                     </div>
                     <div className="col-lg-4 col-7">
                        <div className="tg-menu-right-action tg-menu-right-action-2 tg-menu-4-right-action d-flex align-items-center justify-content-end">
                           <div className="tg-header-contact-info ml-20 d-flex align-items-center">
                              <span className="tg-header-contact-icon mr-5 d-none d-xl-block">
                                 <PhoneIcon />
                              </span>
                              <div className="tg-header-contact-number d-none d-xl-block">
                                 <span>Call Us:</span>
                                 <Link href="tel:+123595966">+123 5959 66</Link>
                              </div>
                           </div>
                           <div className="tg-header-btn ml-30 d-none d-sm-block">
                              <Link className="tg-btn-header" href="/login">
                                 <span>
                                    <UserIcon />
                                 </span>
                                 Login
                              </Link>
                           </div>
                           <div className="tg-header-menu-bar lh-1 p-relative ml-15">
                              <button onClick={() => setSidebar(true)} style={{ cursor: "pointer" }} className="tgmenu-offcanvas-open-btn menu-tigger d-none d-xl-block">
                                 <span></span>
                                 <span></span>
                                 <span></span>
                              </button>
                              <button onClick={() => setOffCanvas(true)} style={{ cursor: "pointer" }} className="tgmenu-offcanvas-open-btn mobile-nav-toggler d-block d-xl-none">
                                 <span></span>
                                 <span></span>
                                 <span></span>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <Offcanvas offCanvas={offCanvas} setOffCanvas={setOffCanvas} />
            <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
         </header>
      </>
   )
}

export default HeaderTwo
