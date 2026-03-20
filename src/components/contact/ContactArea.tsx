import Link from "next/link";
import ContactForm from "../forms/ContactForm"
import Image from "next/image";

const ContactArea = () => {
   return (
      <div className="tg-contact-area pt-130 p-relative z-index-1 pb-100">
         <Image className="tg-team-shape-2 d-none d-md-block" src="/assets/img/banner/banner-2/shape.png" alt="" width={200} height={200} />
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-5">
                  <div className="tg-team-details-contant tg-contact-info-wrap mb-30">
                     <h6 className="mb-15">İletişim Bilgileri:</h6>
                     <p className="mb-25">AtaBilet ile seyahat planlarınız hakkında her zaman bize ulaşabilirsiniz. 7/24 müşteri desteğimiz ile yanınızdayız.</p>
                     <div className="tg-team-details-contact-info mb-35">
                        <div className="tg-team-details-contact">
                           <div className="item">
                              <span>Telefon :</span>
                              <Link href="tel:08505550000">0850 555 00 00</Link>
                           </div>
                           <div className="item">
                              <span>Web Sitesi :</span>
                              <Link href="/">www.atabilet.com</Link>
                           </div>
                           <div className="item">
                              <span>E-posta :</span>
                              <Link href="mailto:info@atabilet.com">info@atabilet.com</Link>
                           </div>
                           <div className="item">
                              <span>Adres :</span>
                              <span>İstanbul, Türkiye</span>
                           </div>
                        </div>
                     </div>
                     <div className="tg-contact-map h-100">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d385398.5897665817!2d28.731939949999998!3d41.00498225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa7040068086b%3A0xe1ccfe98bc01b0d0!2zxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1710000000000!5m2!1str!2str" width="600" height="450" style={{ border: "0" }} loading="lazy"></iframe>
                     </div>
                  </div>
               </div>
               <div className="col-lg-7">
                  <div className="tg-contact-content-wrap ml-40 mb-30">
                     <h3 className="tg-contact-title mb-15">Bize Ulaşın</h3>
                     <p className="mb-30">Sorularınız, önerileriniz veya talepleriniz için aşağıdaki formu doldurun, en kısa sürede size dönüş yapalım.</p>
                     <div className="tg-contact-form tg-tour-about-review-form">
                        <ContactForm />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default ContactArea
