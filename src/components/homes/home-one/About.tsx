import Link from "next/link";
import Image from "next/image";

interface DataType {
   id: number;
   icon: string;
   title: string;
   count: number;
}

const feature_data: DataType[] = [
   {
      id: 1,
      icon: "/assets/img/about/su/fun-3.png",
      title: "Top Destination",
      count: 5000,
   },
   {
      id: 2,
      icon: "/assets/img/about/su/fun-2.png",
      title: "Booking Completed",
      count: 3000
   },
   {
      id: 3,
      icon: "/assets/img/about/su/fun-1.png",
      title: "Top Destination",
      count: 5000
   },
]

const About = () => {
   return (
      <div className="tg-about-area p-relative z-index-1 pb-80">
         <Image className="tg-about-su-right-shape d-none d-xl-block" src="/assets/img/about/su/right-shape.png" alt="" width={200} height={200} />
         <div className="container">
            <div className="row align-items-end">
               <div className="col-lg-5">
                  <div className="tg-about-su-thumb p-relative mb-40 wow fadeInLeft" data-wow-delay=".4s" data-wow-duration=".6s">
                     <div className="tg-about-su-shape-2">
                        <Image src="/assets/img/about/su/shape.png" alt="" width={200} height={200} />
                     </div>
                     <div className="tg-about-su-shape">
                        <Image src="/assets/img/about/su/shape-2.png" alt="" width={200} height={200} />
                     </div>
                     <Image src="/assets/img/about/su/thumb.png" alt="" width={600} height={400} />
                  </div>
               </div>
               <div className="col-lg-7">
                  <div className="tg-about-su-content-wrap ml-80 mb-30 wow fadeInRight" data-wow-delay=".4s" data-wow-duration=".6s">
                     <div className="tg-location-section-title mb-30">
                        <h5 className="tg-section-su-subtitle mb-15">Biz Kimiz</h5>
                        <h2 className="tg-section-su-title text-capitalize mb-15">Macera ve seyahat için harika fırsatlar</h2>
                        <p className="tg-section-su-para mb-10">AtaBilet olarak yurt içi ve yurt dışı uçak biletlerini en uygun fiyatlarla<br />
                           sunuyoruz. Tüm havayollarını karşılaştırın, güvenle satın alın.<br />
                           7/24 müşteri desteği ile her zaman yanınızdayız.</p>
                     </div>
                     <div className="tg-about-su-funfact-wrap mb-40">
                        {feature_data.map((item) => (
                           <div key={item.id} className="tg-about-su-funfact-item mb-15">
                              <div className="tg-about-su-funfact-icon mb-20">
                                 <Image src={item.icon} alt="" width={80} height={80} />
                              </div>
                              <div className="tg-about-su-funfact-text">
                                 <h3 className="mb-0">{item.count}+</h3>
                                 <span>{item.title}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                     <div className="tg-about-su-author-wrap">
                        <div className="mr-30 mb-10">
                           <Link className="tg-btn tg-btn-hover" href="/about">Hakkımızda</Link>
                        </div>
                        <div className="tg-about-su-author d-flex align-items-center mb-10">
                           <div className="tg-about-su-author-avatar mr-10">
                              <Image src="/assets/img/about/su/author.jpg" alt="" width={80} height={80} />
                           </div>
                           <div className="tg-about-su-author-info">
                              <h5>Richard Kemel</h5>
                              <span>Ceo & Founder</span>
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

export default About
