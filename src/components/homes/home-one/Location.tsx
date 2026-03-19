import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import Link from "next/link";
import { useTranslation } from "../../../context/LanguageContext";
import { getPopularRoutes, type PopularRouteDto } from "../../../api/lookup";

interface RouteItem {
   id: number;
   from: string;
   fromCode: string;
   to: string;
   toCode: string;
   price: string;
}

const staticRoutes: RouteItem[] = [
   { id: 1, from: "İstanbul", fromCode: "IST", to: "Antalya", toCode: "AYT", price: "899" },
   { id: 2, from: "İstanbul", fromCode: "IST", to: "İzmir", toCode: "ADB", price: "749" },
   { id: 3, from: "Ankara", fromCode: "ESB", to: "İstanbul", toCode: "IST", price: "649" },
   { id: 4, from: "İstanbul", fromCode: "IST", to: "Trabzon", toCode: "TZX", price: "799" },
   { id: 5, from: "İstanbul", fromCode: "IST", to: "Bodrum", toCode: "BJV", price: "949" },
   { id: 6, from: "Ankara", fromCode: "ESB", to: "Antalya", toCode: "AYT", price: "849" },
];

const setting = {
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

/** Havalimanı kodundan şehir ismi bul (API'den gelmezse fallback) */
const getCityName = (code: string, lang: 'tr' | 'en' = 'tr'): string => {
   const fallbackTr: Record<string, string> = {
      'IST': 'İstanbul', 'SAW': 'İstanbul', 'ESB': 'Ankara', 'AYT': 'Antalya',
      'ADB': 'İzmir', 'TZX': 'Trabzon', 'BJV': 'Bodrum', 'DLM': 'Dalaman',
      'GZT': 'Gaziantep', 'ADA': 'Adana', 'VAN': 'Van', 'ERZ': 'Erzurum',
      'DIY': 'Diyarbakır', 'SZF': 'Samsun', 'KYA': 'Konya',
   };
   const fallbackEn: Record<string, string> = {
      'IST': 'Istanbul', 'SAW': 'Istanbul', 'ESB': 'Ankara', 'AYT': 'Antalya',
      'ADB': 'Izmir', 'TZX': 'Trabzon', 'BJV': 'Bodrum', 'DLM': 'Dalaman',
      'GZT': 'Gaziantep', 'ADA': 'Adana', 'VAN': 'Van', 'ERZ': 'Erzurum',
      'DIY': 'Diyarbakir', 'SZF': 'Samsun', 'KYA': 'Konya',
   };
   return (lang === 'tr' ? fallbackTr[code] : fallbackEn[code]) || code;
};

/** AtaBilet — Popüler uçuş hatları bölümü. */
const Location = () => {
   const { t, lang } = useTranslation();
   const [routes, setRoutes] = useState<RouteItem[]>(staticRoutes);

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
               })));
            }
         } catch {
            // API hata verirse statik fallback zaten yüklü
         }
      };
      fetchRoutes();
   }, [lang]);

   return (
      <section aria-label={t.popularRoutes} className="tg-location-area p-relative z-index-1 pb-65 pt-120">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-9">
                  <div className="tg-location-section-title mb-30">
                     <h2 className="tg-section-su-title text-capitalize">{t.popularRoutes}</h2>
                  </div>
               </div>
               <div className="col-lg-3">
                  <div className="tg-listing-5-slider-navigation tg-location-su-slider-navigation text-end mb-30">
                     <button className="bb-route-prev" aria-label={t.prev}><i className="fa-solid fa-arrow-left-long"></i></button>
                     <button className="bb-route-next" aria-label={t.next}><i className="fa-solid fa-arrow-right-long"></i></button>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12">
                  <Swiper {...setting} modules={[Autoplay, Navigation]} className="swiper-container">
                     {routes.map((route) => (
                        <SwiperSlide key={route.id}>
                           <Link href={`/?from=${route.fromCode}&to=${route.toCode}`} className="bb-route-card mb-30">
                              <div className="bb-route-card__inner">
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
                           </Link>
                        </SwiperSlide>
                     ))}
                  </Swiper>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Location
