import Link from "next/link";
import Image from "next/image";

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
               <Link href="/"><Image src="/assets/img/logo/logo-green.png" alt="Logo" width={150} height={38} /></Link>
            </div>
            <div className="offCanvas__side-info mb-30">
               <div className="contact-list mb-30">
                  <h4>Office Address</h4>
                  <p>123/A, Miranda City Likaoli <br /> Prikano, Dope</p>
               </div>
               <div className="contact-list mb-30">
                  <h4>Phone Number</h4>
                  <p>+0989 7876 9865 9</p>
                  <p>+(090) 8765 86543 85</p>
               </div>
               <div className="contact-list mb-30">
                  <h4>Email Address</h4>
                  <p>info@example.com</p>
                  <p>example.mail@hum.com</p>
               </div>
            </div>
            <div className="offCanvas__social-icon mt-30">
               <Link href="/"><i className="fab fa-facebook-f"></i></Link>
               <Link href="/"><i className="fab fa-twitter"></i></Link>
               <Link href="/"><i className="fab fa-google-plus-g"></i></Link>
               <Link href="/"><i className="fab fa-instagram"></i></Link>
            </div>
         </div>
         <div onClick={() => setSidebar(false)} className={`offCanvas__overly ${sidebar ? "active" : ""}`}></div>
      </>
   )
}

export default Sidebar
