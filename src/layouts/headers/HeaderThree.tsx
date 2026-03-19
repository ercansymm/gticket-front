import NavMenu from "./Menu/NavMenu"
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Offcanvas from "./Menu/Offcanvas";
import Sidebar from "./Menu/Sidebar";
import HeaderCart from "./Menu/HeaderCart";
import TotalCart from "./Menu/TotalCart";
import UseSticky from "../../hooks/UseSticky";
import PhoneIcon from "../../svg/PhoneIcon";
import CartIcon from "../../svg/CartIcon";
import UserIcon from "../../svg/UserIcon";

const HeaderThree = () => {

   const { sticky } = UseSticky();
   const [offCanvas, setOffCanvas] = useState<boolean>(false);
   const [sidebar, setSidebar] = useState<boolean>(false);

   return (
      <>
         <header className="tg-header-height">
            <div className={`tg-header__area tg-header-lg-space z-index-999 tg-transparent ${sticky ? "header-sticky" : ""}`} id="header-sticky">
               <div className="container-fluid container-1860">
                  <div className="row align-items-center">
                     <div className="col-lg-7 col-5">
                        <div className="tgmenu__wrap d-flex align-items-center">
                           <div className="logo">
                              <Link className="logo-1" href="/"><Image src="/assets/img/logo/logo-white.png" alt="Logo" width={150} height={38} /></Link>
                              <Link className="logo-2 d-none" href="/"><Image src="/assets/img/logo/logo-green.png" alt="Logo" width={150} height={38} /></Link>
                           </div>
                           <nav className="tgmenu__nav tgmenu-1-space ml-180">
                              <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-xl-flex">
                                 <NavMenu />
                              </div>
                           </nav>
                        </div>
                     </div>
                     <div className="col-lg-5 col-7">
                        <div className="tg-menu-right-action d-flex align-items-center justify-content-end">
                           <div className="tg-header-contact-info d-flex align-items-center">
                              <span className="tg-header-contact-icon mr-5 d-none d-xl-block">
                                 <PhoneIcon />
                              </span>
                              <div className="tg-header-contact-number d-none d-xl-block">
                                 <span>Call Us:</span>
                                 <Link href="tel:+123595966">+123 5959 66</Link>
                              </div>
                           </div>
                           <div className="tg-header-cart p-relative ml-20 pl-20 d-none d-xl-block">
                              <span className="tg-header-border"></span>
                              <button className="cart-button">
                                 <span>
                                    <CartIcon />
                                 </span>
                                 <span className="tg-header-cart-count"><TotalCart /></span>
                              </button>
                              <HeaderCart />
                           </div>
                           <div className="tg-header-btn ml-20 d-none d-sm-block">
                              <Link className="tg-btn-header" href="/login">
                                 <span>
                                    <UserIcon />
                                 </span>
                                 Login
                              </Link>
                           </div>
                           <div className="tg-header-menu-bar lh-1 p-relative ml-20 pl-20">
                              <span className="tg-header-border d-none d-xl-block"></span>
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
         </header>
         <Offcanvas offCanvas={offCanvas} setOffCanvas={setOffCanvas} />
         <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
      </>
   )
}

export default HeaderThree
