import { useEffect, useRef } from "react";
import { useTranslation } from "../../../context/LanguageContext";

/** AtaBilet — "Neden AtaBilet?" istatistik ve özellik bölümü.
 *  Sol tarafta öne çıkan 4 istatistik kartı, sağda kısa açıklama ve özellik listesi. */
const WhyAtaBilet = () => {
   const { lang } = useTranslation();
   const isTr = lang === "tr";
   const sectionRef = useRef<HTMLElement>(null);

   useEffect(() => {
      const el = sectionRef.current;
      if (!el) return;
      const obs = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) {
               el.classList.add("bb-reveal--visible");
               obs.disconnect();
            }
         },
         { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      );
      obs.observe(el);
      return () => obs.disconnect();
   }, []);

   const stats = [
      {
         id: 1,
         value: "100K+",
         label: isTr ? "Mutlu Yolcu" : "Happy Passengers",
         icon: "fa-solid fa-user-group",
      },
      {
         id: 2,
         value: "500+",
         label: isTr ? "Anlaşmalı Havayolu" : "Partner Airlines",
         icon: "fa-solid fa-plane",
      },
      {
         id: 3,
         value: "180+",
         label: isTr ? "Ülke ve Destinasyon" : "Countries & Destinations",
         icon: "fa-solid fa-earth-europe",
      },
      {
         id: 4,
         value: "4.8",
         label: isTr ? "Ortalama Memnuniyet" : "Average Rating",
         icon: "fa-solid fa-star",
      },
   ];

   const features = [
      isTr ? "Şeffaf fiyatlandırma — gizli ücret yok" : "Transparent pricing — no hidden fees",
      isTr ? "Hızlı iade ve değişiklik desteği" : "Fast refund and change support",
      isTr ? "Tüm büyük havayolları tek platformda" : "All major airlines on one platform",
      isTr ? "PNR ile anında bilet sorgulama" : "Instant ticket lookup with PNR",
   ];

   return (
      <section
         aria-label={isTr ? "Neden AtaBilet?" : "Why AtaBilet?"}
         className="bb-section bb-why bb-reveal"
         ref={sectionRef}
      >
         <div className="container">
            <div className="bb-why__grid">
               <div className="bb-why__stats">
                  {stats.map((s) => (
                     <div key={s.id} className="bb-why-stat">
                        <div className="bb-why-stat__icon" aria-hidden="true">
                           <i className={s.icon}></i>
                        </div>
                        <div className="bb-why-stat__value">{s.value}</div>
                        <div className="bb-why-stat__label">{s.label}</div>
                     </div>
                  ))}
               </div>
               <div className="bb-why__content">
                  <span className="bb-why__badge">
                     {isTr ? "Neden AtaBilet?" : "Why AtaBilet?"}
                  </span>
                  <h2 className="bb-section-title bb-why__title">
                     {isTr
                        ? "Doğru bilet, doğru fiyat, doğru destek."
                        : "The right ticket, right price, right support."}
                  </h2>
                  <p className="bb-why__desc">
                     {isTr
                        ? "AtaBilet, Türkiye'nin önde gelen seyahat platformlarından biri olarak, yolcularımıza şeffaf fiyatlandırma, kesintisiz destek ve güvenli ödeme deneyimi sunar."
                        : "AtaBilet is one of Turkey's leading travel platforms, offering transparent pricing, uninterrupted support and a secure payment experience."}
                  </p>
                  <ul className="bb-why__features" role="list">
                     {features.map((f, i) => (
                        <li key={i} className="bb-why__feature">
                           <span className="bb-why__feature-icon" aria-hidden="true">
                              <i className="fa-solid fa-check"></i>
                           </span>
                           <span>{f}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </section>
   );
};

export default WhyAtaBilet;
