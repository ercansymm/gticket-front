import { useTranslation } from "../../../context/LanguageContext";

const campaigns = [
   {
      id: 1,
      icon: "fa-solid fa-plane-departure",
      titleTr: "Erken Rezervasyon",
      titleEn: "Early Booking",
      descTr: "Yaz tatili için %25'e varan indirimler",
      descEn: "Up to 25% off for summer vacation",
      linkTr: "Detaylar",
      linkEn: "Details",
   },
   {
      id: 2,
      icon: "fa-solid fa-tag",
      titleTr: "Günün Fırsatı",
      titleEn: "Deal of the Day",
      descTr: "İstanbul-Antalya 599 TL'den başlayan fiyatlarla",
      descEn: "Istanbul-Antalya starting from 599 TL",
      linkTr: "Detaylar",
      linkEn: "Details",
   },
   {
      id: 3,
      icon: "fa-solid fa-briefcase",
      titleTr: "İş Seyahati",
      titleEn: "Business Travel",
      descTr: "Kurumsal müşterilere özel esnek tarifeler",
      descEn: "Flexible fares for corporate customers",
      linkTr: "Detaylar",
      linkEn: "Details",
   },
];

const Campaigns = () => {
   const { lang } = useTranslation();

   return (
      <section className="bb-campaigns">
         <div className="container">
            <div className="bb-campaigns__grid">
               {campaigns.map((c) => (
                  <div key={c.id} className="bb-campaign-card">
                     <div className="bb-campaign-card__icon">
                        <i className={c.icon}></i>
                     </div>
                     <div className="bb-campaign-card__body">
                        <h3 className="bb-campaign-card__title">
                           {lang === "tr" ? c.titleTr : c.titleEn}
                        </h3>
                        <p className="bb-campaign-card__desc">
                           {lang === "tr" ? c.descTr : c.descEn}
                        </p>
                        <span className="bb-campaign-card__link">
                           {lang === "tr" ? c.linkTr : c.linkEn} <i className="fa-solid fa-arrow-right"></i>
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default Campaigns;
