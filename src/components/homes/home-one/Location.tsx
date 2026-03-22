import { useEffect, useState } from 'react';
import Image from "next/image";
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
   img: string;
}

const staticRoutes: RouteItem[] = [
   { id: 1, from: "İstanbul", fromCode: "IST", to: "Antalya", toCode: "AYT", price: "899", img: "/assets/img/location/su/destination.jpg" },
   { id: 2, from: "İstanbul", fromCode: "IST", to: "İzmir", toCode: "ADB", price: "749", img: "/assets/img/location/su/destination-2.jpg" },
   { id: 3, from: "Ankara", fromCode: "ESB", to: "İstanbul", toCode: "IST", price: "649", img: "/assets/img/location/su/destination-3.jpg" },
   { id: 4, from: "İstanbul", fromCode: "IST", to: "Trabzon", toCode: "TZX", price: "799", img: "/assets/img/location/su/destination-4.jpg" },
];

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

/** Varış şehrine göre görsel seç */
const getRouteImage = (toCode: string, index: number): string => {
   const images = [
      '/assets/img/location/su/destination.jpg',
      '/assets/img/location/su/destination-2.jpg',
      '/assets/img/location/su/destination-3.jpg',
      '/assets/img/location/su/destination-4.jpg',
   ];
   return images[index % images.length];
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
               setRoutes(data.slice(0, 4).map((r: PopularRouteDto, i: number) => ({
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
      <section aria-label={t.popularRoutes} className="tg-location-area p-relative z-index-1 pb-65 pt-120">
         <div className="container">
            <div className="text-center mb-40">
               <h2 className="tg-section-su-title text-capitalize">{t.popularRoutes}</h2>
            </div>
            <div className="bb-route-grid">
               {routes.map((route) => (
                  <Link key={route.id} href={`/?from=${route.fromCode}&to=${route.toCode}`} className="bb-route-card">
                     <div className="bb-route-card__inner">
                        <div className="bb-route-card__img-wrap">
                           <Image
                              src={route.img}
                              alt={`${route.from} - ${route.to}`}
                              className="bb-route-card__img"
                              width={400}
                              height={200}
                           />
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
               ))}
            </div>
         </div>
      </section>
   )
}

export default Location
