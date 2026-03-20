import Image from "next/image";
import Link from "next/link";

const AboutArea = () => {
   return (
      <div className="tg-about-area p-relative z-index-1 pt-140 pb-105">
         <Image className="tg-about-details-shape p-absolute d-none d-lg-block" src="/assets/img/about/details/shape.png" alt="shape" width={200} height={200} />
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-6">
                  <div className="tg-about-details-left p-relative mb-15">
                     <Image className="tg-about-details-map p-absolute" src="/assets/img/about/details/shape-2.png" alt="map" width={200} height={200} />
                     <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-6">
                           <div className="tg-about-details-thumb p-relative z-index-9">
                              <Image className="main-thumb tg-round-15 w-100 mb-20" src="/assets/img/about/details/thumb-1.jpg" alt="thumb" width={600} height={400} />
                              <Image className="main-thumb tg-round-15 w-100 mb-20" src="/assets/img/about/details/thumb-3.jpg" alt="thumb" width={600} height={400} />
                           </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6">
                           <div className="tg-about-details-thumb-2 p-relative">
                              <div className="tg-chose-3-rounded p-relative mb-30">
                                 <Image className="rotate-infinite-2" src="/assets/img/chose/chose-3/circle-text.png" alt="" width={200} height={200} />
                                 <Image className="tg-chose-3-star" src="/assets/img/chose/chose-3/star.png" alt="" width={200} height={200} />
                              </div>
                              <Image className="w-100 tg-round-15" src="/assets/img/about/details/thumb-2.jpg" alt="chose" width={600} height={400} />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="col-lg-6">
                  <div className="tg-chose-content mb-35 ml-60">
                     <div className="tg-chose-section-title mb-30">
                        <h5 className="tg-section-subtitle mb-15 wow fadeInUp" data-wow-delay=".3s" data-wow-duration=".1s">AtaBilet ile Seyahat</h5>
                        <h2 className="mb-15 text-capitalize wow fadeInUp" data-wow-delay=".4s" data-wow-duration=".9s">Hayalinizdeki seyahati<br /> AtaBilet ile<br /> gerçekleştirin</h2>
                        <p className="text-capitalize wow fadeInUp mb-35" data-wow-delay=".5s" data-wow-duration=".9s">AtaBilet olarak yurt içi ve yurt dışı uçak biletlerini
                           en uygun fiyatlarla sunuyoruz. Tüm havayollarını
                           karşılaştırın, güvenle satın alın.<br />
                           7/24 müşteri desteği ile yanınızdayız.</p>
                        <div className="tg-chose-btn wow fadeInUp" data-wow-delay=".8s" data-wow-duration=".9s">
                           <Link href="/" className="tg-btn tg-btn-switch-animation">
                              <span>Uçuş Ara</span>
                           </Link>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default AboutArea
