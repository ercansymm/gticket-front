"use client";

import { useTranslation } from "../../../context/LanguageContext";

/** AtaBilet — Güven şeridi. SSL, destek, IATA ve kullanıcı sayısı bilgileri. */
const TrustBar = () => {
   const { t } = useTranslation();

   return (
      <section aria-label={t.sslSecurity} className="bb-trustbar">
         <div className="container">
            <div className="bb-trustbar__inner">
               <div className="bb-trustbar__item">
                  <i className="fa-solid fa-shield-halved"></i>
                  <span>{t.sslSecurity}</span>
               </div>
               <div className="bb-trustbar__item">
                  <i className="fa-solid fa-headset"></i>
                  <span>{t.customerSupport}</span>
               </div>
               <div className="bb-trustbar__item">
                  <i className="fa-solid fa-plane"></i>
                  <span>{t.iataMember}</span>
               </div>
               <div className="bb-trustbar__item">
                  <i className="fa-solid fa-users"></i>
                  <span>{t.happyPassengers}</span>
               </div>
            </div>
         </div>
      </section>
   )
}

export default TrustBar
