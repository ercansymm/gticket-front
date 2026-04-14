import NavMenu from "./Menu/NavMenu"
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Offcanvas from "./Menu/Offcanvas";
import Sidebar from "./Menu/Sidebar";
import HeaderSearch from "./Menu/HeaderSearch";
import HeaderCart from "./Menu/HeaderCart";
import TotalCart from "./Menu/TotalCart";
import UseSticky from "../../hooks/UseSticky";
import SearchIcon from "../../svg/SearchIcon";
import CartIconTwo from "../../svg/CartIconTwo";

const InnerHeader = () => {

   const { sticky } = UseSticky();
   const [offCanvas, setOffCanvas] = useState<boolean>(false);
   const [sidebar, setSidebar] = useState<boolean>(false);
   const [isSearch, setIsSearch] = useState<boolean>(false);

   return (
      <>
         <header className="tg-header-height">
            <div className="tg-header__area">
               <div className={`tg-header-4-bootom tg-header-lg-space ${sticky ? "header-sticky" : ""}`} id="header-sticky">
                  <div className="container">
                     <div className="row align-items-center">
                        <div className="col-lg-8 col-5">
                           <div className="tgmenu__wrap d-flex align-items-center">
                              <div className="logo flex-auto">
                                 <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = "/"; }}><Image src="/assets/img/logo/logo-green.png" alt="Logo" width={150} height={38} /></a>
                              </div>
                              <nav className="tgmenu__nav  ml-90 d-none d-xl-block">
                                 <div className="tgmenu__navbar-wrap tgmenu__main-menu tgmenu__navbar-wrap-4 d-none d-xl-flex">
                                    <NavMenu />
                                 </div>
                              </nav>
                           </div>
                        </div>
                        <div className="col-lg-4 col-7">
                           <div className="tg-menu-right-action tg-menu-right-action-3 tg-menu-4-right-action d-flex align-items-center justify-content-end">
                              <button onClick={() => setIsSearch(true)} className="search-button search-open-btn">
                                 <SearchIcon />
                              </button>
                              <div className="tg-header-cart p-relative d-none d-xl-block">
                                 <button className="cart-button">
                                    <span>
                                       <CartIconTwo />
                                    </span>
                                    <span className="tg-header-cart-count"><TotalCart /></span>
                                 </button>
                                 <HeaderCart />
                              </div>
                              <div className="tg-header-menu-bar lh-1 p-relative ml-10">
                                 <button onClick={() => setSidebar(true)} className="tgmenu-offcanvas-open-btn menu-tigger d-none d-xl-block">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                 </button>
                                 <button onClick={() => setOffCanvas(true)} className="tgmenu-offcanvas-open-btn mobile-nav-toggler d-block d-xl-none">
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
            </div>
         </header>
         <Offcanvas offCanvas={offCanvas} setOffCanvas={setOffCanvas} />
         <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
         <HeaderSearch isSearch={isSearch} setIsSearch={setIsSearch} />
      </>
   )
}

export default InnerHeader
