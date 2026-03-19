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

const HeaderFive = () => {

   const { sticky } = UseSticky();
   const [offCanvas, setOffCanvas] = useState<boolean>(false);
   const [sidebar, setSidebar] = useState<boolean>(false);
   const [isSearch, setIsSearch] = useState<boolean>(false);

   return (
      <>
         <header className="tg-header-height">
            <div className={`tg-header__area tg-header-lg-space z-index-999 tg-transparent ${sticky ? "header-sticky" : ""}`} id="header-sticky">
               <div className="container">
                  <div className="row align-items-center">
                     <div className="col-lg-3 col-5">
                        <div className="logo">
                           <Link className="logo-1" href="/"><Image src="/assets/img/logo/logo-white.png" alt="Logo" width={150} height={38} /></Link>
                           <Link className="logo-2 d-none" href="/"><Image src="/assets/img/logo/logo-green.png" alt="Logo" width={150} height={38} /></Link>
                        </div>
                     </div>
                     <div className="col-lg-9 col-7">
                        <div className="tgmenu__wrap tg-menu-3-wrap d-flex align-items-center justify-content-end">
                           <nav className="tgmenu__nav">
                              <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-xl-flex">
                                 <NavMenu />
                              </div>
                           </nav>
                           <div className="tg-menu-right-action tg-menu-right-action-3 d-flex align-items-center">
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
            <Offcanvas offCanvas={offCanvas} setOffCanvas={setOffCanvas} />
            <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
            <HeaderSearch isSearch={isSearch} setIsSearch={setIsSearch} />
         </header>
      </>
   )
}

export default HeaderFive
