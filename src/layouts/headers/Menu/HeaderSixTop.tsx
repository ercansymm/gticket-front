import Link from "next/link";

const HeaderSixTop = () => {
   return (
      <div className="tg-header-top tg-header-top-space tg-primary-bg d-none d-lg-block">
         <div className="container">
            <div className="row">
               <div className="col-lg-6">
                  <div className="tg-header-top-info d-flex align-items-center">
                     <Link href="https://www.google.com/maps/@41.6758525,-86.2531698,18.17z"><i className="mr-5 fa-regular fa-location-dot"></i> 178 makr street, 8007 Australia</Link>
                     <span className="tg-header-dvdr mr-10 ml-10"></span>
                     <Link href="mailto:info@atabilet.com"><i className="mr-5 fa-regular fa-envelope"></i> info@atabilet.com</Link>
                  </div>
               </div>
               <div className="col-lg-6">
                  <div className="tg-header-top-info d-flex align-items-center justify-content-end">
                     <Link href="tel:+123595966"><i className="fa-sharp fa-regular fa-phone"></i> +123 5959 66</Link>
                     <span className="tg-header-dvdr mr-10 ml-10"></span>
                     <Link href="/login"><i className="fa-regular fa-user"></i> Login</Link>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default HeaderSixTop
