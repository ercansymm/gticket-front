import Link from "next/link";
import Image from "next/image";

const FooterThree = () => {

   return (
      <>
         <footer>
            <div className="tg-footer-area tg-footer-space include-bg" style={{ backgroundImage: `url(/assets/img/footer/footer.webp)` }}>
               <div className="container">
                  <div className="tg-footer-top mb-40">
                     <div className="row">
                        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                           <div className="tg-footer-widget mb-40">
                              <div className="tg-footer-logo mb-20">
                                 <Link href="/"><Image src="/assets/img/logo/logo-white.png" alt="Logo" width={150} height={38} /></Link>
                              </div>
                              <p className="mb-20">Pharetra maecenas felis vestibulum convallis mollis nullam congue sit.d rivers of Finland Quebec.</p>
                              <div className="tg-footer-form mb-30">
                                 <form onSubmit={(e) => e.preventDefault()}>
                                    <input type="email" placeholder="Enter your mail" />
                                    <button className="tg-footer-form-btn" type="submit">
                                       <svg width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M1.52514 8.47486H20.4749M20.4749 8.47486L13.5 1.5M20.4749 8.47486L13.5 15.4497" stroke="white" strokeWidth="1.77778" strokeLinecap="round" strokeLinejoin="round" />
                                       </svg>
                                    </button>
                                 </form>
                              </div>
                              <div className="tg-footer-social">
                                 <Link href="#"><i className="fa-brands fa-facebook-f"></i></Link>
                                 <Link href="#"><i className="fa-brands fa-twitter"></i></Link>
                                 <Link href="#"><i className="fa-brands fa-instagram"></i></Link>
                                 <Link href="#"><i className="fa-brands fa-pinterest-p"></i></Link>
                                 <Link href="#"><i className="fa-brands fa-youtube"></i></Link>
                              </div>
                           </div>
                        </div>
                        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                           <div className="tg-footer-widget tg-footer-link ml-80 mb-40">
                              <h3 className="tg-footer-widget-title mb-25">Quick Links</h3>
                              <ul>
                                 <li><Link href="/">Home</Link></li>
                                 <li><Link href="/about">About Us</Link></li>
                                 <li><Link href="#">Services</Link></li>
                                 <li><Link href="#">Tour Guide</Link></li>
                                 <li><Link href="/contact"> Contact Us</Link></li>
                              </ul>
                           </div>
                        </div>
                        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                           <div className="tg-footer-widget tg-footer-info mb-40">
                              <h3 className="tg-footer-widget-title mb-25">Information</h3>
                              <ul>
                                 <li>
                                    <Link className="d-flex" href="https://www.google.com/maps/@41.6758525,-86.2531698,18.17z">
                                       <span className="mr-15">
                                          <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                             <path d="M19.0013 10.0608C19.0013 16.8486 10.3346 22.6668 10.3346 22.6668C10.3346 22.6668 1.66797 16.8486 1.66797 10.0608C1.66797 7.74615 2.58106 5.52634 4.20638 3.88965C5.83169 2.25297 8.03609 1.3335 10.3346 1.3335C12.6332 1.3335 14.8376 2.25297 16.4629 3.88965C18.0882 5.52634 19.0013 7.74615 19.0013 10.0608Z" stroke="white" strokeWidth="1.73333" strokeLinecap="round" strokeLinejoin="round" />
                                             <path d="M10.3346 12.9699C11.9301 12.9699 13.2235 11.6674 13.2235 10.0608C13.2235 8.45412 11.9301 7.15168 10.3346 7.15168C8.73915 7.15168 7.44575 8.45412 7.44575 10.0608C7.44575 11.6674 8.73915 12.9699 10.3346 12.9699Z" stroke="white" strokeWidth="1.73333" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                       </span>
                                       58 Street Commercial Road<br /> Fratton, Australia
                                    </Link>
                                 </li>
                                 <li>
                                    <Link className="d-flex" href="tel:+1238889999">
                                       <span className="mr-15">
                                          <i className="fa-sharp text-white fa-solid fa-phone"></i>
                                       </span>
                                       +123 888 9999
                                    </Link>
                                 </li>
                                 <li className="d-flex">
                                    <span className="mr-15">
                                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M11.9987 5.60006V12.0001L16.2654 14.1334M22.6654 12.0002C22.6654 17.8912 17.8897 22.6668 11.9987 22.6668C6.10766 22.6668 1.33203 17.8912 1.33203 12.0002C1.33203 6.10912 6.10766 1.3335 11.9987 1.3335C17.8897 1.3335 22.6654 6.10912 22.6654 12.0002Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                       </svg>
                                    </span>
                                    <p className="mb-0">
                                       Mon – Sat: 8 am – 5 pm,<br />
                                       Sunday: <span className="text-white d-inline-block">CLOSED</span>
                                    </p>
                                 </li>
                              </ul>
                           </div>
                        </div>
                        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                           <div className="tg-footer-widget tg-footer-link mb-40">
                              <h3 className="tg-footer-widget-title mb-25">Utility Pages</h3>
                              <ul>
                                 <li><Link href="#">Style Guide</Link></li>
                                 <li><Link href="#">Password Protected</Link></li>
                                 <li><Link href="#">404 Error</Link></li>
                                 <li><Link href="#">Changelog</Link></li>
                                 <li><Link href="#">License</Link></li>
                              </ul>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="tg-footer-copyright text-center">
                  <span>
                     Copyright <Link href="#">©AtaBilet</Link> |  All Right Reserved
                  </span>
               </div>
            </div>
         </footer>
      </>
   )
}

export default FooterThree
