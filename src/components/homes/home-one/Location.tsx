import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "../../../context/LanguageContext";
import { getPopularRoutes, type PopularRouteDto } from "../../../api/lookup";
import { airports as airportData } from "../../../data/AirportData";

import 'swiper/css';
import 'swiper/css/navigation';

interface RouteItem {
   id: number;
   from: string;
   fromCode: string;
   to: string;
   toCode: string;
   price: string;
   img: string;
}

const staticRoutes: RouteItem[] = [
   { id: 1, from: "İstanbul", fromCode: "IST", to: "Antalya", toCode: "AYT", price: "899", img: "/assets/img/cities/antalya.jpg" },
   { id: 2, from: "İstanbul", fromCode: "IST", to: "İzmir", toCode: "ADB", price: "749", img: "/assets/img/cities/izmir.jpg" },
   { id: 3, from: "Ankara", fromCode: "ESB", to: "İstanbul", toCode: "IST", price: "649", img: "/assets/img/cities/istanbul.jpg" },
   { id: 4, from: "İstanbul", fromCode: "IST", to: "Trabzon", toCode: "TZX", price: "799", img: "/assets/img/cities/trabzon.jpg" },
   { id: 5, from: "İstanbul", fromCode: "IST", to: "Bodrum", toCode: "BJV", price: "949", img: "/assets/img/cities/bodrum.jpg" },
   { id: 6, from: "Ankara", fromCode: "ESB", to: "Antalya", toCode: "AYT", price: "849", img: "/assets/img/cities/antalya.jpg" },
];

const swiperSettings = {
   slidesPerView: 4,
   loop: true,
   spaceBetween: 24,
   autoplay: {
      delay: 4000,
      disableOnInteraction: false,
   },
   navigation: {
      prevEl: ".bb-route-prev",
      nextEl: ".bb-route-next",
   },
   breakpoints: {
      '1400': { slidesPerView: 4 },
      '1200': { slidesPerView: 3 },
      '768': { slidesPerView: 2 },
      '0': { slidesPerView: 1 },
   },
};

/** Havalimanı kodundan şehir ismi bul (API'den gelmezse AirportData fallback) */
const getCityName = (code: string, lang: 'tr' | 'en' = 'tr'): string => {
   const airport = airportData.find(a => a.code === code);
   if (!airport) return code;
   return lang === 'tr' ? airport.cityTr : airport.cityEn;
};

/** Varış şehrine göre görsel seç — şehir kodu eşleşmezse fallback döner */
const cityImageMap: Record<string, string> = {
   AYT: '/assets/img/cities/antalya.jpg',
   ADB: '/assets/img/cities/izmir.jpg',
   IST: '/assets/img/cities/istanbul.jpg',
   SAW: '/assets/img/cities/istanbul.jpg',
   TZX: '/assets/img/cities/trabzon.jpg',
   BJV: '/assets/img/cities/bodrum.jpg',
   ESB: '/assets/img/cities/ankara.jpg',
};

const fallbackImages = [
   '/assets/img/cities/istanbul.jpg',
   '/assets/img/cities/antalya.jpg',
   '/assets/img/cities/izmir.jpg',
   '/assets/img/cities/bodrum.jpg',
];

const getRouteImage = (toCode: string, index: number): string => {
   return cityImageMap[toCode] || fallbackImages[index % fallbackImages.length];
};

/** AtaBilet — Popüler uçuş hatları bölümü. */
const Location = () => {
   const { t, lang } = useTranslation();
   const [routes, setRoutes] = useState<RouteItem[]>(staticRoutes);
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
         { threshold: 0.06, rootMargin: "0px 0px -40px 0px" }
      );
      obs.observe(el);
      return () => obs.disconnect();
   }, []);

   useEffect(() => {
      const fetchRoutes = async () => {
         try {
            const data = await getPopularRoutes();
            if (data.length > 0) {
               setRoutes(data.map((r: PopularRouteDto, i: number) => ({
                  id: i + 1,
                  from: r.originCity && r.originCity !== r.originCode ? r.originCity : getCityName(r.originCode, lang),
                  fromCode: r.originCode,
                  to: r.destinationCity && r.destinationCity !== r.destinationCode ? r.destinationCity : getCityName(r.destinationCode, lang),
                  toCode: r.destinationCode,
                  price: String(r.displayPrice),
                  img: getRouteImage(r.destinationCode, i),
               })));
            }
         } catch {
            // API hata verirse statik fallback zaten yüklü
         }
      };
      fetchRoutes();
   }, [lang]);

   return (
      <section aria-label={t.popularRoutes} className="bb-section bb-routes-section bb-reveal" ref={sectionRef}>
         <div className="container">
            <div className="bb-routes-header">
               <h2 className="bb-section-title">{t.popularRoutes}</h2>
               <div className="bb-route-nav">
                  <button className="bb-route-prev" aria-label={t.prev || 'Önceki'}><i className="fa-solid fa-arrow-left-long"></i></button>
                  <button className="bb-route-next" aria-label={t.next || 'Sonraki'}><i className="fa-solid fa-arrow-right-long"></i></button>
               </div>
            </div>
            <Swiper {...swiperSettings} modules={[Autoplay, Navigation]} className="swiper-container">
               {routes.map((route) => (
                  <SwiperSlide key={route.id}>
                     <Link href={`/?from=${route.fromCode}&to=${route.toCode}`} className="bb-route-card">
                        <div className="bb-route-card__inner">
                           <div className="bb-route-card__img-wrap">
                              <Image
                                 src={route.img}
                                 alt={`${route.from} - ${route.to}`}
                                 className="bb-route-card__img"
                                 width={400}
                                 height={200}
                              />
                              <span className="bb-route-card__price-badge">
                                 <span className="bb-route-card__price-badge-label">{t.pricesFrom}</span>
                                 <strong>{route.price} TL</strong>
                              </span>
                           </div>
                           <div className="bb-route-card__body">
                              <div className="bb-route-card__cities">
                                 <span className="bb-route-card__city">{route.from}</span>
                                 <i className="fa-solid fa-plane bb-route-card__icon"></i>
                                 <span className="bb-route-card__city">{route.to}</span>
                              </div>
                              <div className="bb-route-card__codes">
                                 {route.fromCode} → {route.toCode}
                              </div>
                              <div className="bb-route-card__price">
                                 {t.pricesFrom} <strong>{route.price} TL</strong>{t.pricesFromSuffix}
                              </div>
                           </div>
                        </div>
                     </Link>
                  </SwiperSlide>
               ))}
            </Swiper>
         </div>
      </section>
   )
}

export default Location
