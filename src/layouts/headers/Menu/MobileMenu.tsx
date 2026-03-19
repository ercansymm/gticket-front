/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import { useState } from "react";
import menu_data from "../../../data/MenuData";

const MobileMenu = () => {
   const [navTitle, setNavTitle] = useState("");
   const [, setSubNavTitle] = useState("");

   // Open or close the parent menu
   const openMobileMenu = (menu: any) => {
      setNavTitle((prev: any) => (prev === menu ? "" : menu));
      setSubNavTitle("");
   };

   // Open or close the submenu

   return (
      <ul className="navigation">
         {menu_data.map((menu) => (
            <li key={menu.id} className={menu.has_dropdown ? "menu-item-has-children" : ""}>
               <Link href={menu.link}>
                  {menu.title}
               </Link>

               {menu.has_dropdown && (
                  <>
                     {menu.sub_menus && (
                        <>
                           <ul className="sub-menu" style={{ display: navTitle === menu.title ? "block" : "none" }}>
                              {menu.sub_menus.map((sub_m, i) => (
                                 <li key={i}>
                                    <Link href={sub_m.link}>
                                       {sub_m.title}
                                    </Link>
                                 </li>
                              ))}
                           </ul>
                           <div className={`dropdown-btn ${navTitle === menu.title ? "open" : ""}`}
                              onClick={() => openMobileMenu(menu.title)}>
                              <span className="plus-line"></span>
                           </div>
                        </>
                     )}
                  </>
               )}
            </li>
         ))}
      </ul>
   );
};

export default MobileMenu;
