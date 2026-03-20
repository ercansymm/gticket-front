import Link from "next/link";
import Image from "next/image";

const Ads = () => {
   return (
      <div className="tg-ads-area tg-ads-su-space p-relative z-index-1">
         <div className="container">
            <div className="row">
               <div className="col-lg-6 col-md-6 mb-30 wow fadeInUp" data-wow-delay=".4s" data-wow-duration=".6s">
                  <div className="tg-ads-wrap-3 tg-ads-su-wrapper include-bg fix" style={{ backgroundImage: `url(/assets/img/ads/su/bg.jpg)` }}>
                     <div className="tg-ads-content-2">
                        <div className="tg-ads-discount-inner mb-20">
                           <span className="travel">Travel Feni</span>
                           <div className="tg-ads-discount d-flex align-items-center">
                              <h2 className="mb-0 mr-5">25%</h2>
                              <div>
                                 <h3 className="mb-0">Extra</h3>
                                 <span>Discount</span>
                              </div>
                           </div>
                        </div>
                        <div className="tg-ads-btn">
                           <Link href="/" className="tg-btn">Hemen Ara</Link>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="col-lg-6 col-md-6 mb-30 wow fadeInUp" data-wow-delay=".6s" data-wow-duration=".6s">
                  <div className="tg-ads-su-wrap h-100">
                     <Image className="w-100 h-100" src="/assets/img/ads/su/banner.jpg" alt="" width={600} height={400} />
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Ads
