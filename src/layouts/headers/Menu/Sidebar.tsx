import Link from "next/link";
import Logo from "../../../components/common/Logo";

interface SidebarProps {
   sidebar: boolean;
   setSidebar: (offCanvas: boolean) => void;
}

const Sidebar = ({ sidebar, setSidebar }: SidebarProps) => {
   return (
      <>
         <div className={`offCanvas__info ${sidebar ? "active" : ""}`}>
            <div className="offCanvas__close-icon menu-close">
               <button onClick={() => setSidebar(false)}><i className="fa-sharp fa-regular fa-xmark"></i></button>
            </div>
            <div className="offCanvas__logo mb-30">
               <Link href="/"><Logo variant="dark" /></Link>
            </div>
            <div className="offCanvas__side-info mb-30">
               <div className="contact-list mb-30">
                  <h4>Adres</h4>
                  <p>İstanbul, Türkiye</p>
               </div>
               <div className="contact-list mb-30">
                  <h4>Telefon</h4>
                  <p>0850 555 00 00</p>
               </div>
               <div className="contact-list mb-30">
                  <h4>E-posta</h4>
                  <p>info@atabilet.com</p>
               </div>
            </div>
            <div className="offCanvas__social-icon mt-30">
               <Link href="#"><i className="fab fa-facebook-f"></i></Link>
               <Link href="#"><i className="fab fa-twitter"></i></Link>
               <Link href="#"><i className="fab fa-instagram"></i></Link>
               <Link href="#"><i className="fab fa-youtube"></i></Link>
            </div>
         </div>
         <div onClick={() => setSidebar(false)} className={`offCanvas__overly ${sidebar ? "active" : ""}`}></div>
      </>
   )
}

export default Sidebar
