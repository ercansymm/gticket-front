import Link from "next/link";
import Image from "next/image";

const Cta = () => {
   return (
      <div className="tg-cta-area tg-cta-su-wrapper tg-cta-space z-index-9 p-relative">
         <div className="container">
            <div className="row">
               <div className="col-12">
                  <div className="tg-cta-wrap include-bg" style={{ backgroundImage: `url(/assets/img/cta/banner.jpg)` }}>
                     <div className="row align-items-end">
                        <div className="col-lg-3 d-none d-lg-block">
                           <div className="tg-cta-thumb pt-50 ml-60">
                              <Image src="/assets/img/cta/phone.png" alt="" width={300} height={400} />
                           </div>
                        </div>
                        <div className="col-lg-5 col-md-6">
                           <div className="tg-cta-content">
                              <h5 className="tg-section-subtitle text-white mb-10">AtaBilet Mobil</h5>
                              <h2 className="mb-15 tg-cta-title text-white text-capitalize">Uygulamamızı İndirin <br /> Google & App Store!</h2>
                           </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                           <div className="tg-cta-apps">
                              <Link className="mb-20 d-inline-block mr-5" href="#"><Image src="/assets/img/cta/google.png" alt="" width={150} height={50} /></Link>
                              <Link className="mb-20 d-inline-block" href="#"><Image src="/assets/img/cta/app.png" alt="" width={150} height={50} /></Link>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Cta
